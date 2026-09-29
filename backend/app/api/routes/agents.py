from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.schemas.agent import AgentRequest, AgentResponse
from app.schemas.inventory_agent import InventoryAgentRequest, InventoryAgentResponse
from app.schemas.staff_agent import StaffAgentRequest, StaffAgentResponse
from app.agents.outlet_performance import workflow as outlet_workflow
from app.agents.inventory import workflow as inventory_workflow
from app.agents.staff import workflow as staff_workflow

router = APIRouter(prefix="/agents", tags=["agents"])

@router.post("/outlet-performance/analyze", response_model=AgentResponse)
def analyze_outlet_performance(request: AgentRequest, db: Session = Depends(get_db)):
    return outlet_workflow.run_agent(request, db)

@router.post("/inventory/analyze", response_model=InventoryAgentResponse)
def analyze_inventory(request: InventoryAgentRequest, db: Session = Depends(get_db)):
    return inventory_workflow.run_agent(request, db)

@router.post("/staff/analyze", response_model=StaffAgentResponse)
def analyze_staff(request: StaffAgentRequest, db: Session = Depends(get_db)):
    return staff_workflow.run_agent(request, db)

from app.schemas.marketing_agent import MarketingAgentRequest, MarketingAgentResponse
from app.agents.marketing.workflow import run_marketing_agent

@router.post("/marketing/analyze", response_model=MarketingAgentResponse)
def analyze_marketing(request: MarketingAgentRequest, db: Session = Depends(get_db)):
    return run_marketing_agent(db, request)

from app.schemas.audit_agent import AuditAgentRequest, AuditAgentResponse
from app.agents.audit.workflow import run_audit_agent

@router.post("/audit/analyze", response_model=AuditAgentResponse)
def analyze_audit(request: AuditAgentRequest, db: Session = Depends(get_db)):
    return run_audit_agent(db, request)
