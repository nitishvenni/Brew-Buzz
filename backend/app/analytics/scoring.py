from typing import List, Dict, Any, Optional
from datetime import datetime, timedelta
from decimal import Decimal
from sqlalchemy.orm import Session

from app.analytics import queries
from app.schemas.scoring import OutletScore, ScoreComponents, FranchiseScoreResponse

def get_performance_band(score: int) -> str:
    if score >= 90: return "Excellent"
    if score >= 75: return "Strong"
    if score >= 60: return "Watch"
    if score >= 40: return "Needs Attention"
    return "Critical"

def _safe_float(val: Decimal) -> float:
    return float(val) if val is not None else 0.0

def calculate_franchise_scores(
    db: Session,
    start_date: datetime,
    end_date: datetime
) -> FranchiseScoreResponse:
    
    current_data = queries.get_outlet_performance(db, start_date, end_date)
    
    if not current_data:
        return FranchiseScoreResponse(franchise_average_score=0, outlet_scores=[])

    # Calculate previous period for growth
    period_duration = end_date - start_date
    prev_start = start_date - period_duration
    prev_end = start_date
    
    prev_data = queries.get_outlet_performance(db, prev_start, prev_end)
    prev_dict = {d["outlet_id"]: d for d in prev_data}

    # Identify maxes and averages
    max_rev = max([_safe_float(d["revenue"]) for d in current_data]) if current_data else 0.0
    max_ord = max([d["order_count"] for d in current_data]) if current_data else 0
    max_aov = max([_safe_float(d["aov"]) for d in current_data]) if current_data else 0.0
    
    total_rev = sum([_safe_float(d["revenue"]) for d in current_data])
    avg_rev = total_rev / len(current_data) if len(current_data) > 0 else 0.0

    outlet_scores: List[OutletScore] = []
    total_score = 0
    
    for outlet in current_data:
        rev = _safe_float(outlet["revenue"])
        ord_cnt = outlet["order_count"]
        aov = _safe_float(outlet["aov"])
        
        # 1. Revenue Score (30%)
        rev_score = (rev / max_rev * 100.0) if max_rev > 0 else 0.0
        rev_score = min(100.0, max(0.0, rev_score))
        
        # 2. Order Score (20%)
        ord_score = (ord_cnt / max_ord * 100.0) if max_ord > 0 else 0.0
        ord_score = min(100.0, max(0.0, ord_score))
        
        # 3. AOV Score (15%)
        aov_score = (aov / max_aov * 100.0) if max_aov > 0 else 0.0
        aov_score = min(100.0, max(0.0, aov_score))
        
        # 4. Growth Score (15%)
        prev_rev = _safe_float(prev_dict.get(outlet["outlet_id"], {}).get("revenue", Decimal(0)))
        if prev_rev > 0:
            growth_pct = ((rev - prev_rev) / prev_rev) * 100.0
        elif rev > 0:
            growth_pct = 100.0
        else:
            growth_pct = 0.0
            
        # Map growth (-50 to +50 -> 0 to 100)
        # 0 growth = 50. -50 = 0. +50 = 100.
        growth_score = growth_pct + 50.0
        growth_score = min(100.0, max(0.0, growth_score))
        
        # 5. Benchmark Score (20%)
        bench_score = (rev / avg_rev * 50.0) if avg_rev > 0 else 0.0
        bench_score = min(100.0, max(0.0, bench_score))
        
        rev_vs_bench = ((rev / avg_rev) - 1.0) * 100.0 if avg_rev > 0 else 0.0
        
        # Overall
        overall_float = (rev_score * 0.30) + (ord_score * 0.20) + (aov_score * 0.15) + (growth_score * 0.15) + (bench_score * 0.20)
        overall_int = int(round(overall_float))
        
        strengths = []
        weaknesses = []
        
        if rev_score >= 80: strengths.append("High Revenue Driver")
        if ord_score >= 80: strengths.append("High Volume")
        if growth_pct >= 10: strengths.append("Strong Growth")
        if aov_score >= 80: strengths.append("High AOV")
        
        if growth_pct <= -10: weaknesses.append("Declining Revenue")
        if rev_vs_bench <= -20: weaknesses.append("Below Average Revenue")
        if ord_score < 40 and max_ord > 0: weaknesses.append("Low Volume")
        
        outlet_scores.append(OutletScore(
            outlet_id=outlet["outlet_id"],
            outlet_name=outlet["outlet_name"],
            overall_score=overall_int,
            performance_band=get_performance_band(overall_int),
            components=ScoreComponents(
                revenue_score=round(rev_score, 1),
                orders_score=round(ord_score, 1),
                aov_score=round(aov_score, 1),
                growth_score=round(growth_score, 1),
                benchmark_score=round(bench_score, 1)
            ),
            revenue_vs_benchmark=round(rev_vs_bench, 1),
            growth_percentage=round(growth_pct, 1),
            strengths=strengths,
            weaknesses=weaknesses
        ))
        
        total_score += overall_int
        
    # Sort by score desc, then by name
    outlet_scores.sort(key=lambda x: (-x.overall_score, x.outlet_name))
    
    avg_score = int(round(total_score / len(outlet_scores))) if outlet_scores else 0
    
    return FranchiseScoreResponse(
        franchise_average_score=avg_score,
        outlet_scores=outlet_scores
    )
