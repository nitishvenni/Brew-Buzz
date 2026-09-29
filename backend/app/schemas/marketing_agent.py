from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime

class MarketingAgentRequest(BaseModel):
    outlet_id: Optional[int] = None
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    objective: str = Field(..., min_length=1)
    user_question: str = Field(..., min_length=1)

class MarketingAgentResponse(BaseModel):
    summary: str
    key_findings: List[str] = []
    risks: List[str] = []
    recommendations: List[str] = []
    confidence: Optional[str] = None
    data_sources_used: List[str] = []
