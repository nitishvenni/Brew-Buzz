import pytest
from fastapi.testclient import TestClient
from datetime import datetime, timedelta, timezone
from decimal import Decimal

from app.main import app
from app.analytics import marketing
from app.schemas.marketing import MarketingSignal, AlertSeverity
from app.core.database import Base, get_db
from app.models.domain import Franchise, Outlet, Category, Product, Order, OrderItem
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

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
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    
    # Insert some dummy data for tests
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
    order = Order(outlet_id=o.id, order_timestamp=now, total_amount=Decimal('20.0'))
    db.add(order)
    db.commit()
    item = OrderItem(order_id=order.id, product_id=p.id, quantity=2, unit_price=Decimal('10.0'), subtotal=Decimal('20.0'))
    db.add(item)
    db.commit()
    
    # Previous order
    order2 = Order(outlet_id=o.id, order_timestamp=now - timedelta(days=35), total_amount=Decimal('10.0'))
    db.add(order2)
    db.commit()
    item2 = OrderItem(order_id=order2.id, product_id=p.id, quantity=1, unit_price=Decimal('10.0'), subtotal=Decimal('10.0'))
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

def test_calculate_growth_pct():
    # zero previous, zero current -> 0.0
    assert marketing.calculate_growth_pct(Decimal('0'), Decimal('0')) == Decimal('0.0')
    # zero previous, current > 0 -> None
    assert marketing.calculate_growth_pct(Decimal('100'), Decimal('0')) is None
    # normal growth
    assert marketing.calculate_growth_pct(Decimal('150'), Decimal('100')) == Decimal('50.0')
    assert marketing.calculate_growth_pct(Decimal('50'), Decimal('100')) == Decimal('-50.0')

def test_determine_signal():
    assert marketing.determine_signal(None) == MarketingSignal.NO_BASELINE
    assert marketing.determine_signal(Decimal('25.0')) == MarketingSignal.SURGING
    assert marketing.determine_signal(Decimal('10.0')) == MarketingSignal.GROWING
    assert marketing.determine_signal(Decimal('-15.0')) == MarketingSignal.DECLINING
    assert marketing.determine_signal(Decimal('0.0')) == MarketingSignal.STABLE
    assert marketing.determine_signal(Decimal('-5.0')) == MarketingSignal.STABLE

def test_marketing_summary_api(db):
    end = datetime.now(timezone.utc)
    start = end - timedelta(days=30)
    
    response = client.get(
        f"/api/v1/marketing/summary?start_date={start.isoformat().replace('+', '%2B')}&end_date={end.isoformat().replace('+', '%2B')}"
    )
    assert response.status_code == 200
    data = response.json()
    assert "revenue" in data
    assert "revenue_growth_pct" in data
    assert "product_count" in data

def test_marketing_products_api(db):
    end = datetime.now(timezone.utc)
    start = end - timedelta(days=30)
    
    response = client.get(
        f"/api/v1/marketing/products?start_date={start.isoformat().replace('+', '%2B')}&end_date={end.isoformat().replace('+', '%2B')}"
    )
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    if len(data) > 0:
        assert "revenue_contribution_pct" in data[0]
        assert "signal" in data[0]

def test_marketing_categories_api(db):
    end = datetime.now(timezone.utc)
    start = end - timedelta(days=30)
    
    response = client.get(
        f"/api/v1/marketing/categories?start_date={start.isoformat().replace('+', '%2B')}&end_date={end.isoformat().replace('+', '%2B')}"
    )
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    if len(data) > 0:
        assert "category_name" in data[0]
        assert "growth_pct" in data[0]

def test_marketing_outlets_api(db):
    end = datetime.now(timezone.utc)
    start = end - timedelta(days=30)
    
    response = client.get(
        f"/api/v1/marketing/outlets?start_date={start.isoformat().replace('+', '%2B')}&end_date={end.isoformat().replace('+', '%2B')}"
    )
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    if len(data) > 0:
        assert "outlet_name" in data[0]
        assert "revenue_growth_pct" in data[0]

def test_marketing_alerts_api(db):
    end = datetime.now(timezone.utc)
    start = end - timedelta(days=30)
    
    response = client.get(
        f"/api/v1/marketing/alerts?start_date={start.isoformat().replace('+', '%2B')}&end_date={end.isoformat().replace('+', '%2B')}"
    )
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    # Depending on seed, could be empty or have alerts. Just check structure.
    for alert in data:
        assert "type" in alert
        assert "severity" in alert
        assert alert["severity"] in ["HIGH", "MEDIUM", "LOW"]

def test_invalid_date_range(db):
    end = datetime.now(timezone.utc)
    start = end + timedelta(days=30) # start > end
import pytest
from fastapi.testclient import TestClient
from datetime import datetime, timedelta, timezone
from decimal import Decimal

from app.main import app
from app.analytics import marketing
from app.schemas.marketing import MarketingSignal, AlertSeverity
from app.core.database import Base, get_db
from app.models.domain import Franchise, Outlet, Category, Product, Order, OrderItem
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

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
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    
    # Insert some dummy data for tests
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
    order = Order(outlet_id=o.id, order_timestamp=now, total_amount=Decimal('20.0'))
    db.add(order)
    db.commit()
    item = OrderItem(order_id=order.id, product_id=p.id, quantity=2, unit_price=Decimal('10.0'), subtotal=Decimal('20.0'))
    db.add(item)
    db.commit()
    
    # Previous order
    order2 = Order(outlet_id=o.id, order_timestamp=now - timedelta(days=35), total_amount=Decimal('10.0'))
    db.add(order2)
    db.commit()
    item2 = OrderItem(order_id=order2.id, product_id=p.id, quantity=1, unit_price=Decimal('10.0'), subtotal=Decimal('10.0'))
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

def test_calculate_growth_pct():
    # zero previous, zero current -> 0.0
    assert marketing.calculate_growth_pct(Decimal('0'), Decimal('0')) == Decimal('0.0')
    # zero previous, current > 0 -> None
    assert marketing.calculate_growth_pct(Decimal('100'), Decimal('0')) is None
    # normal growth
    assert marketing.calculate_growth_pct(Decimal('150'), Decimal('100')) == Decimal('50.0')
    assert marketing.calculate_growth_pct(Decimal('50'), Decimal('100')) == Decimal('-50.0')

def test_determine_signal():
    assert marketing.determine_signal(None) == MarketingSignal.NO_BASELINE
    assert marketing.determine_signal(Decimal('25.0')) == MarketingSignal.SURGING
    assert marketing.determine_signal(Decimal('10.0')) == MarketingSignal.GROWING
    assert marketing.determine_signal(Decimal('-15.0')) == MarketingSignal.DECLINING
    assert marketing.determine_signal(Decimal('0.0')) == MarketingSignal.STABLE
    assert marketing.determine_signal(Decimal('-5.0')) == MarketingSignal.STABLE

def test_marketing_summary_api(db):
    end = datetime.now(timezone.utc)
    start = end - timedelta(days=30)
    
    response = client.get(
        f"/api/v1/marketing/summary?start_date={start.isoformat().replace('+', '%2B')}&end_date={end.isoformat().replace('+', '%2B')}"
    )
    assert response.status_code == 200
    data = response.json()
    assert "revenue" in data
    assert "revenue_growth_pct" in data
    assert "product_count" in data

def test_marketing_products_api(db):
    end = datetime.now(timezone.utc)
    start = end - timedelta(days=30)
    
    response = client.get(
        f"/api/v1/marketing/products?start_date={start.isoformat().replace('+', '%2B')}&end_date={end.isoformat().replace('+', '%2B')}"
    )
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    if len(data) > 0:
        assert "revenue_contribution_pct" in data[0]
        assert "signal" in data[0]

def test_marketing_categories_api(db):
    end = datetime.now(timezone.utc)
    start = end - timedelta(days=30)
    
    response = client.get(
        f"/api/v1/marketing/categories?start_date={start.isoformat().replace('+', '%2B')}&end_date={end.isoformat().replace('+', '%2B')}"
    )
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    if len(data) > 0:
        assert "category_name" in data[0]
        assert "growth_pct" in data[0]

def test_marketing_outlets_api(db):
    end = datetime.now(timezone.utc)
    start = end - timedelta(days=30)
    
    response = client.get(
        f"/api/v1/marketing/outlets?start_date={start.isoformat().replace('+', '%2B')}&end_date={end.isoformat().replace('+', '%2B')}"
    )
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    if len(data) > 0:
        assert "outlet_name" in data[0]
        assert "revenue_growth_pct" in data[0]

def test_marketing_alerts_api(db):
    end = datetime.now(timezone.utc)
    start = end - timedelta(days=30)
    
    response = client.get(
        f"/api/v1/marketing/alerts?start_date={start.isoformat().replace('+', '%2B')}&end_date={end.isoformat().replace('+', '%2B')}"
    )
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    # Depending on seed, could be empty or have alerts. Just check structure.
    for alert in data:
        assert "type" in alert
        assert "severity" in alert
        assert alert["severity"] in ["HIGH", "MEDIUM", "LOW"]

def test_invalid_date_range(db):
    end = datetime.now(timezone.utc)
    start = end + timedelta(days=30) # start > end
    
    response = client.get(
        f"/api/v1/marketing/summary?start_date={start.isoformat().replace('+', '%2B')}&end_date={end.isoformat().replace('+', '%2B')}"
    )
    assert response.status_code == 400

def test_one_day_range(db):
    start = datetime.now(timezone.utc)
    # same start and end to test previous period logic avoiding zero division timedelta
    response = client.get(
        f"/api/v1/marketing/summary?start_date={start.isoformat().replace('+', '%2B')}&end_date={start.isoformat().replace('+', '%2B')}"
    )
    assert response.status_code == 200

def test_determine_signal_boundaries():
    # SURGE_THRESHOLD = 20.0
    assert marketing.determine_signal(Decimal('20.0')) == MarketingSignal.SURGING
    assert marketing.determine_signal(Decimal('20.01')) == MarketingSignal.SURGING
    assert marketing.determine_signal(Decimal('19.99')) == MarketingSignal.GROWING

    # GROWTH_THRESHOLD = 5.0
    assert marketing.determine_signal(Decimal('5.0')) == MarketingSignal.GROWING
    assert marketing.determine_signal(Decimal('5.01')) == MarketingSignal.GROWING
    assert marketing.determine_signal(Decimal('4.99')) == MarketingSignal.STABLE

    # DECLINE_THRESHOLD = -10.0
    assert marketing.determine_signal(Decimal('-10.0')) == MarketingSignal.DECLINING
    assert marketing.determine_signal(Decimal('-10.01')) == MarketingSignal.DECLINING
    assert marketing.determine_signal(Decimal('-9.99')) == MarketingSignal.STABLE

def test_empty_edge_cases(db):
    # Test zero orders / zero revenue edge cases by picking a future date with no orders
    start = datetime.now(timezone.utc) + timedelta(days=100)
    end = start + timedelta(days=30)
    
    response = client.get(
        f"/api/v1/marketing/summary?start_date={start.isoformat().replace('+', '%2B')}&end_date={end.isoformat().replace('+', '%2B')}"
    )
    assert response.status_code == 200
    data = response.json()
    assert Decimal(data['revenue']) == Decimal('0.0')
    assert data['orders'] == 0
    assert Decimal(data['aov']) == Decimal('0.0')
    assert Decimal(data['revenue_growth_pct']) == Decimal('0.0')  # since prev is also 0
    
    response = client.get(
        f"/api/v1/marketing/products?start_date={start.isoformat().replace('+', '%2B')}&end_date={end.isoformat().replace('+', '%2B')}"
    )
    assert response.json() == []

    response = client.get(
        f"/api/v1/marketing/alerts?start_date={start.isoformat().replace('+', '%2B')}&end_date={end.isoformat().replace('+', '%2B')}"
    )
    assert response.json() == []

def test_no_nan_infinity(db):
    import math
    end = datetime.now(timezone.utc)
    start = end - timedelta(days=30)
    
    response = client.get(
        f"/api/v1/marketing/summary?start_date={start.isoformat().replace('+', '%2B')}&end_date={end.isoformat().replace('+', '%2B')}"
    )
    data = response.json()
    if data['revenue_growth_pct'] is not None:
        val = float(data['revenue_growth_pct'])
        assert not math.isnan(val)
        assert not math.isinf(val)
