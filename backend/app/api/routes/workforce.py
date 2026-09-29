from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime
from app.core.database import get_db
from app.schemas.workforce import (
    WorkforceSummary, EmployeeWorkforceMetrics, OutletWorkforceMetrics, 
    WorkforceTrend, WorkforceAlert
)
from app.analytics import workforce

router = APIRouter(prefix="/analytics/workforce", tags=["Workforce Analytics"])

def validate_dates(start_date: Optional[datetime], end_date: Optional[datetime]):
    if start_date and end_date and start_date > end_date:
        raise HTTPException(status_code=400, detail="start_date cannot be after end_date")

@router.get("/summary", response_model=WorkforceSummary)
def get_summary(
    start_date: Optional[datetime] = None, 
    end_date: Optional[datetime] = None, 
    outlet_id: Optional[int] = None, 
    db: Session = Depends(get_db)
):
    validate_dates(start_date, end_date)
    summary = workforce.get_workforce_summary(db, start_date, end_date, outlet_id)
    return WorkforceSummary(**summary)

@router.get("/outlets", response_model=List[OutletWorkforceMetrics])
def get_outlets_summary(
    start_date: Optional[datetime] = None, 
    end_date: Optional[datetime] = None, 
    db: Session = Depends(get_db)
):
    validate_dates(start_date, end_date)
    outlets_data = workforce.get_outlet_metrics(db, start_date, end_date)
    return [OutletWorkforceMetrics(**o) for o in outlets_data]

@router.get("/employees", response_model=List[EmployeeWorkforceMetrics])
def get_employees(
    outlet_id: Optional[int] = None,
    role_id: Optional[int] = None,
    employment_status: Optional[str] = None,
    start_date: Optional[datetime] = None, 
    end_date: Optional[datetime] = None, 
    db: Session = Depends(get_db)
):
    validate_dates(start_date, end_date)
    from app.models.domain import Employee
    filters = []
    if outlet_id: filters.append(Employee.outlet_id == outlet_id)
    if role_id: filters.append(Employee.role_id == role_id)
    if employment_status: filters.append(Employee.employment_status == employment_status)
    
    employees = db.query(Employee).filter(*filters).all()
    results = []
    for e in employees:
        metrics = workforce.get_employee_metrics(db, e.id, start_date, end_date)
        if metrics: results.append(EmployeeWorkforceMetrics(**metrics))
    return results

@router.get("/employees/{employee_id}", response_model=EmployeeWorkforceMetrics)
def get_employee_detail(
    employee_id: int,
    start_date: Optional[datetime] = None, 
    end_date: Optional[datetime] = None, 
    db: Session = Depends(get_db)
):
    validate_dates(start_date, end_date)
    metrics = workforce.get_employee_metrics(db, employee_id, start_date, end_date)
    if not metrics:
        raise HTTPException(status_code=404, detail="Employee not found")
    return EmployeeWorkforceMetrics(**metrics)

@router.get("/trends", response_model=List[WorkforceTrend])
def get_trends(
    start_date: Optional[datetime] = None, 
    end_date: Optional[datetime] = None, 
    db: Session = Depends(get_db)
):
    validate_dates(start_date, end_date)
    trends_data = workforce.get_workforce_trends(db, start_date, end_date)
    return [WorkforceTrend(**t) for t in trends_data]

@router.get("/alerts", response_model=List[WorkforceAlert])
def get_alerts(
    start_date: Optional[datetime] = None, 
    end_date: Optional[datetime] = None, 
    db: Session = Depends(get_db)
):
    validate_dates(start_date, end_date)
    alerts_data = workforce.get_workforce_alerts(db, start_date, end_date)
    return [WorkforceAlert(**a) for a in alerts_data]

