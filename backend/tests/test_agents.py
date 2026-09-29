import pytest
from fastapi.testclient import TestClient
from datetime import datetime, timedelta, timezone

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

@pytest.fixture(autouse=True)
def isolate_db_override():
    app.dependency_overrides[get_db] = override_get_db
    yield
    app.dependency_overrides.clear()


def override_get_db():
    try:
        db = TestingSessionLocal()
        yield db
    finally:
        db.close()

@pytest.fixture(autouse=True)
def setup_db():
    Base.metadata.create_all(bind=engine)
    
    db = TestingSessionLocal()
    franchise = Franchise(name="Test Franchise")
    db.add(franchise)
    db.commit()
    
    outlet1 = Outlet(franchise_id=franchise.id, name="Outlet 1", city="City 1")
    outlet2 = Outlet(franchise_id=franchise.id, name="Outlet 2", city="City 2")
    db.add_all([outlet1, outlet2])
    db.commit()
    
    cat = Category(name="Pizza")
    db.add(cat)
    db.commit()
    
    prod = Product(category_id=cat.id, name="Margherita", price=10.00)
    db.add(prod)
    db.commit()
    
    now = datetime.now(timezone.utc)
    o1 = Order(outlet_id=outlet1.id, total_amount=10.00, order_timestamp=now)
    o2 = Order(outlet_id=outlet2.id, total_amount=20.00, order_timestamp=now)
    db.add_all([o1, o2])
    db.commit()
    
    db.add(OrderItem(order_id=o1.id, product_id=prod.id, quantity=1, unit_price=10.00, subtotal=10.00))
    db.add(OrderItem(order_id=o2.id, product_id=prod.id, quantity=2, unit_price=10.00, subtotal=20.00))
    db.commit()
    
    yield
    
    Base.metadata.drop_all(bind=engine)

def test_agent_tools():
    db = TestingSessionLocal()
    now = datetime.now(timezone.utc)
    start_date = now - timedelta(days=2)
    end_date = now + timedelta(days=1)
    
    # Test get_outlet_metrics
    from app.agents.outlet_performance.tools import get_outlet_metrics, get_outlet_benchmark
    metrics = get_outlet_metrics(db, 1, start_date, end_date)
    assert metrics["revenue"] == 10.0
    
    # Test benchmark
    bench = get_outlet_benchmark(db, 1, start_date, end_date)
    # peer average revenue is (10 + 20) / 2 = 15.0
    assert bench["peer_avg_revenue"] == 15.0
    assert bench["revenue_vs_avg_pct"] < 0 # Outlet 1 (10) vs Avg (15)

def test_outlet_performance_agent(monkeypatch):
    import app.core.config
    monkeypatch.setattr(app.core.config.settings, "GEMINI_API_KEY", "")
    import app.agents.outlet_performance.workflow
    monkeypatch.setattr(app.agents.outlet_performance.workflow.settings, "GEMINI_API_KEY", "")
    
    now = datetime.now(timezone.utc)
    start_date = (now - timedelta(hours=1)).isoformat()
    end_date = (now + timedelta(hours=1)).isoformat()
    
    payload = {
        "outlet_id": 1,
        "start_date": start_date,
        "end_date": end_date,
        "objective": "Analyze outlet performance",
        "user_question": "Why is this outlet underperforming?"
    }
    
    response = client.post("/api/v1/agents/outlet-performance/analyze", json=payload)
    assert response.status_code == 200
    
    data = response.json()
    assert data["summary"] == "Mocked analysis completed."
    
    # Verify tools used
    assert "get_outlet_metrics" in data["tools_used"]
    assert "get_outlet_benchmark" in data["tools_used"]
    
    # Verify conditional category check happened (since Outlet 1 underperforms relative to Outlet 2)
    assert "get_outlet_category_breakdown" in data["tools_used"]
    
    # Verify structured findings
    assert len(data["findings"]) > 0
    assert data["findings"][0]["finding_type"] == "revenue_decline"
    
    # Verify no ungrounded claims (limitations explicit)
    assert "Mock LLM used." in data["limitations"]
