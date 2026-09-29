import pytest
from datetime import datetime, timedelta, timezone
from decimal import Decimal

from app.core.database import Base
from app.models.domain import Franchise, Outlet, Category, Product, Order, OrderItem
from app.agents.marketing.tools import (
    get_marketing_summary_tool,
    get_product_demand_tool,
    get_category_mix_tool,
    compare_outlet_demand_tool,
    get_marketing_alerts_tool,
    get_marketing_trends_tool
)
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

SQLALCHEMY_DATABASE_URL = "sqlite:///:memory:"

engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}, poolclass=StaticPool)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

@pytest.fixture(autouse=True)
def setup_db():
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    
    db = TestingSessionLocal()
    f = Franchise(name="Test Franchise")
    db.add(f)
    db.commit()
    o = Outlet(name="Test Outlet", franchise_id=f.id, city="Test City")
    db.add(o)
    db.commit()
    c = Category(name="Test Category")
    db.add(c)
    db.commit()
    p = Product(name="Test Product", category_id=c.id, price=Decimal('10.0'))
    db.add(p)
    db.commit()
    
    now = datetime.now(timezone.utc)
    
    # Current period order
    order1 = Order(outlet_id=o.id, order_timestamp=now, total_amount=Decimal('50.0'))
    db.add(order1)
    db.commit()
    item1 = OrderItem(order_id=order1.id, product_id=p.id, quantity=5, unit_price=Decimal('10.0'), subtotal=Decimal('50.0'))
    db.add(item1)
    db.commit()
    
    # Previous period order (for growth calculation)
    order2 = Order(outlet_id=o.id, order_timestamp=now - timedelta(days=35), total_amount=Decimal('20.0'))
    db.add(order2)
    db.commit()
    item2 = OrderItem(order_id=order2.id, product_id=p.id, quantity=2, unit_price=Decimal('10.0'), subtotal=Decimal('20.0'))
    db.add(item2)
    db.commit()
    
    db.close()
    yield

@pytest.fixture
def db():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()

def test_summary_tool(db):
    end = datetime.now(timezone.utc)
    start = end - timedelta(days=30)
    
    res = get_marketing_summary_tool(db, start, end)
    assert "error" not in res
    assert res["period"]["start_date"] == start.isoformat()
    assert res["metrics"]["revenue"] == 50.0
    assert res["metrics"]["orders"] == 1
    # Check growth is serialized and present
    assert res["metrics"]["revenue_growth_pct"] > 0

def test_product_tool(db):
    end = datetime.now(timezone.utc)
    start = end - timedelta(days=30)
    
    res = get_product_demand_tool(db, start, end)
    assert "error" not in res
    assert len(res["products"]) == 1
    p = res["products"][0]
    assert p["product_name"] == "Test Product"
    assert p["revenue"] == 50.0
    assert "signal" in p

def test_category_tool(db):
    end = datetime.now(timezone.utc)
    start = end - timedelta(days=30)
    
    res = get_category_mix_tool(db, start, end)
    assert "error" not in res
    assert len(res["categories"]) == 1
    c = res["categories"][0]
    assert c["category_name"] == "Test Category"
    assert c["revenue"] == 70.0

def test_compare_outlet_tool(db):
    end = datetime.now(timezone.utc)
    start = end - timedelta(days=30)
    
    res = compare_outlet_demand_tool(db, start, end)
    assert "error" not in res
    assert len(res["outlets"]) == 1
    o = res["outlets"][0]
    assert o["outlet_name"] == "Test Outlet"
    assert o["revenue"] == 50.0

def test_alerts_tool(db):
    end = datetime.now(timezone.utc)
    start = end - timedelta(days=30)
    
    res = get_marketing_alerts_tool(db, start, end)
    assert "error" not in res
    assert isinstance(res["alerts"], list)

def test_trends_tool(db):
    end = datetime.now(timezone.utc)
    start = end - timedelta(days=30)
    
    res = get_marketing_trends_tool(db, start, end)
    assert "error" not in res
    assert len(res["trends"]) > 0

def test_invalid_date_handled(db):
    end = datetime.now(timezone.utc)
    start = end + timedelta(days=30) # start > end
    
    res = get_marketing_summary_tool(db, start, end)
    assert "error" in res
    assert "start_date cannot be after end_date" in res["error"].lower()

def test_missing_dates(db):
    res = get_marketing_summary_tool(db, start_date=None, end_date=None)
    assert "error" in res
    assert "required" in res["error"]

def test_empty_dataset(db):
    end = datetime.now(timezone.utc) + timedelta(days=100)
    start = end - timedelta(days=30)
    
    res = get_marketing_summary_tool(db, start, end)
    assert "error" not in res
    assert res["metrics"]["revenue"] == 0.0
    assert res["metrics"]["orders"] == 0
    assert res["metrics"]["revenue_growth_pct"] == 0.0

def test_nonexistent_outlet(db):
    end = datetime.now(timezone.utc)
    start = end - timedelta(days=30)
    
    res = get_marketing_summary_tool(db, start, end, outlet_id=9999)
    assert "error" not in res
    assert res["metrics"]["revenue"] == 0.0

def test_no_nan_infinity_in_tools(db):
    import math
    end = datetime.now(timezone.utc)
    start = end - timedelta(days=30)
    
    res = get_marketing_summary_tool(db, start, end)
    assert "error" not in res
    
    growth = res["metrics"]["revenue_growth_pct"]
    if growth is not None:
        assert not math.isnan(growth)
        assert not math.isinf(growth)
