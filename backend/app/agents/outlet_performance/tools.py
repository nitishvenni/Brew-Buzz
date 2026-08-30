from typing import Dict, Any, List, Optional
from datetime import datetime
from sqlalchemy.orm import Session
from decimal import Decimal

from app.analytics import service as analytics_service

def get_outlet_metrics(db: Session, outlet_id: int, start_date: datetime, end_date: datetime) -> Dict[str, Any]:
    summary = analytics_service.get_summary(db, start_date, end_date, outlet_id)
    return {
        "outlet_id": outlet_id,
        "revenue": float(summary.revenue),
        "order_count": summary.order_count,
        "units_sold": summary.units_sold,
        "aov": float(summary.aov)
    }

def get_outlet_trend(db: Session, outlet_id: int, start_date: datetime, end_date: datetime) -> List[Dict[str, Any]]:
    trends = analytics_service.get_time_series(db, start_date, end_date, outlet_id)
    return [
        {
            "date": t.date.isoformat(),
            "revenue": float(t.revenue),
            "order_count": t.order_count,
            "aov": float(t.aov)
        }
        for t in trends
    ]

def get_outlet_benchmark(db: Session, outlet_id: int, start_date: datetime, end_date: datetime) -> Dict[str, Any]:
    all_outlets = analytics_service.get_outlet_performance(db, start_date, end_date)
    
    if not all_outlets:
        return {"error": "No data available for benchmark"}
        
    total_rev = sum([o.revenue for o in all_outlets])
    total_orders = sum([o.order_count for o in all_outlets])
    peer_count = len(all_outlets)
    
    peer_avg_revenue = float(total_rev) / peer_count if peer_count > 0 else 0.0
    peer_avg_orders = total_orders / peer_count if peer_count > 0 else 0
    
    outlet_perf = next((o for o in all_outlets if o.outlet_id == outlet_id), None)
    
    if not outlet_perf:
        return {"error": "Outlet not found in period data"}
        
    return {
        "outlet_id": outlet_id,
        "outlet_revenue": float(outlet_perf.revenue),
        "peer_avg_revenue": peer_avg_revenue,
        "outlet_orders": outlet_perf.order_count,
        "peer_avg_orders": peer_avg_orders,
        "revenue_vs_avg_pct": float((outlet_perf.revenue / Decimal(peer_avg_revenue) - 1) * 100) if peer_avg_revenue > 0 else 0.0
    }

def get_outlet_category_breakdown(db: Session, outlet_id: int, start_date: datetime, end_date: datetime) -> List[Dict[str, Any]]:
    categories = analytics_service.get_category_performance(db, start_date, end_date, outlet_id)
    return [
        {
            "category_name": c.category_name,
            "revenue": float(c.revenue),
            "quantity_sold": c.quantity_sold,
            "revenue_percentage": float(c.revenue_percentage) if c.revenue_percentage is not None else 0.0
        }
        for c in categories
    ]
