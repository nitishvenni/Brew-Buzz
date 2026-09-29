import pytest
from datetime import datetime, timedelta, timezone
from decimal import Decimal
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.main import app
from app.core.database import Base, get_db
from app.models.domain import Role, Employee, Shift, Outlet, Franchise, Order, OrderItem, Product, Category
from app.analytics.workforce import (
    calculate_shift_metrics, 
    determine_workforce_status,
    get_workforce_summary
)

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
    
    f = Franchise(name="Test")
    db.add(f)
    db.commit()
    
    o1 = Outlet(franchise_id=f.id, name="Outlet 1", city="City 1")
    db.add(o1)
    db.commit()

    yield

    Base.metadata.drop_all(bind=engine)

def test_shift_metrics_normal():
    now = datetime.now(timezone.utc)
    shift = Shift(
        scheduled_start=now,
        scheduled_end=now + timedelta(hours=8),
        actual_start=now,
        actual_end=now + timedelta(hours=8),
        status="COMPLETED"
    )
    sh, ah, oh, lm = calculate_shift_metrics(shift)
    assert sh == 8.0
    assert ah == 8.0
    assert oh == 0.0
    assert lm == 0.0

def test_shift_metrics_absent():
    now = datetime.now(timezone.utc)
    shift = Shift(
        scheduled_start=now,
        scheduled_end=now + timedelta(hours=8),
        actual_start=None,
        actual_end=None,
        status="ABSENT"
    )
    sh, ah, oh, lm = calculate_shift_metrics(shift)
    assert sh == 8.0
    assert ah == 0.0
    assert oh == 0.0
    assert lm == 0.0

def test_shift_metrics_overtime_and_late():
    now = datetime.now(timezone.utc)
    shift = Shift(
        scheduled_start=now,
        scheduled_end=now + timedelta(hours=8),
        actual_start=now + timedelta(minutes=30),
        actual_end=now + timedelta(hours=10),
        status="COMPLETED"
    )
    sh, ah, oh, lm = calculate_shift_metrics(shift)
    assert sh == 8.0
    assert ah == 9.5
    assert oh == 1.5
    assert lm == 30.0

def test_workforce_status():
    status, reasons = determine_workforce_status(attendance_rate=100.0, overtime_pct=0.0, workload=10.0)
    assert status == "HEALTHY"
    
    status, reasons = determine_workforce_status(attendance_rate=85.0, overtime_pct=0.0, workload=10.0)
    assert status == "ATTENTION"
    
    status, reasons = determine_workforce_status(attendance_rate=92.0, overtime_pct=15.0, workload=10.0)
    assert status == "WATCH"

def test_workforce_summary_empty():
    db = TestingSessionLocal()
    summary = get_workforce_summary(db, outlet_id=99999) 
    assert summary["total_staff"] == 0
    assert summary["scheduled_hours"] == 0.0
    assert summary["actual_hours"] == 0.0
    assert summary["attendance_rate"] == 0.0
    assert summary["orders_per_staff_hour"] == 0.0
    db.close()
    
def test_api_endpoints():
    response = client.get("/api/v1/analytics/workforce/summary")
    assert response.status_code == 200
    
    response = client.get("/api/v1/analytics/workforce/outlets")
    assert response.status_code == 200
    
    response = client.get("/api/v1/analytics/workforce/employees")
    assert response.status_code == 200
    
    response = client.get("/api/v1/analytics/workforce/trends")
    assert response.status_code == 200
    
    response = client.get("/api/v1/analytics/workforce/alerts")
    assert response.status_code == 200
def test_date_validation():
    # Valid dates
    response = client.get("/api/v1/analytics/workforce/summary?start_date=2026-01-01T00:00:00Z&end_date=2026-01-31T00:00:00Z")
    assert response.status_code == 200

    # Invalid dates
    response = client.get("/api/v1/analytics/workforce/summary?start_date=2026-02-01T00:00:00Z&end_date=2026-01-31T00:00:00Z")
    assert response.status_code == 400

def test_late_shifts_count():
    db = TestingSessionLocal()
    f = db.query(Franchise).first()
    o1 = db.query(Outlet).first()
    
    r = Role(name="TEST ROLE")
    db.add(r)
    db.commit()
    
    e = Employee(employee_code="LATE1", name="Late Person", role_id=r.id, outlet_id=o1.id, employment_status="ACTIVE", hire_date=datetime.now(timezone.utc))
    db.add(e)
    db.commit()

    now = datetime.now(timezone.utc)
    s = Shift(employee_id=e.id, outlet_id=o1.id, shift_date=now, scheduled_start=now, scheduled_end=now+timedelta(hours=8), actual_start=now+timedelta(minutes=10), actual_end=now+timedelta(hours=8), status="COMPLETED")
    db.add(s)
    db.commit()

    metrics = get_workforce_summary(db, outlet_id=o1.id)
    assert metrics["late_shifts"] == 1
    assert metrics["late_rate"] == 100.0

    db.query(Shift).delete()
    db.query(Employee).delete()
    db.query(Role).delete()
    db.commit()
    db.close()



def test_metrics_negative_prevention():
    now = datetime.now(timezone.utc)
    # End before start
    shift = Shift(
        scheduled_start=now,
        scheduled_end=now - timedelta(hours=1),
        actual_start=now,
        actual_end=now - timedelta(hours=1),
        status="COMPLETED"
    )
    sh, ah, oh, lm = calculate_shift_metrics(shift)
    assert sh == 0.0
    assert ah == 0.0
    assert oh == 0.0
    assert lm == 0.0

def _setup_alert_base(db):
    o1 = db.query(Outlet).first()
    r = Role(name="ALERT ROLE")
    db.add(r)
    db.commit()
    
    e = Employee(
        employee_code="ALERT_EMP", 
        name="Alert Person", 
        role_id=r.id, 
        outlet_id=o1.id, 
        employment_status="ACTIVE", 
        hire_date=datetime.now(timezone.utc)
    )
    db.add(e)
    db.commit()
    return o1, e

def _teardown_alert_base(db):
    db.query(Shift).delete()
    db.query(Order).delete()
    db.query(Employee).delete()
    db.query(Role).filter_by(name="ALERT ROLE").delete()
    db.commit()

def test_alert_high_absence():
    db = TestingSessionLocal()
    o1, e = _setup_alert_base(db)
    now = datetime.now(timezone.utc)
    
    # Create 1 absent shift -> 100% absence (>6%)
    s = Shift(
        employee_id=e.id, outlet_id=o1.id, shift_date=now,
        scheduled_start=now, scheduled_end=now+timedelta(hours=8),
        actual_start=None, actual_end=None, status="ABSENT"
    )
    db.add(s)
    db.commit()
    
    from app.analytics.workforce import get_workforce_alerts
    alerts = get_workforce_alerts(db)
    
    absence_alerts = [a for a in alerts if a["type"] == "HIGH_ABSENCE" and a["outlet_id"] == o1.id]
    assert len(absence_alerts) == 1
    alert = absence_alerts[0]
    
    assert alert["severity"] == "HIGH"
    assert alert["metric"] == "absence_rate"
    assert alert["value"] == 100.0
    assert alert["threshold"] == 6.0
    assert isinstance(alert["message"], str)
    assert "lazy" not in alert["message"].lower()
    
    _teardown_alert_base(db)
    db.close()

def test_alert_high_lateness():
    db = TestingSessionLocal()
    o1, e = _setup_alert_base(db)
    now = datetime.now(timezone.utc)
    
    # Create 1 completed late shift -> 100% lateness (>10%)
    s = Shift(
        employee_id=e.id, outlet_id=o1.id, shift_date=now,
        scheduled_start=now, scheduled_end=now+timedelta(hours=8),
        actual_start=now+timedelta(minutes=30), actual_end=now+timedelta(hours=8, minutes=30), 
        status="COMPLETED"
    )
    db.add(s)
    db.commit()
    
    from app.analytics.workforce import get_workforce_alerts
    alerts = get_workforce_alerts(db)
    
    late_alerts = [a for a in alerts if a["type"] == "HIGH_LATENESS" and a["outlet_id"] == o1.id]
    assert len(late_alerts) == 1
    alert = late_alerts[0]
    
    assert alert["severity"] == "HIGH"
    assert alert["metric"] == "late_rate"
    assert alert["value"] == 100.0
    assert alert["threshold"] == 10.0
    assert isinstance(alert["message"], str)
    assert "lazy" not in alert["message"].lower()
    
    _teardown_alert_base(db)
    db.close()

def test_alert_high_overtime():
    db = TestingSessionLocal()
    o1, e = _setup_alert_base(db)
    now = datetime.now(timezone.utc)
    
    # 8 hours scheduled, 12 hours worked -> 50% overtime (>20%)
    s = Shift(
        employee_id=e.id, outlet_id=o1.id, shift_date=now,
        scheduled_start=now, scheduled_end=now+timedelta(hours=8),
        actual_start=now, actual_end=now+timedelta(hours=12), 
        status="COMPLETED"
    )
    db.add(s)
    db.commit()
    
    from app.analytics.workforce import get_workforce_alerts
    alerts = get_workforce_alerts(db)
    
    ot_alerts = [a for a in alerts if a["type"] == "HIGH_OVERTIME" and a["outlet_id"] == o1.id]
    assert len(ot_alerts) == 1
    alert = ot_alerts[0]
    
    assert alert["severity"] == "HIGH"
    assert alert["metric"] == "overtime_percentage"
    assert alert["value"] == 50.0
    assert alert["threshold"] == 20.0
    assert isinstance(alert["message"], str)
    
    _teardown_alert_base(db)
    db.close()

def test_alert_high_workload():
    db = TestingSessionLocal()
    o1, e = _setup_alert_base(db)
    now = datetime.now(timezone.utc)
    
    # 1 hour worked
    s = Shift(
        employee_id=e.id, outlet_id=o1.id, shift_date=now,
        scheduled_start=now, scheduled_end=now+timedelta(hours=1),
        actual_start=now, actual_end=now+timedelta(hours=1), 
        status="COMPLETED"
    )
    db.add(s)
    
    # 30 orders in that hour (> 25 threshold)
    for _ in range(30):
        db.add(Order(outlet_id=o1.id, order_timestamp=now, total_amount=10.0, status="completed"))
    db.commit()
    
    from app.analytics.workforce import get_workforce_alerts
    alerts = get_workforce_alerts(db)
    
    wl_alerts = [a for a in alerts if a["type"] == "HIGH_WORKLOAD" and a["outlet_id"] == o1.id]
    assert len(wl_alerts) == 1
    alert = wl_alerts[0]
    
    assert alert["severity"] == "HIGH"
    assert alert["metric"] == "orders_per_staff_hour"
    assert alert["value"] == 30.0
    assert alert["threshold"] == 25.0
    assert isinstance(alert["message"], str)
    
    _teardown_alert_base(db)
    db.close()
