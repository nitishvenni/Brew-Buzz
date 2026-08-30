from pydantic import BaseModel
from typing import List, Optional
from decimal import Decimal

class ScoreComponents(BaseModel):
    revenue_score: float
    orders_score: float
    aov_score: float
    growth_score: float
    benchmark_score: float

class OutletScore(BaseModel):
    outlet_id: int
    outlet_name: str
    overall_score: int
    performance_band: str
    components: ScoreComponents
    revenue_vs_benchmark: float
    growth_percentage: float
    strengths: List[str]
    weaknesses: List[str]

class FranchiseScoreResponse(BaseModel):
    franchise_average_score: int
    outlet_scores: List[OutletScore]
