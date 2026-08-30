from pydantic import BaseModel, Field
from typing import List, Optional, Any, Dict
from datetime import datetime

class AgentRequest(BaseModel):
    outlet_id: int
    start_date: datetime
    end_date: datetime
    objective: str
    user_question: str

class FindingEvidence(BaseModel):
    metric: str
    current_value: Optional[float] = None
    comparison_value: Optional[float] = None
    change: Optional[float] = None
    source: str

class AgentFinding(BaseModel):
    finding_type: str
    severity: str
    statement: str
    evidence: List[FindingEvidence]

class AgentResponse(BaseModel):
    summary: str
    evidence: List[FindingEvidence] = []
    findings: List[AgentFinding] = []
    recommendations: List[str] = []
    limitations: List[str] = []
    tools_used: List[str] = []
    confidence: str
