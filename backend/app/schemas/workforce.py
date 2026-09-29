from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

class RoleBase(BaseModel):
    name: str
    description: Optional[str] = None

class RoleResponse(RoleBase):
    id: int
    class Config:
        from_attributes = True

class EmployeeBase(BaseModel):
    employee_code: str
    name: str
    role_id: int
    outlet_id: int
    employment_status: str
    hire_date: datetime

class EmployeeResponse(EmployeeBase):
    id: int
    created_at: datetime
    class Config:
        from_attributes = True

class ShiftBase(BaseModel):
    employee_id: int
    outlet_id: int
    shift_date: datetime
    scheduled_start: datetime
    scheduled_end: datetime
    actual_start: Optional[datetime] = None
    actual_end: Optional[datetime] = None
    status: str

class ShiftResponse(ShiftBase):
    id: int
    created_at: datetime
    class Config:
        from_attributes = True

class WorkforceSummary(BaseModel):
    total_staff: int
    active_staff: int
    inactive_staff: int
    scheduled_shifts: int
    completed_shifts: int
    absent_shifts: int
    late_shifts: int
    scheduled_hours: float
    actual_hours: float
    overtime_hours: float
    attendance_rate: float
    absence_rate: float
    late_rate: float
    total_orders: int
    orders_per_staff_hour: float
    status: str
    reasons: List[str]

class EmployeeWorkforceMetrics(BaseModel):
    employee_id: int
    employee_code: str
    name: str
    role: str
    outlet: str
    scheduled_shifts: int
    completed_shifts: int
    absent_shifts: int
    late_shifts: int
    scheduled_hours: float
    actual_hours: float
    overtime_hours: float
    attendance_rate: float
    late_rate: float
    average_hours_per_shift: float

class OutletWorkforceMetrics(BaseModel):
    outlet_id: int
    outlet_name: str
    active_staff: int
    scheduled_shifts: int
    completed_shifts: int
    absent_shifts: int
    late_shifts: int
    scheduled_hours: float
    actual_hours: float
    overtime_hours: float
    attendance_rate: float
    absence_rate: float
    late_rate: float
    order_count: int
    orders_per_staff_hour: float
    status: str
    reasons: List[str]

class WorkforceTrend(BaseModel):
    date: str
    attendance_rate: float
    scheduled_shifts: int
    completed_shifts: int
    absent_shifts: int
    orders: int
    actual_staff_hours: float
    orders_per_staff_hour: float
    overtime_hours: float

class WorkforceAlert(BaseModel):
    type: str
    severity: str
    outlet_id: Optional[int]
    outlet_name: Optional[str]
    metric: str
    value: float
    threshold: float
    message: str
