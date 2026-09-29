from pydantic import BaseModel, Field
from typing import List, Optional, Literal
from datetime import datetime
from app.schemas.audit import StructuredEvidence

class InvestigationOutletContext(BaseModel):
    revenue: Optional[float] = None
    orders: Optional[int] = None
    active_staff: Optional[int] = None
    attendance_rate: Optional[float] = None
    critical_inventory_count: Optional[int] = None
    revenue_growth_pct: Optional[float] = None

class ManagementAction(BaseModel):
    action: str = Field(..., min_length=1)
    rationale: str = Field(..., min_length=1)
    priority: Literal["HIGH", "MEDIUM", "LOW"]
    supporting_evidence: List[str] = Field(default_factory=list)
    expected_operational_effect: str = Field(..., min_length=1)
    monitor: str = Field(..., min_length=1)

class AuditAgentRequest(BaseModel):
    outlet_id: Optional[int] = None
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    objective: str = Field(..., min_length=1)
    user_question: str = Field(..., min_length=1)
    structured_evidence: Optional[List[StructuredEvidence]] = None
    outlet_context: Optional[InvestigationOutletContext] = None

class AuditAgentResponse(BaseModel):
    summary: str
    cross_domain_signals: List[str] = []
    attention_areas: List[str] = []
    recommendations: List[ManagementAction] = []
    confidence: Optional[Literal["High", "Medium", "Low"]] = None
    data_sources_used: List[str] = []
