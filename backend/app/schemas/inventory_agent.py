from pydantic import BaseModel, Field
from typing import List, Optional

class InventoryAgentRequest(BaseModel):
    inventory_item_id: Optional[int] = None
    objective: str = Field(..., min_length=1)
    user_question: str = Field(..., min_length=1)

class InventoryAgentResponse(BaseModel):
    summary: str
    key_findings: List[str] = []
    risks: List[str] = []
    recommendations: List[str] = []
    confidence: Optional[str] = None
    data_sources_used: List[str] = []
