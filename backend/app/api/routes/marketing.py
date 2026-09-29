from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime

from app.core.database import get_db
from app.analytics import marketing
from app.schemas import marketing as schemas
from app.schemas.analytics import TimeSeriesPoint
from app.analytics.service import get_time_series

router = APIRouter(prefix="/marketing", tags=["marketing"])

def _validate_dates(start_date: datetime, end_date: datetime):
    if start_date > end_date:
        raise HTTPException(status_code=400, detail="start_date cannot be after end_date")

@router.get("/summary", response_model=schemas.MarketingSummary)
def get_summary(
    start_date: datetime,
    end_date: datetime,
    outlet_id: Optional[int] = None,
    db: Session = Depends(get_db)
):
    _validate_dates(start_date, end_date)
    return marketing.get_marketing_summary(db, start_date, end_date, outlet_id)

@router.get("/products", response_model=List[schemas.ProductMarketingMetrics])
def get_products(
    start_date: datetime,
    end_date: datetime,
    outlet_id: Optional[int] = None,
    db: Session = Depends(get_db)
):
    _validate_dates(start_date, end_date)
    return marketing.get_product_marketing(db, start_date, end_date, outlet_id)

@router.get("/categories", response_model=List[schemas.CategoryMarketingMetrics])
def get_categories(
    start_date: datetime,
    end_date: datetime,
    outlet_id: Optional[int] = None,
    db: Session = Depends(get_db)
):
    _validate_dates(start_date, end_date)
    return marketing.get_category_marketing(db, start_date, end_date, outlet_id)

@router.get("/outlets", response_model=List[schemas.OutletMarketingMetrics])
def get_outlets(
    start_date: datetime,
    end_date: datetime,
    db: Session = Depends(get_db)
):
    _validate_dates(start_date, end_date)
    return marketing.get_outlet_marketing(db, start_date, end_date)

@router.get("/trends", response_model=List[TimeSeriesPoint])
def get_trends(
    start_date: datetime,
    end_date: datetime,
    outlet_id: Optional[int] = None,
    db: Session = Depends(get_db)
):
    _validate_dates(start_date, end_date)
    return get_time_series(db, start_date, end_date, outlet_id)

@router.get("/alerts", response_model=List[schemas.MarketingAlert])
def get_alerts(
    start_date: datetime,
    end_date: datetime,
    outlet_id: Optional[int] = None,
    db: Session = Depends(get_db)
):
    _validate_dates(start_date, end_date)
    return marketing.get_marketing_alerts(db, start_date, end_date, outlet_id)
