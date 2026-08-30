from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime

from app.core.database import get_db
from app.analytics import service
from app.schemas import analytics as schemas

router = APIRouter(prefix="/analytics", tags=["analytics"])

@router.get("/summary", response_model=schemas.SummaryAnalytics)
def get_summary(
    start_date: Optional[datetime] = None,
    end_date: Optional[datetime] = None,
    outlet_id: Optional[int] = None,
    db: Session = Depends(get_db)
):
    if start_date and end_date and start_date > end_date:
        raise HTTPException(status_code=400, detail="start_date cannot be after end_date")
    return service.get_summary(db, start_date, end_date, outlet_id)

@router.get("/outlets", response_model=List[schemas.OutletPerformance])
def get_outlets_performance(
    start_date: Optional[datetime] = None,
    end_date: Optional[datetime] = None,
    db: Session = Depends(get_db)
):
    if start_date and end_date and start_date > end_date:
        raise HTTPException(status_code=400, detail="start_date cannot be after end_date")
    return service.get_outlet_performance(db, start_date, end_date)

@router.get("/products", response_model=List[schemas.ProductPerformance])
def get_products_performance(
    start_date: Optional[datetime] = None,
    end_date: Optional[datetime] = None,
    outlet_id: Optional[int] = None,
    limit: Optional[int] = Query(None, ge=1, le=100),
    db: Session = Depends(get_db)
):
    if start_date and end_date and start_date > end_date:
        raise HTTPException(status_code=400, detail="start_date cannot be after end_date")
    return service.get_product_performance(db, start_date, end_date, outlet_id, limit)

@router.get("/categories", response_model=List[schemas.CategoryPerformance])
def get_categories_performance(
    start_date: Optional[datetime] = None,
    end_date: Optional[datetime] = None,
    outlet_id: Optional[int] = None,
    db: Session = Depends(get_db)
):
    if start_date and end_date and start_date > end_date:
        raise HTTPException(status_code=400, detail="start_date cannot be after end_date")
    return service.get_category_performance(db, start_date, end_date, outlet_id)

@router.get("/trends", response_model=List[schemas.TimeSeriesPoint])
def get_trends(
    start_date: Optional[datetime] = None,
    end_date: Optional[datetime] = None,
    outlet_id: Optional[int] = None,
    db: Session = Depends(get_db)
):
    if start_date and end_date and start_date > end_date:
        raise HTTPException(status_code=400, detail="start_date cannot be after end_date")
    return service.get_time_series(db, start_date, end_date, outlet_id)

@router.get("/comparison", response_model=schemas.PeriodComparison)
def get_comparison(
    current_start: datetime,
    current_end: datetime,
    prev_start: datetime,
    prev_end: datetime,
    outlet_id: Optional[int] = None,
    db: Session = Depends(get_db)
):
    if current_start > current_end:
        raise HTTPException(status_code=400, detail="current_start cannot be after current_end")
    if prev_start > prev_end:
        raise HTTPException(status_code=400, detail="prev_start cannot be after prev_end")
        
    return service.get_period_comparison(
        db, current_start, current_end, prev_start, prev_end, outlet_id
    )

from app.schemas.scoring import FranchiseScoreResponse
from app.analytics import scoring

@router.get("/outlet-scores", response_model=FranchiseScoreResponse)
def get_outlet_scores(
    start_date: datetime,
    end_date: datetime,
    db: Session = Depends(get_db)
):
    if start_date > end_date:
        raise HTTPException(status_code=400, detail="start_date cannot be after end_date")
    return scoring.calculate_franchise_scores(db, start_date, end_date)

@router.get("/orders")
def get_recent_orders(limit: int = 5, db: Session = Depends(get_db)):
    from app.models.domain import Order, Outlet, OrderItem
    from sqlalchemy.orm import joinedload
    from sqlalchemy import desc
    
    orders = db.query(Order).options(joinedload(Order.outlet), joinedload(Order.items).joinedload(OrderItem.product)).order_by(desc(Order.order_timestamp)).limit(limit).all()
    
    return [
        {
            "id": o.id,
            "outlet_name": o.outlet.name,
            "items": [i.product.name for i in o.items],
            "timestamp": o.order_timestamp.isoformat(),
            "amount": float(o.total_amount),
            "status": o.status
        }
        for o in orders
    ]
