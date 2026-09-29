from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime
from decimal import Decimal
from enum import Enum

class MarketingSignal(str, Enum):
    SURGING = "SURGING"
    GROWING = "GROWING"
    STABLE = "STABLE"
    DECLINING = "DECLINING"
    NO_BASELINE = "NO_BASELINE"

class AlertSeverity(str, Enum):
    HIGH = "HIGH"
    MEDIUM = "MEDIUM"
    LOW = "LOW"

class MarketingSummary(BaseModel):
    revenue: Decimal
    orders: int
    aov: Decimal
    revenue_growth_pct: Optional[Decimal]
    order_growth_pct: Optional[Decimal]
    aov_growth_pct: Optional[Decimal]
    peak_hour: Optional[int]
    peak_day: Optional[str]
    product_count: int
    category_count: int
    outlet_count: int

class ProductMarketingMetrics(BaseModel):
    product_id: int
    product_name: str
    category_name: Optional[str]
    revenue: Decimal
    quantity_sold: int
    order_count: int
    revenue_contribution_pct: Decimal
    growth_pct: Optional[Decimal]
    signal: MarketingSignal

class CategoryMarketingMetrics(BaseModel):
    category_id: int
    category_name: str
    revenue: Decimal
    quantity_sold: int
    revenue_contribution_pct: Decimal
    growth_pct: Optional[Decimal]
    signal: MarketingSignal

class OutletMarketingMetrics(BaseModel):
    outlet_id: int
    outlet_name: str
    revenue: Decimal
    orders: int
    aov: Decimal
    revenue_growth_pct: Optional[Decimal]
    order_growth_pct: Optional[Decimal]
    signal: MarketingSignal

class MarketingAlert(BaseModel):
    type: str
    severity: AlertSeverity
    entity_id: Optional[int]
    entity_name: str
    metric: str
    value: Decimal
    threshold: Decimal
    message: str
