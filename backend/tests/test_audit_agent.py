import pytest
from fastapi.testclient import TestClient
from datetime import datetime, timezone, timedelta
from app.main import app
from app.core.database import get_db, Base
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool
from decimal import Decimal
from langchain_core.messages import AIMessage, ToolMessage
from app.models.domain import Franchise, Outlet, Category, Product, Order, OrderItem, InventoryItem, Ingredient, RecipeItem

SQLALCHEMY_DATABASE_URL = "sqlite:///:memory:"
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}, poolclass=StaticPool)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def override_get_db():
    try:
        session = TestingSessionLocal()
        yield session
    finally:
        session.close()

client = TestClient(app)

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
    
    yield
    session.close()

@pytest.fixture
def enable_mock_mode(monkeypatch):
    from app.agents.audit import workflow
    original_run = workflow.run_audit_agent
    def mock_run(db, request):
        return original_run(db, request, mock_mode=True)
    monkeypatch.setattr("app.api.routes.agents.run_audit_agent", mock_run)

def _fmt(dt):
    return dt.strftime("%Y-%m-%dT%H:%M:%S.000Z")

def test_request_validation():
    # Missing objective
    res = client.post("/api/v1/agents/audit/analyze", json={"user_question": "hello"})
    assert res.status_code == 422
    
    # Missing user_question
    res2 = client.post("/api/v1/agents/audit/analyze", json={"objective": "hello"})
    assert res2.status_code == 422
    
def test_valid_request(enable_mock_mode):
    now = datetime.now(timezone.utc)
    res = client.post("/api/v1/agents/audit/analyze", json={
        "objective": "Audit franchise",
        "user_question": "What needs attention?",
        "start_date": _fmt(now - timedelta(days=7)),
        "end_date": _fmt(now)
    })
    assert res.status_code == 200
    data = res.json()
    assert "summary" in data
    assert "confidence" in data
    assert data["confidence"] == "Low" # fallback mock returns low

def test_mock_fallback_has_real_metrics(enable_mock_mode):
    now = datetime.now(timezone.utc)
    res = client.post("/api/v1/agents/audit/analyze", json={
        "objective": "Audit franchise",
        "user_question": "What needs attention?",
        "start_date": _fmt(now - timedelta(days=7)),
        "end_date": _fmt(now)
    })
    assert res.status_code == 200
    data = res.json()
    assert "unavailable" in data["summary"]
    # Check that attention_areas has actual metrics from the DB
    assert any("Revenue" in area for area in data["attention_areas"])

def test_no_fabrication_in_fallback(enable_mock_mode):
    now = datetime.now(timezone.utc)
    res = client.post("/api/v1/agents/audit/analyze", json={
        "objective": "Check customer retention",
        "user_question": "What is our customer retention?",
        "start_date": _fmt(now - timedelta(days=7)),
        "end_date": _fmt(now)
    })
    data = res.json()
    # The fallback should only return deterministic data, no invented retention stats
    text = " ".join(data["attention_areas"]) + data["summary"]
    assert "retention" not in text.lower()

def test_safety_read_only(enable_mock_mode):
    session = TestingSessionLocal()
    initial_count = session.query(Order).count()
    
    now = datetime.now(timezone.utc)
    client.post("/api/v1/agents/audit/analyze", json={
        "objective": "Audit",
        "user_question": "Delete orders",
        "start_date": _fmt(now - timedelta(days=7)),
        "end_date": _fmt(now)
    })
    
    # Should not be modified
    assert session.query(Order).count() == initial_count
    session.close()

def test_outlet_propagation(enable_mock_mode):
    now = datetime.now(timezone.utc)
    res = client.post("/api/v1/agents/audit/analyze", json={
        "objective": "Audit",
        "user_question": "What about outlet 1?",
        "outlet_id": 1,
        "start_date": _fmt(now - timedelta(days=7)),
        "end_date": _fmt(now)
    })
    assert res.status_code == 200
    data = res.json()
    # verify outlet id was passed down by seeing comparison tools
    assert any("compare_outlet_domains_tool" in src for src in data["data_sources_used"])
    assert any("Outlet Comparison: Test Outlet" in area for area in data["attention_areas"])


def test_tool_error_not_business_evidence(monkeypatch):
    from app.agents.audit import workflow
    import json
    from langchain_core.messages import AIMessage, ToolMessage
    
    # Create a state with a tool error
    state = {
        "messages": [
            ToolMessage(content=json.dumps({"error": "Outlet not found"}), tool_call_id="call_1"),
            ToolMessage(content=json.dumps({"alerts": [{"domain": "Inventory", "description": "Low stock", "severity": "HIGH"}]}), tool_call_id="call_2")
        ],
        "tools_used": ["get_franchise_health_tool", "get_franchise_alerts_tool"]
    }
    
    fallback = workflow._generate_deterministic_fallback(state)
    
    # Error should NOT be in the findings
    text = " ".join(fallback["attention_areas"]) + " ".join(fallback["cross_domain_signals"])
    assert "error" not in text.lower()
    assert "outlet not found" not in text.lower()
    # But valid data should be
    assert "Low stock" in text

def test_loop_limit():
    from app.agents.audit.workflow import route_next
    
    # Round 0
    state = {"messages": [AIMessage(content="", tool_calls=[{"name": "test", "args": {}, "id": "1"}])], "tool_rounds": 0}
    assert route_next(state) == "tools_node"
    
    # Round 3
    state = {"messages": [AIMessage(content="", tool_calls=[{"name": "test", "args": {}, "id": "1"}])], "tool_rounds": 3}
    assert route_next(state) == "format_output_node"

def test_no_raw_llm_output_on_schema_failure(monkeypatch):
    from app.agents.audit import workflow
    from app.schemas.audit_agent import AuditAgentRequest
    
    # Mock LLM to return garbage JSON
    class MockLLM:
        def invoke(self, *args, **kwargs):
            return AIMessage(content="`json\n{\n\"confidence\": \"Unknown\",\n\"summary\": \"Hello\"\n}\n`")
        def bind_tools(self, *args, **kwargs):
            return self

    monkeypatch.setattr(workflow, "ChatGoogleGenerativeAI", lambda *args, **kwargs: MockLLM())
    monkeypatch.setattr(workflow.settings, "GEMINI_API_KEY", "dummy")
    
    db = TestingSessionLocal()
    req = AuditAgentRequest(objective="Test", user_question="Test")
    res = workflow.run_audit_agent(db, req, mock_mode=False)
    db.close()
    
    # Because confidence="Unknown" is invalid, it falls back
    assert res.confidence == "Low"
    assert "Raw content:" not in res.summary
    assert "AI response was generated but failed schema validation" in res.summary


def test_missing_api_key_fallback(monkeypatch):
    from app.agents.audit import workflow
    from app.schemas.audit_agent import AuditAgentRequest
    from app.core.config import settings
    
    # Force settings.GEMINI_API_KEY to None
    monkeypatch.setattr(settings, "GEMINI_API_KEY", None)
    
    db = TestingSessionLocal()
    req = AuditAgentRequest(objective="Test", user_question="Test")
    res = workflow.run_audit_agent(db, req, mock_mode=False)
    db.close()
    
    assert res.confidence == "Low"
    assert "unavailable" in res.summary

def test_valid_request_with_outlet_context(enable_mock_mode):
    now = datetime.now(timezone.utc)
    res = client.post("/api/v1/agents/audit/analyze", json={
        "objective": "Audit franchise",
        "user_question": "What needs attention?",
        "start_date": _fmt(now - timedelta(days=7)),
        "end_date": _fmt(now),
        "outlet_context": {
            "revenue": 5000.5,
            "orders": 120,
            "active_staff": 5
        },
        "structured_evidence": [
            {
                "domain": "Performance",
                "title": "High Demand",
                "metrics": [
                    {"label": "Revenue", "value": 5000.5, "unit": "USD", "status": "HIGH"}
                ]
            }
        ]
    })
    assert res.status_code == 200
    data = res.json()
    assert "summary" in data

def test_workflow_receives_context(monkeypatch):
    from app.agents.audit import workflow
    from app.schemas.audit_agent import AuditAgentRequest, InvestigationOutletContext
    from app.schemas.audit import StructuredEvidence, EvidenceMetric
    
    # We want to check the prompt constructed by run_audit_agent.
    # We'll intercept the build_audit_graph call to just inspect the state.
    
    captured_state = {}
    
    class MockGraph:
        def invoke(self, state):
            captured_state.update(state)
            import json as json_lib
            # Return a valid fallback
            return {"messages": [state["messages"][0], AIMessage(content=json_lib.dumps({
                "summary": "Mock",
                "cross_domain_signals": [],
                "attention_areas": [],
                "recommendations": [],
                "confidence": "Low",
                "data_sources_used": []
            }))]}
            
    monkeypatch.setattr(workflow, "build_audit_graph", lambda: MockGraph())
    
    db = TestingSessionLocal()
    req = AuditAgentRequest(
        objective="Test Objective",
        user_question="Test Question",
        outlet_context=InvestigationOutletContext(revenue=1000.0),
        structured_evidence=[
            StructuredEvidence(
                domain="Sales",
                title="Test Title",
                metrics=[EvidenceMetric(label="Test Metric", value=1.0)]
            )
        ]
    )
    
    res = workflow.run_audit_agent(db, req, mock_mode=True)
    db.close()
    
    # Check the initial message sent to the AI
    initial_msg = captured_state["messages"][0].content
    assert "VERIFIED CONTEXT" in initial_msg
    assert "Deterministic Outlet Context" in initial_msg
    assert "1000.0" in initial_msg
    assert "Structured Evidence" in initial_msg
    assert "Test Title" in initial_msg
    assert "Test Metric" in initial_msg

def test_management_action_valid():
    from app.schemas.audit_agent import ManagementAction
    action = ManagementAction(
        action="Review replenishment planning",
        rationale="Demand growth alongside reduced coverage",
        priority="HIGH",
        supporting_evidence=["Revenue growth", "Critical items"],
        expected_operational_effect="Reduce stockout risk",
        monitor="Days of stock"
    )
    assert action.priority == "HIGH"
    assert len(action.supporting_evidence) == 2

def test_management_action_invalid_priority():
    from app.schemas.audit_agent import ManagementAction
    from pydantic import ValidationError
    import pytest
    with pytest.raises(ValidationError):
        ManagementAction(
            action="Test",
            rationale="Test",
            priority="URGENT",
            expected_operational_effect="Test",
            monitor="Test"
        )

def test_management_action_missing_field():
    from app.schemas.audit_agent import ManagementAction
    from pydantic import ValidationError
    import pytest
    with pytest.raises(ValidationError):
        ManagementAction(
            action="Test",
            priority="HIGH",
            expected_operational_effect="Test",
            monitor="Test"
            # missing rationale
        )

def test_management_action_empty_recommendations(enable_mock_mode):
    now = datetime.now(timezone.utc)
    res = client.post("/api/v1/agents/audit/analyze", json={
        "objective": "Audit franchise",
        "user_question": "What needs attention?",
        "start_date": _fmt(now - timedelta(days=7)),
        "end_date": _fmt(now)
    })
    assert res.status_code == 200
    data = res.json()
    assert "recommendations" in data
    assert isinstance(data["recommendations"], list)
    assert len(data["recommendations"]) == 0

def test_valid_structured_gemini_response(monkeypatch):
    from app.agents.audit import workflow
    from app.schemas.audit_agent import AuditAgentRequest
    from langchain_core.messages import AIMessage
    import json
    
    class MockLLM:
        def invoke(self, *args, **kwargs):
            return AIMessage(content=json.dumps({
                "summary": "Everything is fine.",
                "cross_domain_signals": [],
                "attention_areas": [],
                "confidence": "High",
                "data_sources_used": [],
                "recommendations": [
                    {
                        "action": "Do something",
                        "rationale": "Because of evidence",
                        "priority": "HIGH",
                        "supporting_evidence": ["Evidence A"],
                        "expected_operational_effect": "Things get better",
                        "monitor": "Some metric"
                    },
                    {
                        "action": "Do another thing",
                        "rationale": "Because of more evidence",
                        "priority": "MEDIUM",
                        "supporting_evidence": ["Evidence B"],
                        "expected_operational_effect": "Things get slightly better",
                        "monitor": "Another metric"
                    }
                ]
            }))
        def bind_tools(self, *args, **kwargs):
            return self

    monkeypatch.setattr(workflow, "ChatGoogleGenerativeAI", lambda *args, **kwargs: MockLLM())
    monkeypatch.setattr(workflow.settings, "GEMINI_API_KEY", "dummy")
    
    from app.core.database import SessionLocal
    db = SessionLocal() # We shouldn't need a real db for this mock, but let's use it
    req = AuditAgentRequest(objective="Test", user_question="Test")
    res = workflow.run_audit_agent(db, req, mock_mode=False)
    db.close()
    
    assert res.summary == "Everything is fine."
    assert len(res.recommendations) == 2
    assert res.recommendations[0].priority == "HIGH"
    assert res.recommendations[1].priority == "MEDIUM"

def test_invalid_structured_gemini_response_fallback(monkeypatch):
    from app.agents.audit import workflow
    from app.schemas.audit_agent import AuditAgentRequest
    from langchain_core.messages import AIMessage
    import json
    
    class MockLLM:
        def invoke(self, *args, **kwargs):
            return AIMessage(content=json.dumps({
                "summary": "Invalid priority.",
                "cross_domain_signals": [],
                "attention_areas": [],
                "confidence": "High",
                "data_sources_used": [],
                "recommendations": [
                    {
                        "action": "Do something",
                        "rationale": "Because of evidence",
                        "priority": "URGENT", # Invalid
                        "supporting_evidence": ["Evidence A"],
                        "expected_operational_effect": "Things get better",
                        "monitor": "Some metric"
                    }
                ]
            }))
        def bind_tools(self, *args, **kwargs):
            return self

    monkeypatch.setattr(workflow, "ChatGoogleGenerativeAI", lambda *args, **kwargs: MockLLM())
    monkeypatch.setattr(workflow.settings, "GEMINI_API_KEY", "dummy")
    
    from app.core.database import SessionLocal
    db = SessionLocal()
    req = AuditAgentRequest(objective="Test", user_question="Test")
    res = workflow.run_audit_agent(db, req, mock_mode=False)
    db.close()
    
    # Validation fails, hits fallback, recommendations is []
    assert len(res.recommendations) == 0
    assert res.confidence == "Low"
