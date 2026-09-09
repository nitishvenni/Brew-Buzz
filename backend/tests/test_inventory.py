import pytest
from datetime import datetime, timedelta, timezone
from decimal import Decimal
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool
from sqlalchemy.exc import IntegrityError
from fastapi.testclient import TestClient

from app.main import app
from app.core.database import Base, get_db
from app.models.domain import (
    Franchise, Outlet, Category, Product, Order, OrderItem,
    Ingredient, RecipeItem, InventoryItem, InventoryTransaction,
    TRANSACTION_PURCHASE, TRANSACTION_CONSUMPTION, TRANSACTION_WASTAGE, TRANSACTION_ADJUSTMENT,
)
from app.analytics.inventory import (
    average_daily_consumption,
    days_until_stockout,
    consumption_growth,
    wastage_rate,
    classify_stock_status,
    reorder_recommendation,
    compare_inventory_to_sales,
    generate_item_strengths_weaknesses,
    STATUS_CRITICAL, STATUS_LOW, STATUS_WATCH, STATUS_HEALTHY, STATUS_OVERSTOCK,
    PRIORITY_URGENT, PRIORITY_HIGH, PRIORITY_MEDIUM, PRIORITY_LOW, PRIORITY_NONE,
)

# --- Test Database Setup ---
SQLALCHEMY_DATABASE_URL = "sqlite:///:memory:"
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}, poolclass=StaticPool)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def override_get_db():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()

app.dependency_overrides[get_db] = override_get_db
client = TestClient(app)

@pytest.fixture(autouse=True)
def setup_db():
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    db = TestingSessionLocal()
    
    # 1 Franchise
    franchise = Franchise(name="Test Franchise")
    db.add(franchise)
    db.commit()
    
    # 2 Outlets
    outlet1 = Outlet(name="Test Downtown", city="Downtown", franchise_id=franchise.id)
    outlet2 = Outlet(name="Test Mall", city="Mall", franchise_id=franchise.id)
    db.add_all([outlet1, outlet2])
    db.commit()
    
    # 1 Category
    category = Category(name="Pizza")
    db.add(category)
    db.commit()
    
    # 1 Product
    product = Product(name="Test Pizza", price=Decimal("10.00"), category_id=category.id)
    db.add(product)
    db.commit()
    
    # 1 Ingredient
    ingredient = Ingredient(name="Test Cheese", category="Dairy", unit="kg", unit_cost=Decimal("450.00"))
    db.add(ingredient)
    db.commit()
    
    # 1 RecipeItem
    recipe_item = RecipeItem(product_id=product.id, ingredient_id=ingredient.id, quantity_required=Decimal("0.15"), unit="kg")
    db.add(recipe_item)
    db.commit()
    
    # 2 InventoryItems
    item1 = InventoryItem(
        outlet_id=outlet1.id, 
        ingredient_id=ingredient.id, 
        current_quantity=Decimal("5.0"), 
        reorder_level=Decimal("2.0"), 
        safety_stock=Decimal("1.0"), 
        supplier_lead_time_days=3
    )
    item2 = InventoryItem(
        outlet_id=outlet2.id, 
        ingredient_id=ingredient.id, 
        current_quantity=Decimal("0.5"), 
        reorder_level=Decimal("2.0"), 
        safety_stock=Decimal("1.0"), 
        supplier_lead_time_days=3
    )
    db.add_all([item1, item2])
    db.commit()
    
    # InventoryTransactions for Downtown's item (item1)
    now = datetime.now(timezone.utc)
    for i in range(10):
        t = InventoryTransaction(
            inventory_item_id=item1.id,
            transaction_type=TRANSACTION_CONSUMPTION,
            quantity=Decimal("-0.3"),
            created_at=now - timedelta(days=i)
        )
        db.add(t)
    
    for i in range(2):
        t = InventoryTransaction(
            inventory_item_id=item1.id,
            transaction_type=TRANSACTION_WASTAGE,
            quantity=Decimal("-0.1"),
            created_at=now - timedelta(days=i)
        )
        db.add(t)
        
    t = InventoryTransaction(
        inventory_item_id=item1.id,
        transaction_type=TRANSACTION_PURCHASE,
        quantity=Decimal("5.0"),
        created_at=now - timedelta(days=1)
    )
    db.add(t)
    db.commit()
    
    # Orders and OrderItems
    order = Order(outlet_id=outlet1.id, total_amount=Decimal("20.00"), status="completed")
    db.add(order)
    db.commit()
    
    order_item1 = OrderItem(order_id=order.id, product_id=product.id, quantity=2, unit_price=Decimal("10.00"), subtotal=Decimal("20.00"))
    db.add(order_item1)
    db.commit()

    db.close()
    
    yield
    
    Base.metadata.drop_all(bind=engine)

# ### Analytics Unit Tests

def test_average_daily_consumption():
    assert average_daily_consumption(3.0, 10) == 0.3

def test_average_daily_consumption_zero_days():
    assert average_daily_consumption(3.0, 0) == 0.0

def test_average_daily_consumption_zero_total():
    assert average_daily_consumption(0.0, 10) == 0.0

def test_days_until_stockout():
    assert days_until_stockout(5.0, 0.5) == 10.0

def test_days_until_stockout_zero_consumption():
    assert days_until_stockout(5.0, 0.0) is None

def test_days_until_stockout_zero_stock():
    assert days_until_stockout(0.0, 0.5) == 0.0

def test_consumption_growth_normal():
    assert consumption_growth(100.0, 50.0) == 100.0

def test_consumption_growth_zero_previous():
    assert consumption_growth(100.0, 0.0) == 100.0

def test_consumption_growth_both_zero():
    assert consumption_growth(0.0, 0.0) == 0.0

def test_wastage_rate_normal():
    assert wastage_rate(20.0, 80.0) == 20.0

def test_wastage_rate_zero_denominator():
    assert wastage_rate(0.0, 0.0) == 0.0

def test_classify_stock_status_critical():
    assert classify_stock_status(2.0) == STATUS_CRITICAL

def test_classify_stock_status_low():
    assert classify_stock_status(5.0) == STATUS_LOW

def test_classify_stock_status_watch():
    assert classify_stock_status(10.0) == STATUS_WATCH

def test_classify_stock_status_healthy():
    assert classify_stock_status(20.0) == STATUS_HEALTHY

def test_classify_stock_status_overstock():
    assert classify_stock_status(40.0) == STATUS_OVERSTOCK

def test_classify_stock_status_none():
    assert classify_stock_status(None) == STATUS_HEALTHY

def test_reorder_recommendation_critical():
    # avg_daily=0.5, lead_time=3, safety=1.0, current=0.5
    # required = 3 * 0.5 + 1.0 = 2.5
    # to_order = 2.5 - 0.5 = 2.0
    rec = reorder_recommendation(0.5, 3, 1.0, 0.5)
    assert rec["priority"] == PRIORITY_URGENT
    assert rec["recommended_quantity"] == 2.0

def test_reorder_recommendation_overstock():
    # avg_daily=0.5, lead_time=3, safety=1.0, current=20.0
    rec = reorder_recommendation(0.5, 3, 1.0, 20.0)
    assert rec["priority"] == PRIORITY_NONE
    assert rec["recommended_quantity"] == 0.0

def test_reorder_recommendation_negative_clamp():
    # current=10.0 => clamped to 0
    rec = reorder_recommendation(0.5, 3, 1.0, 10.0)
    assert rec["recommended_quantity"] == 0.0

def test_compare_inventory_normal():
    res = compare_inventory_to_sales(100.0, 100.0)
    assert res["label"] == "NORMAL"
    
def test_compare_inventory_above():
    res = compare_inventory_to_sales(100.0, 130.0) # Expected 100, Actual 130 -> 30% above
    assert res["label"] == "ABOVE_EXPECTED"

def test_compare_inventory_insufficient():
    res = compare_inventory_to_sales(0.0, 10.0)
    assert res["label"] == "INSUFFICIENT_DATA"


# ### API Endpoint Tests

def test_inventory_summary():
    response = client.get("/api/v1/inventory/summary?outlet_id=1")
    assert response.status_code == 200
    data = response.json()
    assert "total_items" in data

def test_inventory_items():
    response = client.get("/api/v1/inventory/items?outlet_id=1")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) > 0

def test_inventory_items_status_filter():
    response = client.get("/api/v1/inventory/items?outlet_id=2&status=CRITICAL")
    assert response.status_code == 200

def test_inventory_alerts():
    response = client.get("/api/v1/inventory/alerts?outlet_id=2")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)

def test_inventory_recommendations():
    response = client.get("/api/v1/inventory/recommendations?outlet_id=2")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)

def test_inventory_item_detail():
    response = client.get("/api/v1/inventory/items/1")
    assert response.status_code == 200
    data = response.json()
    assert data["id"] == 1

def test_inventory_item_detail_not_found():
    response = client.get("/api/v1/inventory/items/999")
    assert response.status_code == 404

def test_inventory_trends():
    response = client.get("/api/v1/inventory/trends?outlet_id=1")
    assert response.status_code == 200

def test_inventory_item_history():
    response = client.get("/api/v1/inventory/items/1/history")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)


# ### Database Constraint Tests

def test_unique_outlet_ingredient_constraint():
    db = TestingSessionLocal()
    try:
        dup_item = InventoryItem(
            outlet_id=1, 
            ingredient_id=1, 
            current_quantity=Decimal("1.0"), 
            reorder_level=Decimal("1.0"), 
            safety_stock=Decimal("1.0"), 
            supplier_lead_time_days=1
        )
        db.add(dup_item)
        db.commit()
    except IntegrityError:
        db.rollback()
        assert True
    else:
        assert False, "IntegrityError not raised for duplicate (outlet_id, ingredient_id)"
    finally:
        db.close()

def test_inventory_relationships():
    db = TestingSessionLocal()
    try:
        item = db.query(InventoryItem).filter(InventoryItem.id == 1).first()
        assert item is not None
        assert item.ingredient is not None
        assert item.ingredient.name == "Test Cheese"
        assert item.outlet is not None
        assert item.outlet.name == "Test Downtown"
        assert len(item.transactions) > 0
    finally:
        db.close()
