import pytest
from datetime import datetime, timedelta, timezone
from decimal import Decimal
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.core.database import Base, get_db
from app.main import app
from app.models.domain import (
    Franchise, Outlet, Category, Product, Order, OrderItem,
    Ingredient, RecipeItem, InventoryItem, InventoryTransaction,
    Role, Employee, Shift
)
from app.agents.audit.tools import (
    get_franchise_health_tool,
    get_franchise_alerts_tool,
    get_cross_domain_signals_tool,
    compare_outlet_domains_tool,
    get_franchise_trends_tool
)
from app.schemas.audit_agent import AuditAgentRequest, AuditAgentResponse

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
    session.add(p1)
    session.commit()
    
    now = datetime.now(timezone.utc)
    
    prev = now - timedelta(days=10)
    prev_order = Order(outlet_id=o.id, order_timestamp=prev, total_amount=Decimal("3.00"), status="completed")
    session.add(prev_order)
    session.commit()
    session.add(OrderItem(order_id=prev_order.id, product_id=p1.id, quantity=1, unit_price=Decimal("3.00"), subtotal=Decimal("3.00")))
    
    for _ in range(5):
        order = Order(outlet_id=o.id, order_timestamp=now, total_amount=Decimal("15.00"), status="completed")
        session.add(order)
        session.commit()
        session.add(OrderItem(order_id=order.id, product_id=p1.id, quantity=1, unit_price=Decimal("15.00"), subtotal=Decimal("15.00")))
        
    ing = Ingredient(name="Pepperoni", category="Meat", unit="kg", unit_cost=Decimal("10.00"))
    session.add(ing)
    session.commit()
    session.add(RecipeItem(product_id=p1.id, ingredient_id=ing.id, quantity_required=Decimal("0.1"), unit="kg"))
    
    inv_item = InventoryItem(outlet_id=o.id, ingredient_id=ing.id, current_quantity=Decimal("0.5"), reorder_level=Decimal("5.0"), safety_stock=Decimal("2.0"))
    session.add(inv_item)
    session.commit()
    
    session.add(InventoryTransaction(inventory_item_id=inv_item.id, transaction_type="CONSUMPTION", quantity=Decimal("-5.0"), created_at=now-timedelta(days=1)))
    session.commit()
    
    r = Role(name="Staff")
    session.add(r)
    session.commit()
    e = Employee(employee_code="E001", name="Test Emp", role_id=r.id, outlet_id=o.id, hire_date=now)
    session.add(e)
    session.commit()
    session.add(Shift(employee_id=e.id, outlet_id=o.id, shift_date=now, scheduled_start=now, scheduled_end=now+timedelta(hours=4), actual_start=now, actual_end=now+timedelta(hours=12), status="COMPLETED"))
    session.commit()

    o2 = Outlet(franchise_id=f.id, name="Healthy Outlet", city="City")
    session.add(o2)
    session.commit()

    session.close()

def test_get_franchise_health_tool():
    db = TestingSessionLocal()
    now = datetime.now(timezone.utc)
    res = get_franchise_health_tool(db, start_date=now-timedelta(days=7), end_date=now+timedelta(minutes=1))
    assert "error" not in res
    assert "metrics" in res
    assert res["metrics"]["outlet_metrics"]["revenue"] == 75.0
    db.close()

def test_get_franchise_alerts_tool():
    db = TestingSessionLocal()
    now = datetime.now(timezone.utc)
    res = get_franchise_alerts_tool(db, start_date=now-timedelta(days=7), end_date=now+timedelta(minutes=1))
    assert "error" not in res
    assert "alerts" in res
    domains = [a["domain"] for a in res["alerts"]]
    assert "inventory" in domains
    assert "workforce" in domains
    db.close()

def test_get_cross_domain_signals_tool():
    db = TestingSessionLocal()
    now = datetime.now(timezone.utc)
    res = get_cross_domain_signals_tool(db, start_date=now-timedelta(days=7), end_date=now+timedelta(minutes=1))
    assert "error" not in res
    signals = res["signals"]
    types = [s["signal_type"] for s in signals]
    assert "DEMAND_INVENTORY_MISMATCH" in types
    assert "DEMAND_WORKLOAD_PRESSURE" in types
    db.close()

def test_get_cross_domain_signals_tool_no_signals():
    db = TestingSessionLocal()
    now = datetime.now(timezone.utc)
    res = get_cross_domain_signals_tool(db, start_date=now-timedelta(days=7), end_date=now+timedelta(minutes=1), outlet_id=999)
    assert "error" not in res
    assert len(res["signals"]) == 0
    db.close()

def test_compare_outlet_domains_tool():
    db = TestingSessionLocal()
    now = datetime.now(timezone.utc)
    res = compare_outlet_domains_tool(db, outlet_id=1, start_date=now-timedelta(days=7), end_date=now+timedelta(minutes=1))
    assert "error" not in res
    assert res["comparison"]["outlet_name"] == "Test Outlet"
    
    res2 = compare_outlet_domains_tool(db, outlet_id=999, start_date=now-timedelta(days=7), end_date=now+timedelta(minutes=1))
    assert "error" in res2
    assert "Outlet not found" in res2["error"]
    db.close()

def test_get_franchise_trends_tool():
    db = TestingSessionLocal()
    now = datetime.now(timezone.utc)
    res = get_franchise_trends_tool(db, start_date=now-timedelta(days=7), end_date=now+timedelta(minutes=1))
    assert "error" not in res
    assert "trends" in res
    db.close()

def test_tool_date_validation():
    db = TestingSessionLocal()
    now = datetime.now(timezone.utc)
    res = get_franchise_health_tool(db)
    assert "error" in res
    assert "required" in res["error"]
    
    res2 = get_franchise_health_tool(db, start_date=now, end_date=now-timedelta(days=1))
    assert "error" in res2
    assert "after" in res2["error"]
    db.close()

def test_schema_validation():
    now = datetime.now(timezone.utc)
    req = AuditAgentRequest(objective="audit", user_question="hi", start_date=now)
    assert req.objective == "audit"
    
    res = AuditAgentResponse(
        summary="All good",
        cross_domain_signals=["Signal 1"],
        attention_areas=["Inventory"],
        recommendations=[],
        confidence="High",
        data_sources_used=["Snapshot"]
    )
    assert res.summary == "All good"

def test_tool_safety_no_mutation():
    db = TestingSessionLocal()
    now = datetime.now(timezone.utc)
    initial_count = db.query(InventoryItem).count()
    get_franchise_health_tool(db, start_date=now-timedelta(days=7), end_date=now+timedelta(minutes=1))
    assert db.query(InventoryItem).count() == initial_count
    assert not db.dirty
    assert not db.new
    db.close()

from pydantic import ValidationError

def test_audit_agent_response_confidence_valid():
    res = AuditAgentResponse(
        summary="Test",
        confidence="High"
    )
    assert res.confidence == "High"
    
    res2 = AuditAgentResponse(
        summary="Test",
        confidence="Medium"
    )
    assert res2.confidence == "Medium"
    
    res3 = AuditAgentResponse(
        summary="Test",
        confidence="Low"
    )
    assert res3.confidence == "Low"

def test_audit_agent_response_confidence_invalid():
    with pytest.raises(ValidationError):
        AuditAgentResponse(
            summary="Test",
            confidence="Very High"
        )
    with pytest.raises(ValidationError):
        AuditAgentResponse(
            summary="Test",
            confidence="90%"
        )

def test_tool_empty_future_period():
    db = TestingSessionLocal()
    now = datetime.now(timezone.utc)
    future_start = now + timedelta(days=365)
    future_end = now + timedelta(days=372)
    
    # 1. Health tool
    h = get_franchise_health_tool(db, start_date=future_start, end_date=future_end)
    assert "error" not in h
    assert h["metrics"]["outlet_metrics"]["revenue"] == 0.0
    
    # 2. Alerts tool
    a = get_franchise_alerts_tool(db, start_date=future_start, end_date=future_end)
    assert "error" not in a
    
    # 3. Signals tool
    s = get_cross_domain_signals_tool(db, start_date=future_start, end_date=future_end)
    assert "error" not in s
    
    # 4. Comparison tool
    c = compare_outlet_domains_tool(db, outlet_id=1, start_date=future_start, end_date=future_end)
    assert "error" not in c
    assert c["comparison"]["revenue"] == 0.0
    
    # 5. Trends tool
    t = get_franchise_trends_tool(db, start_date=future_start, end_date=future_end)
    assert "error" not in t
    
    db.close()

def test_tool_same_day_period():
    db = TestingSessionLocal()
    now = datetime.now(timezone.utc)
    h = get_franchise_health_tool(db, start_date=now, end_date=now)
    assert "error" not in h
    db.close()

def test_tool_error_structure():
    db = TestingSessionLocal()
    now = datetime.now(timezone.utc)
    res = compare_outlet_domains_tool(db, outlet_id=999, start_date=now-timedelta(days=7), end_date=now)
    assert "error" in res
    assert "comparison" not in res
    assert "signals" not in res
    db.close()
