from datetime import datetime
from typing import Optional, List, Dict, Any
from sqlalchemy.orm import Session

from app.api.routes.inventory import (
    get_inventory_item_detail,
    get_inventory_trends,
    get_inventory_item_history,
    get_reorder_recommendations,
    get_inventory_alerts,
    get_inventory_summary,
    get_inventory_items
)

def get_inventory_item_metrics_tool(db: Session, inventory_item_id: int) -> dict:
    """Get core metrics and health classification for a specific inventory item."""
    try:
        res = get_inventory_item_detail(item_id=inventory_item_id, db=db)
        return res.model_dump()
    except Exception as e:
        return {"error": str(e)}

def get_inventory_consumption_trend_tool(db: Session, inventory_item_id: int, start_date: Optional[datetime] = None, end_date: Optional[datetime] = None) -> List[dict]:
    """Get daily consumption trend data."""
    try:
        res = get_inventory_trends(item_id=inventory_item_id, start_date=start_date, end_date=end_date, db=db)
        return [r.model_dump() for r in res]
    except Exception as e:
        return [{"error": str(e)}]

def get_inventory_history_tool(db: Session, inventory_item_id: int, limit: int = 10) -> List[dict]:
    """Get transaction history (purchase, consumption, wastage)."""
    try:
        res = get_inventory_item_history(item_id=inventory_item_id, db=db)
        return [r.model_dump() for r in res[-limit:]]
    except Exception as e:
        return [{"error": str(e)}]

def get_reorder_recommendation_tool(db: Session, inventory_item_id: int) -> dict:
    """Get reorder recommendation for a specific item."""
    try:
        res = get_reorder_recommendations(db=db)
        for r in res:
            if r.inventory_item_id == inventory_item_id:
                return r.model_dump()
        return {"message": "No urgent or high priority reorder recommendation."}
    except Exception as e:
        return {"error": str(e)}

def get_inventory_alerts_tool(db: Session) -> List[dict]:
    """Get all current inventory alerts across the system."""
    try:
        res = get_inventory_alerts(db=db)
        return [r.model_dump() for r in res]
    except Exception as e:
        return [{"error": str(e)}]

def get_inventory_summary_tool(db: Session) -> dict:
    """Get overall inventory health summary counts."""
    try:
        res = get_inventory_summary(db=db)
        return res.model_dump()
    except Exception as e:
        return {"error": str(e)}

def compare_inventory_items_tool(db: Session) -> List[dict]:
    """Get all items to compare their stockout risk."""
    try:
        res = get_inventory_items(db=db)
        # return a summary of critical/low items to avoid giant payloads
        critical_and_low = [r for r in res if r.status in ["CRITICAL", "LOW"]]
        return [r.model_dump() for r in critical_and_low]
    except Exception as e:
        return [{"error": str(e)}]
