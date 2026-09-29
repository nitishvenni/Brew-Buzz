from sqlalchemy.orm import Session
from sqlalchemy import func, desc, and_, select
from typing import Optional, List, Dict, Any
from datetime import datetime, timedelta
from decimal import Decimal

from app.models.domain import Employee, Shift, Outlet, Order, Role

# Constants for thresholds
THRESHOLD_ATTENDANCE_WATCH = 95.0
THRESHOLD_ATTENDANCE_ATTENTION = 90.0
THRESHOLD_ABSENCE_WATCH = 3.0
THRESHOLD_ABSENCE_ATTENTION = 6.0
THRESHOLD_LATE_WATCH = 5.0
THRESHOLD_LATE_ATTENTION = 10.0
THRESHOLD_OVERTIME_WATCH = 10.0 # percentage of scheduled hours
THRESHOLD_OVERTIME_ATTENTION = 20.0
THRESHOLD_WORKLOAD_WATCH = 20.0 # orders per staff hour
THRESHOLD_WORKLOAD_ATTENTION = 25.0

def get_base_shift_filter(start_date: Optional[datetime] = None, end_date: Optional[datetime] = None, outlet_id: Optional[int] = None):
    filters = []
    if start_date:
        filters.append(Shift.shift_date >= start_date)
    if end_date:
        filters.append(Shift.shift_date <= end_date)
    if outlet_id:
        filters.append(Shift.outlet_id == outlet_id)
    return filters

def calculate_shift_metrics(shift: Shift):
    scheduled_hours = max((shift.scheduled_end - shift.scheduled_start).total_seconds() / 3600.0, 0)
    
    if shift.status == "COMPLETED" and shift.actual_start and shift.actual_end:
        actual_hours = max((shift.actual_end - shift.actual_start).total_seconds() / 3600.0, 0)
        late_minutes = max((shift.actual_start - shift.scheduled_start).total_seconds() / 60.0, 0)
    else:
        actual_hours = 0.0
        late_minutes = 0.0

    overtime_hours = max(actual_hours - scheduled_hours, 0.0)
    return scheduled_hours, actual_hours, overtime_hours, late_minutes

def determine_workforce_status(attendance_rate: float, overtime_pct: float, workload: float) -> tuple[str, List[str]]:
    reasons = []
    status = "HEALTHY"
    
    if attendance_rate < THRESHOLD_ATTENDANCE_ATTENTION:
        reasons.append(f"Attendance rate ({attendance_rate:.1f}%) critically below {THRESHOLD_ATTENDANCE_ATTENTION}%")
        status = "ATTENTION"
    elif attendance_rate < THRESHOLD_ATTENDANCE_WATCH:
        reasons.append(f"Attendance rate ({attendance_rate:.1f}%) below {THRESHOLD_ATTENDANCE_WATCH}%")
        if status != "ATTENTION": status = "WATCH"

    if overtime_pct > THRESHOLD_OVERTIME_ATTENTION:
        reasons.append(f"Overtime ({overtime_pct:.1f}%) critically above {THRESHOLD_OVERTIME_ATTENTION}%")
        status = "ATTENTION"
    elif overtime_pct > THRESHOLD_OVERTIME_WATCH:
        reasons.append(f"Overtime ({overtime_pct:.1f}%) above {THRESHOLD_OVERTIME_WATCH}%")
        if status != "ATTENTION": status = "WATCH"

    if workload > THRESHOLD_WORKLOAD_ATTENTION:
        reasons.append(f"Workload density ({workload:.1f}) critically above {THRESHOLD_WORKLOAD_ATTENTION}")
        status = "ATTENTION"
    elif workload > THRESHOLD_WORKLOAD_WATCH:
        reasons.append(f"Workload density ({workload:.1f}) above {THRESHOLD_WORKLOAD_WATCH}")
        if status != "ATTENTION": status = "WATCH"

    return status, reasons

def get_workforce_summary(db: Session, start_date: Optional[datetime] = None, end_date: Optional[datetime] = None, outlet_id: Optional[int] = None) -> Dict[str, Any]:
    shift_filters = get_base_shift_filter(start_date, end_date, outlet_id)
    shifts = db.query(Shift).filter(*shift_filters).all()
    
    order_filters = [Order.status == "completed"]
    if start_date: order_filters.append(Order.order_timestamp >= start_date)
    if end_date: order_filters.append(Order.order_timestamp <= end_date)
    if outlet_id: order_filters.append(Order.outlet_id == outlet_id)
    total_orders = db.query(func.count(Order.id)).filter(*order_filters).scalar() or 0

    emp_filters = []
    if outlet_id: emp_filters.append(Employee.outlet_id == outlet_id)
    employees = db.query(Employee).filter(*emp_filters).all()
    
    total_staff = len(employees)
    active_staff = sum(1 for e in employees if e.employment_status == "ACTIVE")
    inactive_staff = total_staff - active_staff

    scheduled_hours = 0.0
    actual_hours = 0.0
    overtime_hours = 0.0
    scheduled_shifts = 0
    completed_shifts = 0
    absent_shifts = 0
    late_shifts = 0

    for s in shifts:
        if s.status != "CANCELLED":
            scheduled_shifts += 1
            if s.status == "COMPLETED":
                completed_shifts += 1
            elif s.status == "ABSENT":
                absent_shifts += 1
                
            sh, ah, oh, lm = calculate_shift_metrics(s)
            scheduled_hours += sh
            actual_hours += ah
            overtime_hours += oh
            if lm > 5: # grace period 5 mins
                late_shifts += 1

    attendance_rate = (completed_shifts / scheduled_shifts * 100) if scheduled_shifts > 0 else 0.0
    absence_rate = (absent_shifts / scheduled_shifts * 100) if scheduled_shifts > 0 else 0.0
    late_rate = (late_shifts / completed_shifts * 100) if completed_shifts > 0 else 0.0
    
    orders_per_staff_hour = (total_orders / actual_hours) if actual_hours > 0 else 0.0
    overtime_pct = (overtime_hours / scheduled_hours * 100) if scheduled_hours > 0 else 0.0

    status, reasons = determine_workforce_status(attendance_rate, overtime_pct, orders_per_staff_hour)

    return {
        "total_staff": total_staff,
        "active_staff": active_staff,
        "inactive_staff": inactive_staff,
        "scheduled_shifts": scheduled_shifts,
        "completed_shifts": completed_shifts,
        "absent_shifts": absent_shifts,
        "late_shifts": late_shifts,
        "scheduled_hours": scheduled_hours,
        "actual_hours": actual_hours,
        "overtime_hours": overtime_hours,
        "attendance_rate": attendance_rate,
        "absence_rate": absence_rate,
        "late_rate": late_rate,
        "total_orders": total_orders,
        "orders_per_staff_hour": orders_per_staff_hour,
        "status": status,
        "reasons": reasons
    }

def get_outlet_metrics(db: Session, start_date: Optional[datetime] = None, end_date: Optional[datetime] = None) -> List[Dict[str, Any]]:
    outlets = db.query(Outlet).all()
    results = []
    
    for outlet in outlets:
        summary = get_workforce_summary(db, start_date, end_date, outlet.id)
        results.append({
            "outlet_id": outlet.id,
            "outlet_name": outlet.name,
            "active_staff": summary["active_staff"],
            "scheduled_shifts": summary["scheduled_shifts"],
            "completed_shifts": summary["completed_shifts"],
            "absent_shifts": summary["absent_shifts"],
            "late_shifts": summary["late_shifts"],
            "scheduled_hours": summary["scheduled_hours"],
            "actual_hours": summary["actual_hours"],
            "overtime_hours": summary["overtime_hours"],
            "attendance_rate": summary["attendance_rate"],
            "absence_rate": summary["absence_rate"],
            "late_rate": summary["late_rate"],
            "order_count": summary["total_orders"],
            "orders_per_staff_hour": summary["orders_per_staff_hour"],
            "status": summary["status"],
            "reasons": summary["reasons"]
        })
    return results
def get_employee_metrics(db: Session, employee_id: int, start_date: Optional[datetime] = None, end_date: Optional[datetime] = None) -> Dict[str, Any]:
    employee = db.query(Employee).filter(Employee.id == employee_id).first()
    if not employee: return {}
    
    filters = [Shift.employee_id == employee_id]
    if start_date: filters.append(Shift.shift_date >= start_date)
    if end_date: filters.append(Shift.shift_date <= end_date)
    
    shifts = db.query(Shift).filter(*filters).all()
    
    scheduled_hours = 0.0
    actual_hours = 0.0
    overtime_hours = 0.0
    scheduled_shifts = 0
    completed_shifts = 0
    absent_shifts = 0
    late_shifts = 0

    for s in shifts:
        if s.status != "CANCELLED":
            scheduled_shifts += 1
            if s.status == "COMPLETED": completed_shifts += 1
            elif s.status == "ABSENT": absent_shifts += 1
            
            sh, ah, oh, lm = calculate_shift_metrics(s)
            scheduled_hours += sh
            actual_hours += ah
            overtime_hours += oh
            if lm > 5: late_shifts += 1
            
    attendance_rate = (completed_shifts / scheduled_shifts * 100) if scheduled_shifts > 0 else 0.0
    late_rate = (late_shifts / completed_shifts * 100) if completed_shifts > 0 else 0.0
    avg_hours = (actual_hours / completed_shifts) if completed_shifts > 0 else 0.0

    return {
        "employee_id": employee.id,
        "employee_code": employee.employee_code,
        "name": employee.name,
        "role": employee.role.name if employee.role else "Unknown",
        "outlet": employee.outlet.name if employee.outlet else "Unknown",
        "scheduled_shifts": scheduled_shifts,
        "completed_shifts": completed_shifts,
        "absent_shifts": absent_shifts,
        "late_shifts": late_shifts,
        "scheduled_hours": scheduled_hours,
        "actual_hours": actual_hours,
        "overtime_hours": overtime_hours,
        "attendance_rate": attendance_rate,
        "late_rate": late_rate,
        "average_hours_per_shift": avg_hours
    }

def get_workforce_alerts(db: Session, start_date: Optional[datetime] = None, end_date: Optional[datetime] = None) -> List[Dict[str, Any]]:
    alerts = []
    outlets = get_outlet_metrics(db, start_date, end_date)
    
    for outlet in outlets:
        # Absence Alerts
        if outlet["absence_rate"] > THRESHOLD_ABSENCE_ATTENTION:
            alerts.append({
                "type": "HIGH_ABSENCE", "severity": "HIGH",
                "outlet_id": outlet["outlet_id"], "outlet_name": outlet["outlet_name"],
                "metric": "absence_rate", "value": outlet["absence_rate"], "threshold": THRESHOLD_ABSENCE_ATTENTION,
                "message": f"Absence rate is {outlet['absence_rate']:.1f}%, exceeding the critical threshold."
            })
        elif outlet["absence_rate"] > THRESHOLD_ABSENCE_WATCH:
            alerts.append({
                "type": "HIGH_ABSENCE", "severity": "MEDIUM",
                "outlet_id": outlet["outlet_id"], "outlet_name": outlet["outlet_name"],
                "metric": "absence_rate", "value": outlet["absence_rate"], "threshold": THRESHOLD_ABSENCE_WATCH,
                "message": f"Absence rate is {outlet['absence_rate']:.1f}%."
            })
            
        # Lateness Alerts
        if outlet["late_rate"] > THRESHOLD_LATE_ATTENTION:
            alerts.append({
                "type": "HIGH_LATENESS", "severity": "HIGH",
                "outlet_id": outlet["outlet_id"], "outlet_name": outlet["outlet_name"],
                "metric": "late_rate", "value": outlet["late_rate"], "threshold": THRESHOLD_LATE_ATTENTION,
                "message": f"Late rate is {outlet['late_rate']:.1f}%, exceeding the critical threshold."
            })
        elif outlet["late_rate"] > THRESHOLD_LATE_WATCH:
            alerts.append({
                "type": "HIGH_LATENESS", "severity": "MEDIUM",
                "outlet_id": outlet["outlet_id"], "outlet_name": outlet["outlet_name"],
                "metric": "late_rate", "value": outlet["late_rate"], "threshold": THRESHOLD_LATE_WATCH,
                "message": f"Late rate is {outlet['late_rate']:.1f}%."
            })

        # Overtime Alerts
        overtime_pct = (outlet["overtime_hours"] / outlet["scheduled_hours"] * 100) if outlet["scheduled_hours"] > 0 else 0.0
        if overtime_pct > THRESHOLD_OVERTIME_ATTENTION:
            alerts.append({
                "type": "HIGH_OVERTIME", "severity": "HIGH",
                "outlet_id": outlet["outlet_id"], "outlet_name": outlet["outlet_name"],
                "metric": "overtime_percentage", "value": overtime_pct, "threshold": THRESHOLD_OVERTIME_ATTENTION,
                "message": f"Overtime is {overtime_pct:.1f}% of scheduled hours, exceeding the critical threshold."
            })
        elif overtime_pct > THRESHOLD_OVERTIME_WATCH:
            alerts.append({
                "type": "HIGH_OVERTIME", "severity": "MEDIUM",
                "outlet_id": outlet["outlet_id"], "outlet_name": outlet["outlet_name"],
                "metric": "overtime_percentage", "value": overtime_pct, "threshold": THRESHOLD_OVERTIME_WATCH,
                "message": f"Overtime is {overtime_pct:.1f}% of scheduled hours."
            })
            
        # Workload Alerts
        if outlet["orders_per_staff_hour"] > THRESHOLD_WORKLOAD_ATTENTION:
            alerts.append({
                "type": "HIGH_WORKLOAD", "severity": "HIGH",
                "outlet_id": outlet["outlet_id"], "outlet_name": outlet["outlet_name"],
                "metric": "orders_per_staff_hour", "value": outlet["orders_per_staff_hour"], "threshold": THRESHOLD_WORKLOAD_ATTENTION,
                "message": f"High operational density: {outlet['orders_per_staff_hour']:.1f} orders per staff hour."
            })
    return alerts
def get_workforce_trends(db: Session, start_date: Optional[datetime] = None, end_date: Optional[datetime] = None) -> List[Dict[str, Any]]:
    # Deterministic trend per day
    # We collect shifts per date and orders per date
    filters = []
    if start_date: filters.append(Shift.shift_date >= start_date)
    if end_date: filters.append(Shift.shift_date <= end_date)
    shifts = db.query(Shift).filter(*filters).all()
    
    order_filters = [Order.status == "completed"]
    if start_date: order_filters.append(Order.order_timestamp >= start_date)
    if end_date: order_filters.append(Order.order_timestamp <= end_date)
    orders = db.query(Order).filter(*order_filters).all()
    
    dates = {}
    for s in shifts:
        d = s.shift_date.strftime("%Y-%m-%d")
        if d not in dates:
            dates[d] = {"scheduled_shifts": 0, "completed_shifts": 0, "absent_shifts": 0, "orders": 0, "actual_staff_hours": 0.0, "overtime_hours": 0.0}
        
        if s.status != "CANCELLED":
            dates[d]["scheduled_shifts"] += 1
            if s.status == "COMPLETED": dates[d]["completed_shifts"] += 1
            elif s.status == "ABSENT": dates[d]["absent_shifts"] += 1
            
            sh, ah, oh, lm = calculate_shift_metrics(s)
            dates[d]["actual_staff_hours"] += ah
            dates[d]["overtime_hours"] += oh

    for o in orders:
        d = o.order_timestamp.strftime("%Y-%m-%d")
        if d not in dates:
            dates[d] = {"scheduled_shifts": 0, "completed_shifts": 0, "absent_shifts": 0, "orders": 0, "actual_staff_hours": 0.0, "overtime_hours": 0.0}
        dates[d]["orders"] += 1

    results = []
    for d in sorted(dates.keys()):
        stats = dates[d]
        sched = stats["scheduled_shifts"]
        comp = stats["completed_shifts"]
        actual_hours = stats["actual_staff_hours"]
        order_count = stats["orders"]
        
        att_rate = (comp / sched * 100) if sched > 0 else 0.0
        ops_hour = (order_count / actual_hours) if actual_hours > 0 else 0.0
        
        results.append({
            "date": d,
            "attendance_rate": att_rate,
            "scheduled_shifts": sched,
            "completed_shifts": comp,
            "absent_shifts": stats["absent_shifts"],
            "orders": order_count,
            "actual_staff_hours": actual_hours,
            "orders_per_staff_hour": ops_hour,
            "overtime_hours": stats["overtime_hours"]
        })
    return results
