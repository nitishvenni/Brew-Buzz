from sqlalchemy.orm import Session
from sqlalchemy import func, desc, and_, select
from typing import Optional, List, Dict, Any
from datetime import datetime
from decimal import Decimal

from app.models.domain import Order, OrderItem, Product, Category, Outlet

def get_base_order_filter(start_date: Optional[datetime] = None, end_date: Optional[datetime] = None, outlet_id: Optional[int] = None):
    filters = [Order.status == "completed"]
    if start_date:
        filters.append(Order.order_timestamp >= start_date)
    if end_date:
        # Inclusive end_date for exact datetimes
        filters.append(Order.order_timestamp <= end_date)
    if outlet_id:
        filters.append(Order.outlet_id == outlet_id)
    return filters

def get_summary_metrics(db: Session, start_date: Optional[datetime] = None, end_date: Optional[datetime] = None, outlet_id: Optional[int] = None) -> Dict[str, Any]:
    filters = get_base_order_filter(start_date, end_date, outlet_id)
    
    # Calculate revenue and order count
    result = db.query(
        func.sum(Order.total_amount).label("total_revenue"),
        func.count(Order.id).label("order_count")
    ).filter(*filters).first()
    
    revenue = result.total_revenue or Decimal('0.00')
    order_count = result.order_count or 0
    
    # Calculate units sold
    units_result = db.query(
        func.sum(OrderItem.quantity).label("units_sold")
    ).join(Order).filter(*filters).first()
    
    units_sold = units_result.units_sold or 0
    aov = (revenue / Decimal(order_count)) if order_count > 0 else Decimal('0.00')
    
    return {
        "revenue": revenue,
        "order_count": order_count,
        "aov": aov,
        "units_sold": units_sold
    }

def get_outlet_performance(db: Session, start_date: Optional[datetime] = None, end_date: Optional[datetime] = None) -> List[Dict[str, Any]]:
    filters = get_base_order_filter(start_date, end_date)
    
    order_subq = db.query(
        Order.outlet_id,
        func.sum(Order.total_amount).label("revenue"),
        func.count(Order.id).label("order_count")
    ).filter(*filters).group_by(Order.outlet_id).subquery()
    
    item_subq = db.query(
        Order.outlet_id,
        func.sum(OrderItem.quantity).label("units_sold")
    ).select_from(OrderItem).join(Order, Order.id == OrderItem.order_id)\
     .filter(*filters).group_by(Order.outlet_id).subquery()
    
    results = db.query(
        Outlet.id,
        Outlet.name,
        order_subq.c.revenue,
        order_subq.c.order_count,
        item_subq.c.units_sold
    ).select_from(Outlet)\
     .outerjoin(order_subq, Outlet.id == order_subq.c.outlet_id)\
     .outerjoin(item_subq, Outlet.id == item_subq.c.outlet_id)\
     .all()
    
    performance = []
    for row in results:
        revenue = row.revenue or Decimal('0.00')
        order_count = row.order_count or 0
        units_sold = row.units_sold or 0
        aov = (revenue / Decimal(order_count)) if order_count > 0 else Decimal('0.00')
        
        performance.append({
            "outlet_id": row.id,
            "outlet_name": row.name,
            "revenue": revenue,
            "order_count": order_count,
            "units_sold": units_sold,
            "aov": aov
        })
    return performance

def get_product_performance(db: Session, start_date: Optional[datetime] = None, end_date: Optional[datetime] = None, outlet_id: Optional[int] = None, limit: Optional[int] = None) -> List[Dict[str, Any]]:
    filters = get_base_order_filter(start_date, end_date, outlet_id)
    
    query = db.query(
        Product.id,
        Product.name,
        Category.name.label("category_name"),
        func.sum(OrderItem.subtotal).label("revenue"),
        func.sum(OrderItem.quantity).label("quantity_sold"),
        func.count(func.distinct(Order.id)).label("order_count")
    ).select_from(Product)\
     .join(Category)\
     .join(OrderItem)\
     .join(Order)\
     .filter(*filters)\
     .group_by(Product.id, Product.name, Category.name)\
     .order_by(desc("revenue"))
     
    if limit:
        query = query.limit(limit)
        
    results = query.all()
    
    return [
        {
            "product_id": row.id,
            "product_name": row.name,
            "category_name": row.category_name,
            "revenue": row.revenue or Decimal('0.00'),
            "quantity_sold": row.quantity_sold or 0,
            "order_count": row.order_count or 0
        }
        for row in results
    ]

def get_category_performance(db: Session, start_date: Optional[datetime] = None, end_date: Optional[datetime] = None, outlet_id: Optional[int] = None) -> List[Dict[str, Any]]:
    filters = get_base_order_filter(start_date, end_date, outlet_id)
    
    results = db.query(
        Category.id,
        Category.name,
        func.sum(OrderItem.subtotal).label("revenue"),
        func.sum(OrderItem.quantity).label("quantity_sold")
    ).select_from(Category)\
     .outerjoin(Product)\
     .outerjoin(OrderItem)\
     .outerjoin(Order, and_(Order.id == OrderItem.order_id, *filters))\
     .group_by(Category.id, Category.name)\
     .order_by(desc("revenue"))\
     .all()
     
    total_revenue = sum([row.revenue or Decimal('0.00') for row in results])
    
    performance = []
    for row in results:
        revenue = row.revenue or Decimal('0.00')
        pct = (revenue / total_revenue * 100) if total_revenue > 0 else Decimal('0.00')
        performance.append({
            "category_id": row.id,
            "category_name": row.name,
            "revenue": revenue,
            "quantity_sold": row.quantity_sold or 0,
            "revenue_percentage": pct
        })
    return performance

def get_time_series(db: Session, start_date: Optional[datetime] = None, end_date: Optional[datetime] = None, outlet_id: Optional[int] = None) -> List[Dict[str, Any]]:
    filters = get_base_order_filter(start_date, end_date, outlet_id)
    
    # Cast timestamp to date for grouping
    date_expr = func.date(Order.order_timestamp).label('day')
    
    results = db.query(
        date_expr,
        func.sum(Order.total_amount).label("revenue"),
        func.count(Order.id).label("order_count")
    ).filter(*filters)\
     .group_by(date_expr)\
     .order_by(date_expr)\
     .all()
     
    series = []
    for row in results:
        revenue = row.revenue or Decimal('0.00')
        order_count = row.order_count or 0
        aov = (revenue / Decimal(order_count)) if order_count > 0 else Decimal('0.00')
        
        series.append({
            "date": row.day,
            "revenue": revenue,
            "order_count": order_count,
            "aov": aov
        })
    return series
