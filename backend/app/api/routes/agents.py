from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.schemas.agent import AgentRequest, AgentResponse
from app.schemas.inventory_agent import InventoryAgentRequest, InventoryAgentResponse
from app.agents.outlet_performance import workflow as outlet_workflow
from app.agents.inventory import workflow as inventory_workflow

router = APIRouter(prefix="/agents", tags=["agents"])

@router.post("/outlet-performance/analyze", response_model=AgentResponse)
def analyze_outlet_performance(request: AgentRequest, db: Session = Depends(get_db)):
    # Run the LangGraph agent for outlet performance
    return outlet_workflow.run_agent(request, db)

@router.post("/inventory/analyze", response_model=InventoryAgentResponse)
def analyze_inventory(request: InventoryAgentRequest, db: Session = Depends(get_db)):
    # Run the LangGraph agent for inventory
    return inventory_workflow.run_agent(request, db)
