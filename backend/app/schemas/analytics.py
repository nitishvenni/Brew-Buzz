from pydantic import BaseModel, ConfigDict
from typing import List, Optional
from datetime import datetime, date
from decimal import Decimal

class MetricResult(BaseModel):
    value: Decimal
    label: Optional[str] = None

class PerformanceMetric(BaseModel):
    revenue: Decimal
    order_count: int
    aov: Decimal
    units_sold: int

class OutletPerformance(PerformanceMetric):
    outlet_id: int
    outlet_name: str

class ProductPerformance(BaseModel):
    product_id: int
    product_name: str
    category_name: str
    revenue: Decimal
    quantity_sold: int
    order_count: int

class CategoryPerformance(BaseModel):
    category_id: int
    category_name: str
    revenue: Decimal
    quantity_sold: int
    revenue_percentage: Optional[Decimal] = None

class TimeSeriesPoint(BaseModel):
    date: date
    revenue: Decimal
    order_count: int
    aov: Decimal

class PeriodComparison(BaseModel):
    current_revenue: Decimal
    previous_revenue: Decimal
    absolute_change: Decimal
    percentage_change: Decimal
    direction: str  # "increase", "decrease", "unchanged"

class SummaryAnalytics(PerformanceMetric):
    pass
