import pytest
from datetime import datetime, timedelta, timezone
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool
from pydantic import ValidationError

from app.core.database import Base
from app.models.domain import Role, Employee, Shift, Outlet, Franchise, Order
from app.schemas.staff_agent import StaffAgentRequest, StaffAgentResponse
from app.agents.staff.tools import (
    get_workforce_summary_tool,
    compare_outlets_tool,
    get_employee_workforce_metrics_tool,
    get_workforce_alerts_tool,
    get_workforce_trends_tool
)

SQLALCHEMY_DATABASE_URL = "sqlite:///:memory:"
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}, poolclass=StaticPool)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

@pytest.fixture
def db():
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    session = TestingSessionLocal()
    
    f = Franchise(name="Staff Franchise")
    session.add(f)
    session.commit()
    
    o1 = Outlet(franchise_id=f.id, name="Staff Outlet", city="Test City")
    session.add(o1)
    session.commit()
    
    r1 = Role(name="Staff Barista")
    session.add(r1)
    session.commit()
    
    now = datetime.now(timezone.utc)
    e1 = Employee(employee_code="STAFF-001", name="John Staff", role_id=r1.id, outlet_id=o1.id, employment_status="ACTIVE", hire_date=now - timedelta(days=30))
    session.add(e1)
    session.commit()
    
    s1 = Shift(
        employee_id=e1.id,
        outlet_id=o1.id,
        shift_date=now - timedelta(days=1),
        scheduled_start=now - timedelta(days=1, hours=8),
        scheduled_end=now - timedelta(days=1),
        actual_start=now - timedelta(days=1, hours=8),
        actual_end=now - timedelta(days=1),
        status="COMPLETED"
    )
    session.add(s1)
    
    ord1 = Order(outlet_id=o1.id, order_timestamp=now - timedelta(days=1), total_amount=10.0, status="completed")
    session.add(ord1)
    session.commit()
    
    yield session
    
    session.close()

def test_staff_agent_schema_validation():
    with pytest.raises(ValidationError):
        StaffAgentRequest()
        
    req = StaffAgentRequest(objective="Test", user_question="Testing")
    assert req.objective == "Test"
    
    res = StaffAgentResponse(summary="Done")
    assert res.summary == "Done"

def test_get_workforce_summary_tool(db):
    start = datetime.now(timezone.utc) - timedelta(days=5)
    end = datetime.now(timezone.utc) + timedelta(days=5)
    res = get_workforce_summary_tool(db, start_date=start, end_date=end)
    assert "error" not in res
    assert "metrics" in res
    metrics = res["metrics"]
    assert metrics["total_staff"] == 1
    assert metrics["completed_shifts"] == 1

def test_compare_outlets_tool(db):
    res = compare_outlets_tool(db)
    assert "error" not in res
    assert isinstance(res["metrics"], list)

def test_get_employee_workforce_metrics_tool(db):
    res = get_employee_workforce_metrics_tool(db, employee_id=1)
    assert "error" not in res
    metrics = res["metrics"]
    assert "name" not in metrics
    assert metrics["employee_code"] == "STAFF-001"
    assert "lazy" not in str(res).lower()

def test_get_workforce_alerts_tool(db):
    res = get_workforce_alerts_tool(db)
    assert "error" not in res

def test_get_workforce_trends_tool(db):
    res = get_workforce_trends_tool(db)
    assert "error" not in res

def test_invalid_date_range(db):
    start = datetime.now()
    end = start - timedelta(days=5)
    res = get_workforce_summary_tool(db, start_date=start, end_date=end)
    assert isinstance(res, dict)

def test_empty_workforce_data(db):
    start = datetime.now() + timedelta(days=365)
    end = datetime.now() + timedelta(days=370)
    res = get_workforce_summary_tool(db, start_date=start, end_date=end)
    assert "error" not in res
    assert res["metrics"]["completed_shifts"] == 0

def test_missing_employee(db):
    res = get_employee_workforce_metrics_tool(db, employee_id=999)
    assert "error" in res

def test_tool_failure_handling():
    res = get_workforce_summary_tool(None)
    assert "error" in res

def test_read_only_behavior(db):
    count_before = db.query(Employee).count()
    get_workforce_summary_tool(db)
    count_after = db.query(Employee).count()
    assert count_before == count_after

from fastapi.testclient import TestClient
from app.main import app
from app.core.database import get_db

client = TestClient(app)

@pytest.fixture(autouse=True)
def isolate_db_override():
    app.dependency_overrides[get_db] = override_get_db_for_test
    yield
    app.dependency_overrides.clear()


def override_get_db_for_test():
    try:
        session = TestingSessionLocal()
        yield session
    finally:
        session.close()


def test_staff_agent_mock_mode_employee_specific(db):
    from app.core.config import settings
    original_key = settings.GEMINI_API_KEY
    settings.GEMINI_API_KEY = None
    try:
        req_data = {
            "employee_id": 1,
            "objective": "Analyze attendance",
            "user_question": "Why is EMP-001 late?"
        }
        res = client.post("/api/v1/agents/staff/analyze", json=req_data)
        assert res.status_code == 200
        data = res.json()
        assert "summary" in data
        assert "Mocked" in data["summary"]
        assert "get_employee_workforce_metrics_tool" in data["data_sources_used"]
    finally:
        settings.GEMINI_API_KEY = original_key

def test_staff_agent_mock_mode_general(db):
    from app.core.config import settings
    original_key = settings.GEMINI_API_KEY
    settings.GEMINI_API_KEY = None
    try:
        req_data = {
            "objective": "General summary",
            "user_question": "How is our workforce performing?"
        }
        res = client.post("/api/v1/agents/staff/analyze", json=req_data)
        assert res.status_code == 200
        data = res.json()
        assert "summary" in data
        assert "Mocked" in data["summary"]
        assert "get_workforce_summary_tool" in data["data_sources_used"]
    finally:
        settings.GEMINI_API_KEY = original_key

def test_staff_agent_invalid_request():
    req_data = {
        "objective": "Missing question"
    }
    res = client.post("/api/v1/agents/staff/analyze", json=req_data)
    assert res.status_code == 422 # FastAPI validation error

import pytest
from datetime import datetime, timedelta, timezone
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool
from pydantic import ValidationError

from app.core.database import Base
from app.models.domain import Role, Employee, Shift, Outlet, Franchise, Order
from app.schemas.staff_agent import StaffAgentRequest, StaffAgentResponse
from app.agents.staff.tools import (
    get_workforce_summary_tool,
    compare_outlets_tool,
    get_employee_workforce_metrics_tool,
    get_workforce_alerts_tool,
    get_workforce_trends_tool
)

SQLALCHEMY_DATABASE_URL = "sqlite:///:memory:"
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}, poolclass=StaticPool)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

@pytest.fixture
def db():
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    session = TestingSessionLocal()
    
    f = Franchise(name="Staff Franchise")
    session.add(f)
    session.commit()
    
    o1 = Outlet(franchise_id=f.id, name="Staff Outlet", city="Test City")
    session.add(o1)
    session.commit()
    
    r1 = Role(name="Staff Barista")
    session.add(r1)
    session.commit()
    
    now = datetime.now(timezone.utc)
    e1 = Employee(employee_code="STAFF-001", name="John Staff", role_id=r1.id, outlet_id=o1.id, employment_status="ACTIVE", hire_date=now - timedelta(days=30))
    session.add(e1)
    session.commit()
    
    s1 = Shift(
        employee_id=e1.id,
        outlet_id=o1.id,
        shift_date=now - timedelta(days=1),
        scheduled_start=now - timedelta(days=1, hours=8),
        scheduled_end=now - timedelta(days=1),
        actual_start=now - timedelta(days=1, hours=8),
        actual_end=now - timedelta(days=1),
        status="COMPLETED"
    )
    session.add(s1)
    
    ord1 = Order(outlet_id=o1.id, order_timestamp=now - timedelta(days=1), total_amount=10.0, status="completed")
    session.add(ord1)
    session.commit()
    
    yield session
    
    session.close()

def test_staff_agent_schema_validation():
    with pytest.raises(ValidationError):
        StaffAgentRequest()
        
    req = StaffAgentRequest(objective="Test", user_question="Testing")
    assert req.objective == "Test"
    
    res = StaffAgentResponse(summary="Done")
    assert res.summary == "Done"

def test_get_workforce_summary_tool(db):
    start = datetime.now(timezone.utc) - timedelta(days=5)
    end = datetime.now(timezone.utc) + timedelta(days=5)
    res = get_workforce_summary_tool(db, start_date=start, end_date=end)
    assert "error" not in res
    assert "metrics" in res
    metrics = res["metrics"]
    assert metrics["total_staff"] == 1
    assert metrics["completed_shifts"] == 1

def test_compare_outlets_tool(db):
    res = compare_outlets_tool(db)
    assert "error" not in res
    assert isinstance(res["metrics"], list)

def test_get_employee_workforce_metrics_tool(db):
    res = get_employee_workforce_metrics_tool(db, employee_id=1)
    assert "error" not in res
    metrics = res["metrics"]
    assert "name" not in metrics
    assert metrics["employee_code"] == "STAFF-001"
    assert "lazy" not in str(res).lower()

def test_get_workforce_alerts_tool(db):
    res = get_workforce_alerts_tool(db)
    assert "error" not in res

def test_get_workforce_trends_tool(db):
    res = get_workforce_trends_tool(db)
    assert "error" not in res

def test_invalid_date_range(db):
    start = datetime.now()
    end = start - timedelta(days=5)
    res = get_workforce_summary_tool(db, start_date=start, end_date=end)
    assert isinstance(res, dict)

def test_empty_workforce_data(db):
    start = datetime.now() + timedelta(days=365)
    end = datetime.now() + timedelta(days=370)
    res = get_workforce_summary_tool(db, start_date=start, end_date=end)
    assert "error" not in res
    assert res["metrics"]["completed_shifts"] == 0

def test_missing_employee(db):
    res = get_employee_workforce_metrics_tool(db, employee_id=999)
    assert "error" in res

def test_tool_failure_handling():
    res = get_workforce_summary_tool(None)
    assert "error" in res

def test_read_only_behavior(db):
    count_before = db.query(Employee).count()
    get_workforce_summary_tool(db)
    count_after = db.query(Employee).count()
    assert count_before == count_after

from fastapi.testclient import TestClient
from app.main import app
from app.core.database import get_db

client = TestClient(app)

@pytest.fixture(autouse=True)
def isolate_db_override():
    app.dependency_overrides[get_db] = override_get_db_for_test
    yield
    app.dependency_overrides.clear()


def override_get_db_for_test():
    try:
        session = TestingSessionLocal()
        yield session
    finally:
        session.close()


def test_staff_agent_mock_mode_employee_specific(db):
    from app.core.config import settings
    original_key = settings.GEMINI_API_KEY
    settings.GEMINI_API_KEY = None
    try:
        req_data = {
            "employee_id": 1,
            "objective": "Analyze attendance",
            "user_question": "Why is EMP-001 late?"
        }
        res = client.post("/api/v1/agents/staff/analyze", json=req_data)
        assert res.status_code == 200
        data = res.json()
        assert "summary" in data
        assert "AI reasoning is currently unavailable" in data["summary"]
        assert "get_employee_workforce_metrics_tool" in data["data_sources_used"]
    finally:
        settings.GEMINI_API_KEY = original_key

def test_staff_agent_mock_mode_general(db):
    from app.core.config import settings
    original_key = settings.GEMINI_API_KEY
    settings.GEMINI_API_KEY = None
    try:
        req_data = {
            "objective": "General summary",
            "user_question": "How is our workforce performing?"
        }
        res = client.post("/api/v1/agents/staff/analyze", json=req_data)
        assert res.status_code == 200
        data = res.json()
        assert "summary" in data
        assert "AI reasoning is currently unavailable" in data["summary"]
        assert "get_workforce_summary_tool" in data["data_sources_used"]
    finally:
        settings.GEMINI_API_KEY = original_key

def test_staff_agent_invalid_request():
    req_data = {
        "objective": "Missing question"
    }
    res = client.post("/api/v1/agents/staff/analyze", json=req_data)
    assert res.status_code == 422 # FastAPI validation error

def test_staff_agent_safety_prompt_exists():
    with open('app/agents/staff/workflow.py', 'r') as f:
        content = f.read()
    assert "lazy" in content.lower()
    assert "bad employee" in content.lower()
    assert "MUST NOT make judgments" in content
