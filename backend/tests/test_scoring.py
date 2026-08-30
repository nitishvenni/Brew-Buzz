import pytest
from datetime import datetime, timedelta, timezone
from decimal import Decimal
from fastapi.testclient import TestClient

from app.main import app
from app.core.database import Base, get_db
from app.models.domain import Franchise, Outlet, Category, Product, Order, OrderItem
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool
from app.analytics.scoring import calculate_franchise_scores

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
    db = TestingSessionLocal()
    
    f = Franchise(name="Test")
    db.add(f)
    db.commit()
    
    o1 = Outlet(franchise_id=f.id, name="Outlet 1", city="City 1")
    o2 = Outlet(franchise_id=f.id, name="Outlet 2", city="City 2")
    db.add_all([o1, o2])
    db.commit()
    
    c = Category(name="Cat 1")
    db.add(c)
    db.commit()
    
    p = Product(category_id=c.id, name="Prod 1", price=10.0)
    db.add(p)
    db.commit()
    
    now = datetime.now(timezone.utc)
    
    # Previous period data (for growth)
    prev_date = now - timedelta(days=15)
    # Outlet 1 had $100 prev
    db.add(Order(outlet_id=o1.id, total_amount=100.0, order_timestamp=prev_date))
    # Outlet 2 had $50 prev
    db.add(Order(outlet_id=o2.id, total_amount=50.0, order_timestamp=prev_date))
    
    # Current period data
    curr_date = now - timedelta(days=5)
    # Outlet 1 has $150 now (+50%)
    ord1 = Order(outlet_id=o1.id, total_amount=150.0, order_timestamp=curr_date)
    # Outlet 2 has $25 now (-50%)
    ord2 = Order(outlet_id=o2.id, total_amount=25.0, order_timestamp=curr_date)
    
    db.add_all([ord1, ord2])
    db.commit()
    
    # Add items to get order count and AOV
    db.add(OrderItem(order_id=ord1.id, product_id=p.id, quantity=15, unit_price=10.0, subtotal=150.0))
    db.add(OrderItem(order_id=ord2.id, product_id=p.id, quantity=1, unit_price=25.0, subtotal=25.0))
    db.commit()
    
    yield
    Base.metadata.drop_all(bind=engine)
    app.dependency_overrides.clear()

def test_scoring_logic():
    db = TestingSessionLocal()
    now = datetime.now(timezone.utc)
    start_date = now - timedelta(days=10)
    end_date = now
    
    result = calculate_franchise_scores(db, start_date, end_date)
    
    assert len(result.outlet_scores) == 2
    
    o1_score = next(s for s in result.outlet_scores if s.outlet_id == 1)
    o2_score = next(s for s in result.outlet_scores if s.outlet_id == 2)
    
    # O1 has higher revenue ($150 vs $25)
    assert o1_score.components.revenue_score == 100.0
    assert o2_score.components.revenue_score < 100.0
    
    # O1 growth is 50%, should be 100 score
    assert o1_score.growth_percentage == 50.0
    assert o1_score.components.growth_score == 100.0
    
    # O2 growth is -50%, should be 0 score
    assert o2_score.growth_percentage == -50.0
    assert o2_score.components.growth_score == 0.0
    
    # O1 should be ranked higher
    assert o1_score.overall_score > o2_score.overall_score
    
    # Scores must be bounded 0-100
    for s in result.outlet_scores:
        assert 0 <= s.overall_score <= 100
        assert 0.0 <= s.components.revenue_score <= 100.0
        assert 0.0 <= s.components.growth_score <= 100.0

def test_api_endpoint():
    now = datetime.now(timezone.utc)
    start_date = (now - timedelta(days=10)).isoformat()
    end_date = now.isoformat()
    
    response = client.get("/api/v1/analytics/outlet-scores", params={"start_date": start_date, "end_date": end_date})
    assert response.status_code == 200
    
    data = response.json()
    assert "franchise_average_score" in data
    assert len(data["outlet_scores"]) == 2
