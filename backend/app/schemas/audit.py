from pydantic import BaseModel, ConfigDict
from typing import List, Optional
from decimal import Decimal

class SnapshotOutletMetrics(BaseModel):
    revenue: float
    orders: int
    aov: float
    growth_pct: Optional[float] = None

class SnapshotInventoryMetrics(BaseModel):
    critical_items: int
    low_stock_items: int
    total_inventory_value: Optional[float] = None

class SnapshotWorkforceMetrics(BaseModel):
    active_staff: int
    attendance_rate: float
    overtime_hours: float
    orders_per_staff_hour: float

class SnapshotMarketingMetrics(BaseModel):
    revenue_growth_pct: Optional[float] = None
    order_growth_pct: Optional[float] = None
    aov_growth_pct: Optional[float] = None
    product_count: int

class AuditFranchiseSnapshot(BaseModel):
    outlet_metrics: SnapshotOutletMetrics
    inventory_metrics: SnapshotInventoryMetrics
    workforce_metrics: SnapshotWorkforceMetrics
    marketing_metrics: SnapshotMarketingMetrics

class AuditAlert(BaseModel):
    domain: str
    alert_type: str
    severity: str
    title: str
    description: str
    outlet_id: Optional[int] = None
    metric_value: Optional[float] = None
    threshold: Optional[float] = None

class EvidenceMetric(BaseModel):
    label: str
    value: float | str
    unit: Optional[str] = None
    direction: Optional[str] = None
    comparison: Optional[str] = None
    status: Optional[str] = None

class StructuredEvidence(BaseModel):
    domain: str
    title: str
    metrics: List[EvidenceMetric]

class AuditCrossDomainSignal(BaseModel):
    signal_type: str
    severity: str
    domain_a: str
    domain_b: str
    outlet_id: Optional[int] = None
    title: str
    description: str
    evidence: List[str]
    structured_evidence: Optional[List[StructuredEvidence]] = None

class AuditOutletComparison(BaseModel):
    outlet_id: int
    outlet_name: str
    outlet_health_score: Optional[int] = None
    outlet_health_band: Optional[str] = None
    revenue: float
    revenue_growth_pct: Optional[float] = None
    orders: int
    aov: float
    inventory_attention: List[str]
    workforce_attention: List[str]
    marketing_attention: List[str]
