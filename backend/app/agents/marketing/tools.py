from typing import Optional, Dict, Any
from datetime import datetime
from sqlalchemy.orm import Session
from decimal import Decimal

from app.analytics.marketing import (
    get_marketing_summary,
    get_product_marketing,
    get_category_marketing,
    get_outlet_marketing,
    get_marketing_alerts
)
from app.analytics.service import get_time_series

# Helper to serialize Decimal to float/str for LangGraph safety
def _serialize(obj: Any) -> Any:
    if isinstance(obj, Decimal):
        return float(obj)
    if isinstance(obj, dict):
        return {k: _serialize(v) for k, v in obj.items()}
    if isinstance(obj, list):
        return [_serialize(v) for v in obj]
    if hasattr(obj, 'dict'):
        return _serialize(obj.dict())
    if hasattr(obj, 'model_dump'):
        return _serialize(obj.model_dump())
    return obj

def get_marketing_summary_tool(db: Session, start_date: Optional[datetime] = None, end_date: Optional[datetime] = None, outlet_id: Optional[int] = None) -> dict:
    """Retrieve franchise-level marketing summary facts (revenue, orders, growth) for a date range."""
    try:
        if not start_date or not end_date:
            raise ValueError("start_date and end_date are required")
        if start_date > end_date:
            raise ValueError("start_date cannot be after end_date")
        res = get_marketing_summary(db, start_date, end_date, outlet_id)
        return {
            "period": {
                "start_date": start_date.isoformat(),
                "end_date": end_date.isoformat()
            },
            "outlet_id": outlet_id,
            "metrics": _serialize(res)
        }
    except Exception as e:
        return {"error": str(e)}

def get_product_demand_tool(db: Session, start_date: Optional[datetime] = None, end_date: Optional[datetime] = None, outlet_id: Optional[int] = None) -> dict:
    """Retrieve product-level demand facts, revenue mix, and demand growth signals."""
    try:
        if not start_date or not end_date:
            raise ValueError("start_date and end_date are required")
        if start_date > end_date:
            raise ValueError("start_date cannot be after end_date")
        res = get_product_marketing(db, start_date, end_date, outlet_id)
        return {
            "period": {
                "start_date": start_date.isoformat(),
                "end_date": end_date.isoformat()
            },
            "outlet_id": outlet_id,
            "products": _serialize(res)
        }
    except Exception as e:
        return {"error": str(e)}

def get_category_mix_tool(db: Session, start_date: Optional[datetime] = None, end_date: Optional[datetime] = None, outlet_id: Optional[int] = None) -> dict:
    """Retrieve category-level performance, mix percentage, and demand signals."""
    try:
        if not start_date or not end_date:
            raise ValueError("start_date and end_date are required")
        if start_date > end_date:
            raise ValueError("start_date cannot be after end_date")
        res = get_category_marketing(db, start_date, end_date, outlet_id)
        return {
            "period": {
                "start_date": start_date.isoformat(),
                "end_date": end_date.isoformat()
            },
            "outlet_id": outlet_id,
            "categories": _serialize(res)
        }
    except Exception as e:
        return {"error": str(e)}

def compare_outlet_demand_tool(db: Session, start_date: Optional[datetime] = None, end_date: Optional[datetime] = None) -> dict:
    """Compare marketing and demand performance across all Brew Buzz outlets."""
    try:
        if not start_date or not end_date:
            raise ValueError("start_date and end_date are required")
        if start_date > end_date:
            raise ValueError("start_date cannot be after end_date")
        res = get_outlet_marketing(db, start_date, end_date)
        return {
            "period": {
                "start_date": start_date.isoformat(),
                "end_date": end_date.isoformat()
            },
            "outlets": _serialize(res)
        }
    except Exception as e:
        return {"error": str(e)}

def get_marketing_alerts_tool(db: Session, start_date: Optional[datetime] = None, end_date: Optional[datetime] = None, outlet_id: Optional[int] = None) -> dict:
    """Retrieve deterministic marketing alerts (surges, declines, drops) identified by the analytics engine."""
    try:
        if not start_date or not end_date:
            raise ValueError("start_date and end_date are required")
        if start_date > end_date:
            raise ValueError("start_date cannot be after end_date")
        res = get_marketing_alerts(db, start_date, end_date, outlet_id)
        return {
            "period": {
                "start_date": start_date.isoformat(),
                "end_date": end_date.isoformat()
            },
            "outlet_id": outlet_id,
            "alerts": _serialize(res)
        }
    except Exception as e:
        return {"error": str(e)}

def get_marketing_trends_tool(db: Session, start_date: Optional[datetime] = None, end_date: Optional[datetime] = None, outlet_id: Optional[int] = None) -> dict:
    """Retrieve time-series demand information (daily revenue, orders, AOV)."""
    try:
        if not start_date or not end_date:
            raise ValueError("start_date and end_date are required")
        if start_date > end_date:
            raise ValueError("start_date cannot be after end_date")
        res = get_time_series(db, start_date, end_date, outlet_id)
        return {
            "period": {
                "start_date": start_date.isoformat(),
                "end_date": end_date.isoformat()
            },
            "outlet_id": outlet_id,
            "trends": _serialize(res)
        }
    except Exception as e:
        return {"error": str(e)}
