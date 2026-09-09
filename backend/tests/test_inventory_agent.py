import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool
from app.main import app
from app.core.database import Base, get_db

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
    # Provide a minimal mock DB state here if necessary for tools
    # We will just let tools run and return empty/None gracefully
    yield db
    db.close()
    Base.metadata.drop_all(bind=engine)

def test_inventory_agent_mock_mode_item_specific(setup_db):
    """Test the agent correctly uses mock mode for specific ingredient analysis."""
    from app.core.config import settings
    original_key = settings.GEMINI_API_KEY
    settings.GEMINI_API_KEY = None
    try:
        request_data = {
            "inventory_item_id": 1,
            "objective": "Analyze inventory risk",
            "user_question": "Why is this ingredient running low?"
        }

        response = client.post("/api/v1/agents/inventory/analyze", json=request_data)
        
        assert response.status_code == 200
        data = response.json()
        assert "summary" in data
        assert "Mocked" in data["summary"]
        assert "key_findings" in data
        assert "risks" in data
        assert "recommendations" in data
        assert "confidence" in data
        assert "data_sources_used" in data
        
        # In mock mode, it uses get_inventory_item_metrics and get_reorder_recommendation
        tools = data["data_sources_used"]
        assert "get_inventory_item_metrics" in tools
        assert "get_reorder_recommendation" in tools
    finally:
        settings.GEMINI_API_KEY = original_key

def test_inventory_agent_mock_mode_general(setup_db):
    """Test the agent correctly uses mock mode for general inventory analysis."""
    from app.core.config import settings
    original_key = settings.GEMINI_API_KEY
    settings.GEMINI_API_KEY = None
    try:
        request_data = {
            "objective": "Analyze overall inventory health",
            "user_question": "What are the biggest inventory risks right now?"
        }

        response = client.post("/api/v1/agents/inventory/analyze", json=request_data)
        
        assert response.status_code == 200
        data = response.json()
        assert "summary" in data
        assert "Mocked" in data["summary"]
        
        tools = data["data_sources_used"]
        assert "get_inventory_summary" in tools
        assert "get_inventory_alerts" in tools
    finally:
        settings.GEMINI_API_KEY = original_key

def test_inventory_agent_empty_question(setup_db):
    """Test validation fails on empty strings."""
    request_data = {
        "objective": "",
        "user_question": ""
    }
    response = client.post("/api/v1/agents/inventory/analyze", json=request_data)
    assert response.status_code == 422 # Pydantic validation error

def test_inventory_agent_tools_directly(setup_db):
    """Test the raw Python tools the agent uses."""
    from app.agents.inventory.tools import get_inventory_summary_tool
    res = get_inventory_summary_tool(setup_db)
    # The seeder creates inventory items so total_items should be >= 0
    assert "total_items" in res
    assert isinstance(res["total_items"], int)
