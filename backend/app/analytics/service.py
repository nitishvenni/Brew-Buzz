from sqlalchemy.orm import Session
from datetime import datetime
from typing import Optional, List
from decimal import Decimal

from app.analytics import queries
from app.schemas import analytics as schemas

def get_summary(db: Session, start_date: Optional[datetime] = None, end_date: Optional[datetime] = None, outlet_id: Optional[int] = None) -> schemas.SummaryAnalytics:
    data = queries.get_summary_metrics(db, start_date, end_date, outlet_id)
    return schemas.SummaryAnalytics(**data)

def get_outlet_performance(db: Session, start_date: Optional[datetime] = None, end_date: Optional[datetime] = None) -> List[schemas.OutletPerformance]:
    data = queries.get_outlet_performance(db, start_date, end_date)
    return [schemas.OutletPerformance(**d) for d in data]

def get_product_performance(db: Session, start_date: Optional[datetime] = None, end_date: Optional[datetime] = None, outlet_id: Optional[int] = None, limit: Optional[int] = None) -> List[schemas.ProductPerformance]:
    data = queries.get_product_performance(db, start_date, end_date, outlet_id, limit)
    return [schemas.ProductPerformance(**d) for d in data]

def get_category_performance(db: Session, start_date: Optional[datetime] = None, end_date: Optional[datetime] = None, outlet_id: Optional[int] = None) -> List[schemas.CategoryPerformance]:
    data = queries.get_category_performance(db, start_date, end_date, outlet_id)
    return [schemas.CategoryPerformance(**d) for d in data]

def get_time_series(db: Session, start_date: Optional[datetime] = None, end_date: Optional[datetime] = None, outlet_id: Optional[int] = None) -> List[schemas.TimeSeriesPoint]:
    data = queries.get_time_series(db, start_date, end_date, outlet_id)
    return [schemas.TimeSeriesPoint(**d) for d in data]

def get_period_comparison(
    db: Session, 
    current_start: datetime, 
    current_end: datetime, 
    prev_start: datetime, 
    prev_end: datetime,
    outlet_id: Optional[int] = None
) -> schemas.PeriodComparison:
    
    current_data = queries.get_summary_metrics(db, current_start, current_end, outlet_id)
    prev_data = queries.get_summary_metrics(db, prev_start, prev_end, outlet_id)
    
    current_rev = current_data["revenue"]
    prev_rev = prev_data["revenue"]
    
    absolute_change = current_rev - prev_rev
    
    if prev_rev > 0:
        percentage_change = (absolute_change / prev_rev) * Decimal('100.0')
    elif current_rev > 0:
        percentage_change = Decimal('100.0')
    else:
        percentage_change = Decimal('0.0')
        
    if absolute_change > 0:
        direction = "increase"
    elif absolute_change < 0:
        direction = "decrease"
    else:
        direction = "unchanged"
        
    return schemas.PeriodComparison(
        current_revenue=current_rev,
        previous_revenue=prev_rev,
        absolute_change=absolute_change,
        percentage_change=percentage_change,
        direction=direction
    )
