import pytest
from fastapi.testclient import TestClient
from datetime import datetime, timedelta, timezone
from decimal import Decimal
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.main import app
from app.core.database import Base, get_db
from app.models.domain import (
    Franchise, Outlet, Category, Product, Order, OrderItem,
    Ingredient, RecipeItem, InventoryItem, InventoryTransaction,
    Role, Employee, Shift
)

SQLALCHEMY_DATABASE_URL = "sqlite:///:memory:"
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}, poolclass=StaticPool)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def override_get_db():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()

@pytest.fixture(autouse=True)
def isolate_db_override():
    app.dependency_overrides[get_db] = override_get_db
    yield
    app.dependency_overrides.clear()

@pytest.fixture(autouse=True)
def setup_db():
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    session = TestingSessionLocal()
    
    f = Franchise(name="Test Franchise")
    session.add(f)
    session.commit()
    o = Outlet(franchise_id=f.id, name="Test Outlet", city="Test City")
    session.add(o)
    session.commit()
    
    c = Category(name="Test Category")
    session.add(c)
    session.commit()
    p1 = Product(category_id=c.id, name="Pepperoni Pizza", price=Decimal("15.00"))
    p2 = Product(category_id=c.id, name="Cheese Pizza", price=Decimal("12.00"))
    session.add_all([p1, p2])
    session.commit()
    
    now = datetime.now(timezone.utc)
    
    # Previous period order (so we have a baseline to measure growth)
    prev = now - timedelta(days=10)
    prev_order = Order(outlet_id=o.id, order_timestamp=prev, total_amount=Decimal("3.00"), status="completed")
    session.add(prev_order)
    session.commit()
    session.add(OrderItem(order_id=prev_order.id, product_id=p1.id, quantity=1, unit_price=Decimal("3.00"), subtotal=Decimal("3.00")))
    
    # 5 orders for p1 in current period to show SURGING signal
    for _ in range(5):
        order = Order(outlet_id=o.id, order_timestamp=now, total_amount=Decimal("15.00"), status="completed")
        session.add(order)
        session.commit()
        session.add(OrderItem(order_id=order.id, product_id=p1.id, quantity=1, unit_price=Decimal("15.00"), subtotal=Decimal("15.00")))
        
    ing = Ingredient(name="Pepperoni", category="Meat", unit="kg", unit_cost=Decimal("10.00"))
    session.add(ing)
    session.commit()
    session.add(RecipeItem(product_id=p1.id, ingredient_id=ing.id, quantity_required=Decimal("0.1"), unit="kg"))
    
    # Critical inventory condition
    inv_item = InventoryItem(outlet_id=o.id, ingredient_id=ing.id, current_quantity=Decimal("0.5"), reorder_level=Decimal("5.0"), safety_stock=Decimal("2.0"))
    session.add(inv_item)
    session.commit()
    
    # Add consumption so average_daily_consumption > 0 and days_remaining < 3
    session.add(InventoryTransaction(inventory_item_id=inv_item.id, transaction_type="CONSUMPTION", quantity=Decimal("-5.0"), created_at=now-timedelta(days=1)))
    session.commit()
    
    r = Role(name="Staff")
    session.add(r)
    session.commit()
    e = Employee(employee_code="E001", name="Test Emp", role_id=r.id, outlet_id=o.id, hire_date=now)
    session.add(e)
    session.commit()
    # High overtime shift
    session.add(Shift(employee_id=e.id, outlet_id=o.id, shift_date=now, scheduled_start=now, scheduled_end=now+timedelta(hours=4), actual_start=now, actual_end=now+timedelta(hours=12), status="COMPLETED"))
    session.commit()

    # Setup Outlet 2 for poor performance signals
    o2 = Outlet(franchise_id=f.id, name="Underperforming Outlet", city="Test City 2")
    session.add(o2)
    session.commit()

    prev_order2 = Order(outlet_id=o2.id, order_timestamp=prev, total_amount=Decimal("100.00"), status="completed")
    session.add(prev_order2)
    session.commit()
    session.add(OrderItem(order_id=prev_order2.id, product_id=p1.id, quantity=1, unit_price=Decimal("100.00"), subtotal=Decimal("100.00")))
    
    order2 = Order(outlet_id=o2.id, order_timestamp=now, total_amount=Decimal("10.00"), status="completed")
    session.add(order2)
    session.commit()
    session.add(OrderItem(order_id=order2.id, product_id=p1.id, quantity=1, unit_price=Decimal("10.00"), subtotal=Decimal("10.00")))
    
    inv_item2 = InventoryItem(outlet_id=o2.id, ingredient_id=ing.id, current_quantity=Decimal("0.5"), reorder_level=Decimal("5.0"), safety_stock=Decimal("2.0"))
    session.add(inv_item2)
    session.commit()
    session.add(InventoryTransaction(inventory_item_id=inv_item2.id, transaction_type="CONSUMPTION", quantity=Decimal("-5.0"), created_at=now-timedelta(days=1)))
    session.commit()

    e2 = Employee(employee_code="E002", name="Test Emp 2", role_id=r.id, outlet_id=o2.id, hire_date=now)
    session.add(e2)
    session.commit()
    session.add(Shift(employee_id=e2.id, outlet_id=o2.id, shift_date=now, scheduled_start=now, scheduled_end=now+timedelta(hours=4), actual_start=now, actual_end=now+timedelta(hours=12), status="COMPLETED"))
    session.commit()
    session.close()

client = TestClient(app)

def _fmt(dt: datetime) -> str:
    return dt.strftime("%Y-%m-%dT%H:%M:%S.000Z")

def test_get_snapshot():
    now = datetime.now(timezone.utc)
    res = client.get(f"/api/v1/audit/snapshot?start_date={_fmt(now-timedelta(days=7))}&end_date={_fmt(now+timedelta(minutes=1))}")
    assert res.status_code == 200
    data = res.json()
    assert data["outlet_metrics"]["revenue"] == 85.0
    assert data["inventory_metrics"]["critical_items"] > 0

def test_get_consolidated_alerts():
    now = datetime.now(timezone.utc)
    res = client.get(f"/api/v1/audit/alerts?start_date={_fmt(now-timedelta(days=7))}&end_date={_fmt(now+timedelta(minutes=1))}")
    assert res.status_code == 200
    alerts = res.json()
    domains = [a["domain"] for a in alerts]
    assert "inventory" in domains
    assert "workforce" in domains
    assert "outlet" in domains
    
def test_get_signals():
    now = datetime.now(timezone.utc)
    # Test Franchise Level
    res = client.get(f"/api/v1/audit/signals?start_date={_fmt(now-timedelta(days=7))}&end_date={_fmt(now+timedelta(minutes=1))}")
    assert res.status_code == 200
    signals = res.json()
    types = [s["signal_type"] for s in signals]
    assert "PERFORMANCE_INVENTORY_ISSUE" in types
    assert "PERFORMANCE_WORKFORCE_ISSUE" in types
    
    # Test Outlet 1 Level (Surging Demand)
    res_o1 = client.get(f"/api/v1/audit/signals?start_date={_fmt(now-timedelta(days=7))}&end_date={_fmt(now+timedelta(minutes=1))}&outlet_id=1")
    signals_o1 = res_o1.json()
    types_o1 = [s["signal_type"] for s in signals_o1]
    assert "DEMAND_INVENTORY_MISMATCH" in types_o1
    assert "DEMAND_WORKLOAD_PRESSURE" in types_o1
    
    for s in signals + signals_o1:
        assert "cause" not in s["description"].lower()
        assert "structured_evidence" in s
        assert isinstance(s["structured_evidence"], list)
        assert len(s["structured_evidence"]) > 0
        
        # Verify specific evidence shapes and deterministic values
        for ev in s["structured_evidence"]:
            assert "domain" in ev
            assert "title" in ev
            assert "metrics" in ev
            for m in ev["metrics"]:
                assert "label" in m
                assert "value" in m

        # Signal-specific assertions
        if s["signal_type"] == "DEMAND_INVENTORY_MISMATCH":
            marketing_ev = next(e for e in s["structured_evidence"] if e["domain"] == "marketing")
            inv_ev = next(e for e in s["structured_evidence"] if e["domain"] == "inventory")
            assert any(m["label"] == "Products" for m in marketing_ev["metrics"])
            assert any(m["label"] == "Ingredient" for m in inv_ev["metrics"])
            # Values are actually derived:
            stock_status = next(m["value"] for m in inv_ev["metrics"] if m["label"] == "Stock Status")
            assert stock_status in ["CRITICAL", "LOW"]
            
        elif s["signal_type"] == "DEMAND_WORKLOAD_PRESSURE":
            marketing_ev = next(e for e in s["structured_evidence"] if e["domain"] == "marketing")
            wf_ev = next(e for e in s["structured_evidence"] if e["domain"] == "workforce")
            assert any(m["label"] == "Signal" and m["value"] in ["SURGING", "GROWING"] for m in marketing_ev["metrics"])
            assert any(m["label"] == "Status" and m["value"] in ["ATTENTION", "WATCH"] for m in wf_ev["metrics"])
            
        elif s["signal_type"] == "PERFORMANCE_WORKFORCE_ISSUE":
            outlet_ev = next(e for e in s["structured_evidence"] if e["domain"] == "outlet")
            wf_ev = next(e for e in s["structured_evidence"] if e["domain"] == "workforce")
            assert any(m["label"] == "Score" for m in outlet_ev["metrics"])
            assert any(m["label"] == "Status" and m["value"] in ["ATTENTION", "WATCH"] for m in wf_ev["metrics"])
            
        elif s["signal_type"] == "PERFORMANCE_INVENTORY_ISSUE":
            outlet_ev = next(e for e in s["structured_evidence"] if e["domain"] == "outlet")
            inv_ev = next(e for e in s["structured_evidence"] if e["domain"] == "inventory")
            assert any(m["label"] == "Score" for m in outlet_ev["metrics"])
            assert any(m["label"] == "Critical Items" and m["value"] > 0 for m in inv_ev["metrics"])


def test_compare_outlets():
    now = datetime.now(timezone.utc)
    res = client.get(f"/api/v1/audit/outlets/1?start_date={_fmt(now-timedelta(days=7))}&end_date={_fmt(now+timedelta(minutes=1))}")
    assert res.status_code == 200
    data = res.json()
    assert data["outlet_name"] == "Test Outlet"
    assert "inventory_attention" in data
    assert "workforce_attention" in data

def test_invalid_dates():
    now = datetime.now(timezone.utc)
    res = client.get(f"/api/v1/audit/snapshot?start_date={_fmt(now+timedelta(minutes=1))}&end_date={_fmt(now-timedelta(days=7))}")
    assert res.status_code == 400

def test_missing_dates():
    res = client.get(f"/api/v1/audit/snapshot")
    assert res.status_code == 422
def test_demand_inventory_mismatch_negative_healthy_stock():
    db = next(override_get_db())
    now = datetime.now(timezone.utc)
    
    o3 = Outlet(franchise_id=1, name="Healthy Inv Outlet", city="City 3")
    db.add(o3)
    db.commit()
    
    p3 = Product(category_id=1, name="Veggie Pizza", price=Decimal("15.00"))
    db.add(p3)
    db.commit()
    
    prev_order = Order(outlet_id=o3.id, order_timestamp=now-timedelta(days=10), total_amount=Decimal("3.00"), status="completed")
    db.add(prev_order)
    db.commit()
    db.add(OrderItem(order_id=prev_order.id, product_id=p3.id, quantity=1, unit_price=Decimal("3.0"), subtotal=Decimal("3.0")))
    
    for _ in range(5):
        order = Order(outlet_id=o3.id, order_timestamp=now, total_amount=Decimal("15.00"), status="completed")
        db.add(order)
        db.commit()
        db.add(OrderItem(order_id=order.id, product_id=p3.id, quantity=1, unit_price=Decimal("15.0"), subtotal=Decimal("15.0")))
    db.commit()
    
    ing3 = Ingredient(name="Veggies", category="Veg", unit="kg", unit_cost=Decimal("2.00"))
    db.add(ing3)
    db.commit()
    db.add(RecipeItem(product_id=p3.id, ingredient_id=ing3.id, quantity_required=Decimal("0.1"), unit="kg"))
    db.commit()
    
    # Healthy inventory (no consumption history -> infinite days)
    inv3 = InventoryItem(outlet_id=o3.id, ingredient_id=ing3.id, current_quantity=Decimal("50.0"), reorder_level=Decimal("5.0"), safety_stock=Decimal("2.0"))
    db.add(inv3)
    db.commit()
    
    res = client.get(f"/api/v1/audit/signals?start_date={_fmt(now-timedelta(days=7))}&end_date={_fmt(now+timedelta(minutes=1))}&outlet_id={o3.id}")
    assert res.status_code == 200
    signals = res.json()
    types = [s["signal_type"] for s in signals]
    assert "DEMAND_INVENTORY_MISMATCH" not in types

def test_demand_workload_pressure_negative_healthy_workforce():
    db = next(override_get_db())
    now = datetime.now(timezone.utc)
    
    o4 = Outlet(franchise_id=1, name="Healthy WF Outlet", city="City 4")
    db.add(o4)
    db.commit()
    
    prev_order = Order(outlet_id=o4.id, order_timestamp=now-timedelta(days=10), total_amount=Decimal("3.00"), status="completed")
    db.add(prev_order)
    db.commit()
    
    for _ in range(5):
        order = Order(outlet_id=o4.id, order_timestamp=now, total_amount=Decimal("15.00"), status="completed")
        db.add(order)
    db.commit()
    
    e4 = Employee(employee_code="E004", name="Emp 4", role_id=1, outlet_id=o4.id, hire_date=now)
    db.add(e4)
    db.commit()
    # Healthy shift (exactly 8 hours, no overtime)
    db.add(Shift(employee_id=e4.id, outlet_id=o4.id, shift_date=now, scheduled_start=now, scheduled_end=now+timedelta(hours=8), actual_start=now, actual_end=now+timedelta(hours=8), status="COMPLETED"))
    db.commit()
    
    res = client.get(f"/api/v1/audit/signals?start_date={_fmt(now-timedelta(days=7))}&end_date={_fmt(now+timedelta(minutes=1))}&outlet_id={o4.id}")
    signals = res.json()
    types = [s["signal_type"] for s in signals]
    assert "DEMAND_WORKLOAD_PRESSURE" not in types

def test_performance_inventory_issue_negative_healthy_inventory():
    db = next(override_get_db())
    now = datetime.now(timezone.utc)
    
    # Poor performance outlet
    o5 = Outlet(franchise_id=1, name="Poor Perf Healthy Inv", city="City 5")
    db.add(o5)
    db.commit()
    
    prev_order = Order(outlet_id=o5.id, order_timestamp=now-timedelta(days=10), total_amount=Decimal("100.00"), status="completed")
    db.add(prev_order)
    order = Order(outlet_id=o5.id, order_timestamp=now, total_amount=Decimal("10.00"), status="completed")
    db.add(order)
    db.commit()
    
    # Healthy inventory
    inv5 = InventoryItem(outlet_id=o5.id, ingredient_id=1, current_quantity=Decimal("50.0"), reorder_level=Decimal("5.0"), safety_stock=Decimal("2.0"))
    db.add(inv5)
    db.commit()
    
    res = client.get(f"/api/v1/audit/signals?start_date={_fmt(now-timedelta(days=7))}&end_date={_fmt(now+timedelta(minutes=1))}&outlet_id={o5.id}")
    signals = res.json()
    types = [s["signal_type"] for s in signals]
    assert "PERFORMANCE_INVENTORY_ISSUE" not in types

def test_performance_workforce_issue_negative_healthy_workforce():
    db = next(override_get_db())
    now = datetime.now(timezone.utc)
    
    o6 = Outlet(franchise_id=1, name="Poor Perf Healthy WF", city="City 6")
    db.add(o6)
    db.commit()
    
    prev_order = Order(outlet_id=o6.id, order_timestamp=now-timedelta(days=10), total_amount=Decimal("100.00"), status="completed")
    db.add(prev_order)
    order = Order(outlet_id=o6.id, order_timestamp=now, total_amount=Decimal("10.00"), status="completed")
    db.add(order)
    db.commit()
    
    e6 = Employee(employee_code="E006", name="Emp 6", role_id=1, outlet_id=o6.id, hire_date=now)
    db.add(e6)
    db.commit()
    db.add(Shift(employee_id=e6.id, outlet_id=o6.id, shift_date=now, scheduled_start=now, scheduled_end=now+timedelta(hours=8), actual_start=now, actual_end=now+timedelta(hours=8), status="COMPLETED"))
    db.commit()
    
    res = client.get(f"/api/v1/audit/signals?start_date={_fmt(now-timedelta(days=7))}&end_date={_fmt(now+timedelta(minutes=1))}&outlet_id={o6.id}")
    signals = res.json()
    types = [s["signal_type"] for s in signals]
    assert "PERFORMANCE_WORKFORCE_ISSUE" not in types

def test_edge_cases():
    now = datetime.now(timezone.utc)
    
    # Future period
    future = now + timedelta(days=365)
    res = client.get(f"/api/v1/audit/snapshot?start_date={_fmt(future)}&end_date={_fmt(future+timedelta(days=1))}")
    assert res.status_code == 200
    data = res.json()
    # Should not crash on empty data, zero denominator etc.
    assert data["outlet_metrics"]["revenue"] == 0.0
    
    # Same day period
    res = client.get(f"/api/v1/audit/snapshot?start_date={_fmt(now)}&end_date={_fmt(now)}")
    assert res.status_code == 200
    data = res.json()
    assert "revenue" in data["outlet_metrics"]

def test_determinism():
    now = datetime.now(timezone.utc)
    res1 = client.get(f"/api/v1/audit/snapshot?start_date={_fmt(now-timedelta(days=7))}&end_date={_fmt(now+timedelta(minutes=1))}")
    res2 = client.get(f"/api/v1/audit/snapshot?start_date={_fmt(now-timedelta(days=7))}&end_date={_fmt(now+timedelta(minutes=1))}")
    assert res1.json() == res2.json()

def test_unknown_outlet():
    now = datetime.now(timezone.utc)
    res = client.get(f"/api/v1/audit/outlets/9999?start_date={_fmt(now-timedelta(days=7))}&end_date={_fmt(now+timedelta(minutes=1))}")
    assert res.status_code == 404

def test_no_signals():
    now = datetime.now(timezone.utc)
    future = now + timedelta(days=365)
    res = client.get(f"/api/v1/audit/signals?start_date={_fmt(future)}&end_date={_fmt(future+timedelta(days=1))}")
    assert res.status_code == 200
    types = [s["signal_type"] for s in res.json()]
    assert "DEMAND_INVENTORY_MISMATCH" not in types
