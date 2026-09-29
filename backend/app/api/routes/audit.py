from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime
from app.core.database import get_db
from app.analytics import audit as audit_analytics
from app.schemas.audit import (
    AuditFranchiseSnapshot,
    AuditAlert,
    AuditCrossDomainSignal,
    AuditOutletComparison
)

router = APIRouter(prefix="/audit", tags=["audit"])

def _validate_dates(start_date: Optional[datetime], end_date: Optional[datetime]):
    if start_date and end_date and start_date > end_date:
        raise HTTPException(status_code=400, detail="start_date cannot be after end_date")
    if not start_date or not end_date:
        # Require them for audit to be deterministic and safe
        raise HTTPException(status_code=400, detail="start_date and end_date are required")

@router.get("/snapshot", response_model=AuditFranchiseSnapshot)
def get_snapshot(
    start_date: datetime,
    end_date: datetime,
    outlet_id: Optional[int] = Query(None),
    db: Session = Depends(get_db)
):
    _validate_dates(start_date, end_date)
    return audit_analytics.get_franchise_snapshot(db, start_date, end_date, outlet_id)

@router.get("/alerts", response_model=List[AuditAlert])
def get_alerts(
    start_date: datetime,
    end_date: datetime,
    outlet_id: Optional[int] = Query(None),
    db: Session = Depends(get_db)
):
    _validate_dates(start_date, end_date)
    return audit_analytics.get_consolidated_alerts(db, start_date, end_date, outlet_id)

@router.get("/signals", response_model=List[AuditCrossDomainSignal])
def get_signals(
    start_date: datetime,
    end_date: datetime,
    outlet_id: Optional[int] = Query(None),
    db: Session = Depends(get_db)
):
    _validate_dates(start_date, end_date)
    return audit_analytics.get_cross_domain_signals(db, start_date, end_date, outlet_id)

@router.get("/outlets/{outlet_id}", response_model=AuditOutletComparison)
def compare_outlet(
    outlet_id: int,
    start_date: datetime,
    end_date: datetime,
    db: Session = Depends(get_db)
):
    _validate_dates(start_date, end_date)
    try:
        return audit_analytics.compare_outlet_domains(db, outlet_id, start_date, end_date)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
