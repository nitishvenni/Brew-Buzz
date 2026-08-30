import pytest
from fastapi.testclient import TestClient
from datetime import datetime, timedelta, timezone
from decimal import Decimal

from app.main import app
from app.core.database import Base
from app.models.domain import Franchise, Outlet, Category, Product, Order, OrderItem
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool
from app.core.database import get_db

SQLALCHEMY_DATABASE_URL = "sqlite:///:memory:"

engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}, poolclass=StaticPool)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

client = TestClient(app)

def override_get_db():
    try:
        db = TestingSessionLocal()
        yield db
    finally:
        db.close()

@pytest.fixture(autouse=True)
def setup_db():
    app.dependency_overrides[get_db] = override_get_db
    Base.metadata.create_all(bind=engine)
    
    # Seed data
    db = TestingSessionLocal()
    franchise = Franchise(name="Test Franchise")
    db.add(franchise)
    db.commit()
    
    outlet1 = Outlet(franchise_id=franchise.id, name="Outlet 1", city="City 1")
    outlet2 = Outlet(franchise_id=franchise.id, name="Outlet 2", city="City 2")
    db.add_all([outlet1, outlet2])
    db.commit()
    
    cat1 = Category(name="Pizza")
    cat2 = Category(name="Coffee")
    db.add_all([cat1, cat2])
    db.commit()
    
    prod1 = Product(category_id=cat1.id, name="Margherita", price=10.00)
    prod2 = Product(category_id=cat2.id, name="Espresso", price=3.00)
    db.add_all([prod1, prod2])
    db.commit()
    
    now = datetime.now(timezone.utc)
    # Order 1 (Outlet 1, Pizza + Coffee)
    o1 = Order(outlet_id=outlet1.id, total_amount=13.00, order_timestamp=now)
    db.add(o1)
    db.commit()
    
    db.add_all([
        OrderItem(order_id=o1.id, product_id=prod1.id, quantity=1, unit_price=10.00, subtotal=10.00),
        OrderItem(order_id=o1.id, product_id=prod2.id, quantity=1, unit_price=3.00, subtotal=3.00)
    ])
    
    # Order 2 (Outlet 2, 2x Coffee)
    o2 = Order(outlet_id=outlet2.id, total_amount=6.00, order_timestamp=now - timedelta(days=1))
    db.add(o2)
    db.commit()
    
    db.add(OrderItem(order_id=o2.id, product_id=prod2.id, quantity=2, unit_price=3.00, subtotal=6.00))
    db.commit()
    
    yield
    
    Base.metadata.drop_all(bind=engine)
    app.dependency_overrides.clear()

def test_summary_analytics():
    response = client.get("/api/v1/analytics/summary")
    assert response.status_code == 200
    data = response.json()
    assert data["revenue"] == "19.00" # 13.00 + 6.00
    assert data["order_count"] == 2
    assert data["units_sold"] == 4 # 1 + 1 + 2
    assert data["aov"] == "9.50" # 19 / 2

def test_outlet_performance():
    response = client.get("/api/v1/analytics/outlets")
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 2
    outlet1 = next(o for o in data if o["outlet_name"] == "Outlet 1")
    assert outlet1["revenue"] == "13.00"
    
def test_category_performance():
    response = client.get("/api/v1/analytics/categories")
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 2
    pizza = next(c for c in data if c["category_name"] == "Pizza")
    assert pizza["revenue"] == "10.00"
    
def test_comparison():
    now = datetime.now(timezone.utc)
    current_start = (now - timedelta(hours=1)).isoformat()
    current_end = (now + timedelta(hours=1)).isoformat()
    prev_start = (now - timedelta(days=1, hours=1)).isoformat()
    prev_end = (now - timedelta(hours=23)).isoformat()
    
    response = client.get(
        "/api/v1/analytics/comparison",
        params={
            "current_start": current_start,
            "current_end": current_end,
            "prev_start": prev_start,
            "prev_end": prev_end
        }
    )
    assert response.status_code == 200
    data = response.json()
    assert data["current_revenue"] == "13.00"
    assert data["previous_revenue"] == "6.00"
    assert data["absolute_change"] == "7.00"
    assert data["direction"] == "increase"
