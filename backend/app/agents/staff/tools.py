from typing import Optional, List, Dict, Any
from datetime import datetime
from sqlalchemy.orm import Session

from app.analytics.workforce import (
    get_workforce_summary,
    get_outlet_metrics,
    get_employee_metrics,
    get_workforce_alerts,
    get_workforce_trends
)

# SAFETY BOUNDARY CONSTRAINTS FOR FUTURE SYSTEM PROMPT:
# The agent MUST be restricted to measurable operational facts.
# Allowed: attendance, absence, lateness, overtime, scheduled vs actual hours, workload density, health, trends, alerts.
# Forbidden: personality judgments, character judgments, motivation, intelligence, mental-state, job suitability, "lazy", "bad", "unreliable".

def get_workforce_summary_tool(db: Session, start_date: Optional[datetime] = None, end_date: Optional[datetime] = None, outlet_id: Optional[int] = None) -> dict:
    """Retrieve franchise-level workforce facts for a selected date range."""
    try:
        res = get_workforce_summary(db, start_date, end_date, outlet_id)
        return {
            "period": {
                "start_date": start_date.isoformat() if start_date else None,
                "end_date": end_date.isoformat() if end_date else None
            },
            "metrics": res
        }
    except Exception as e:
        return {"error": str(e)}

def compare_outlets_tool(db: Session, start_date: Optional[datetime] = None, end_date: Optional[datetime] = None) -> dict:
    """Retrieve workforce metrics for all outlets so the AI can compare operational conditions."""
    try:
        res = get_outlet_metrics(db, start_date, end_date)
        return {
            "period": {
                "start_date": start_date.isoformat() if start_date else None,
                "end_date": end_date.isoformat() if end_date else None
            },
            "metrics": res
        }
    except Exception as e:
        return {"error": str(e)}

def get_employee_workforce_metrics_tool(db: Session, employee_id: int, start_date: Optional[datetime] = None, end_date: Optional[datetime] = None) -> dict:
    """Retrieve measurable workforce metrics for a specific employee."""
    try:
        res = get_employee_metrics(db, employee_id, start_date, end_date)
        if not res:
            return {"error": "Employee not found or no data for period."}
        
        # Data minimization: exclude personal information (name, etc.)
        safe_metrics = {
            "employee_code": res.get("employee_code"),
            "role": res.get("role"),
            "outlet": res.get("outlet"),
            "scheduled_shifts": res.get("scheduled_shifts"),
            "completed_shifts": res.get("completed_shifts"),
            "absent_shifts": res.get("absent_shifts"),
            "late_shifts": res.get("late_shifts"),
            "scheduled_hours": res.get("scheduled_hours"),
            "actual_hours": res.get("actual_hours"),
            "overtime_hours": res.get("overtime_hours"),
            "attendance_rate": res.get("attendance_rate"),
            "late_rate": res.get("late_rate"),
            "average_hours_per_shift": res.get("average_hours_per_shift")
        }
        
        return {
            "period": {
                "start_date": start_date.isoformat() if start_date else None,
                "end_date": end_date.isoformat() if end_date else None
            },
            "metrics": safe_metrics
        }
    except Exception as e:
        return {"error": str(e)}

def get_workforce_alerts_tool(db: Session, start_date: Optional[datetime] = None, end_date: Optional[datetime] = None) -> dict:
    """Retrieve workforce operational alerts."""
    try:
        res = get_workforce_alerts(db, start_date, end_date)
        return {
            "period": {
                "start_date": start_date.isoformat() if start_date else None,
                "end_date": end_date.isoformat() if end_date else None
            },
            "metrics": res
        }
    except Exception as e:
        return {"error": str(e)}

def get_workforce_trends_tool(db: Session, start_date: Optional[datetime] = None, end_date: Optional[datetime] = None) -> dict:
    """Retrieve workforce trend data."""
    try:
        res = get_workforce_trends(db, start_date, end_date)
        return {
            "period": {
                "start_date": start_date.isoformat() if start_date else None,
                "end_date": end_date.isoformat() if end_date else None
            },
            "metrics": res
        }
    except Exception as e:
        return {"error": str(e)}
