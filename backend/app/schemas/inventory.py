from datetime import date, datetime
from decimal import Decimal
from typing import List, Optional
from pydantic import BaseModel, ConfigDict


class InventoryItemResponse(BaseModel):
    """Schema for listing inventory items with computed analytics."""
    id: int
    outlet_id: int
    outlet_name: str
    ingredient_id: int
    ingredient_name: str
    ingredient_category: str
    current_quantity: float
    unit: str
    reorder_level: float
    safety_stock: float
    supplier_lead_time_days: int
    average_daily_consumption: float
    days_remaining: Optional[float] = None
    status: str
    unit_cost: Optional[float] = None
    inventory_value: Optional[float] = None
    last_purchase_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)


class InventorySummaryResponse(BaseModel):
    """Aggregate stock health summary across outlets."""
    total_items: int
    critical_items: int
    low_items: int
    watch_items: int
    healthy_items: int
    overstock_items: int
    total_inventory_value: Optional[float] = None

    model_config = ConfigDict(from_attributes=True)


class InventoryAlertResponse(BaseModel):
    """Deterministic inventory alert."""
    severity: str
    title: str
    message: str
    inventory_item_id: int
    ingredient_name: str
    outlet_name: str

    model_config = ConfigDict(from_attributes=True)


class ReorderRecommendationResponse(BaseModel):
    """Deterministic reorder recommendation for an inventory item."""
    inventory_item_id: int
    ingredient_name: str
    ingredient_category: str
    outlet_name: str
    unit: str
    current_stock: float
    days_remaining: Optional[float] = None
    average_daily_consumption: float
    lead_time_days: int
    safety_stock: float
    expected_lead_time_consumption: float
    recommended_quantity: float
    priority: str

    model_config = ConfigDict(from_attributes=True)


class InventoryDetailResponse(InventoryItemResponse):
    """Extended item detail with full analytics breakdown."""
    wastage_rate: float
    consumption_growth: Optional[float] = None
    sales_vs_consumption: Optional[str] = None
    sales_vs_consumption_variance: Optional[float] = None
    strengths: List[str] = []
    weaknesses: List[str] = []


class InventoryTrendPoint(BaseModel):
    """Single data point for inventory trend charts."""
    date: date
    consumption: float
    wastage: float
    purchases: float
    stock_level: Optional[float] = None

    model_config = ConfigDict(from_attributes=True)


class InventoryHistoryEntry(BaseModel):
    """Single inventory transaction record."""
    id: int
    transaction_type: str
    quantity: float
    reference: Optional[str] = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
