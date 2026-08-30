from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.schemas.agent import AgentRequest, AgentResponse
from app.agents.outlet_performance import workflow

router = APIRouter(prefix="/agents/outlet-performance", tags=["agents"])

@router.post("/analyze", response_model=AgentResponse)
def analyze_outlet_performance(request: AgentRequest, db: Session = Depends(get_db)):
    # Run the LangGraph agent
    return workflow.run_agent(request, db)
