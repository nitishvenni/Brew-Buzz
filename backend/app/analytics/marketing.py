from sqlalchemy.orm import Session
from datetime import datetime, timedelta
from typing import Optional, List, Dict, Any
from decimal import Decimal

from app.analytics import queries
from app.schemas import marketing as schemas
from app.models.domain import Product, Category, Outlet

# Explicit thresholds for classification
SURGE_THRESHOLD = Decimal('20.0')
GROWTH_THRESHOLD = Decimal('5.0')
DECLINE_THRESHOLD = Decimal('-10.0')

# Explicit thresholds for alerts
# Note: ALERT_PRODUCT_SURGE_THRESHOLD (25.0%) intentionally differs from SURGING signal threshold (20.0%).
# This requires a higher baseline to trigger an active alert, preventing alert fatigue 
# for standard product volatility, while still allowing the UI to flag it as "SURGING".
ALERT_PRODUCT_DECLINE_THRESHOLD = Decimal('-15.0')
ALERT_PRODUCT_SURGE_THRESHOLD = Decimal('25.0')
ALERT_CATEGORY_SURGE_THRESHOLD = Decimal('20.0')
ALERT_CATEGORY_DECLINE_THRESHOLD = Decimal('-10.0')
ALERT_OUTLET_REVENUE_DROP = Decimal('-10.0')
ALERT_AOV_DECLINE_THRESHOLD = Decimal('-10.0')

def calculate_growth_pct(current: Decimal, previous: Decimal) -> Optional[Decimal]:
    """
    Calculate period-over-period growth safely.
    Returns None if previous is 0 and current > 0 to avoid Infinity.
    Returns 0.0 if both are 0.
    """
    if previous == Decimal('0') and current == Decimal('0'):
        return Decimal('0.0')
    if previous == Decimal('0'):
        return None
    return ((current - previous) / previous) * Decimal('100.0')

def determine_signal(growth_pct: Optional[Decimal]) -> schemas.MarketingSignal:
    if growth_pct is None:
        return schemas.MarketingSignal.NO_BASELINE
    if growth_pct >= SURGE_THRESHOLD:
        return schemas.MarketingSignal.SURGING
    if growth_pct >= GROWTH_THRESHOLD:
        return schemas.MarketingSignal.GROWING
    if growth_pct <= DECLINE_THRESHOLD:
        return schemas.MarketingSignal.DECLINING
    return schemas.MarketingSignal.STABLE

def _get_previous_period(start_date: datetime, end_date: datetime) -> tuple[datetime, datetime]:
    delta = end_date - start_date
    # Avoid zero timedelta for one-day filters if they pass the same exact timestamp
    if delta.total_seconds() == 0:
        delta = timedelta(days=1)
    prev_end = start_date
    prev_start = start_date - delta
    return prev_start, prev_end

def get_marketing_summary(db: Session, start_date: datetime, end_date: datetime, outlet_id: Optional[int] = None) -> schemas.MarketingSummary:
    prev_start, prev_end = _get_previous_period(start_date, end_date)
    
    current_metrics = queries.get_summary_metrics(db, start_date, end_date, outlet_id)
    prev_metrics = queries.get_summary_metrics(db, prev_start, prev_end, outlet_id)
    
    # Calculate growths
    rev_growth = calculate_growth_pct(current_metrics['revenue'], prev_metrics['revenue'])
    ord_growth = calculate_growth_pct(Decimal(current_metrics['order_count']), Decimal(prev_metrics['order_count']))
    aov_growth = calculate_growth_pct(current_metrics['aov'], prev_metrics['aov'])
    
    # Basic counts
    product_count = db.query(Product).count()
    category_count = db.query(Category).count()
    outlet_count = db.query(Outlet).count()
    
    return schemas.MarketingSummary(
        revenue=current_metrics['revenue'],
        orders=current_metrics['order_count'],
        aov=current_metrics['aov'],
        revenue_growth_pct=rev_growth,
        order_growth_pct=ord_growth,
        aov_growth_pct=aov_growth,
        peak_hour=None,  # Not reliably derived from existing single-pass queries
        peak_day=None,
        product_count=product_count,
        category_count=category_count,
        outlet_count=outlet_count
    )

def get_product_marketing(db: Session, start_date: datetime, end_date: datetime, outlet_id: Optional[int] = None) -> List[schemas.ProductMarketingMetrics]:
    prev_start, prev_end = _get_previous_period(start_date, end_date)
    
    current_products = queries.get_product_performance(db, start_date, end_date, outlet_id)
    prev_products = queries.get_product_performance(db, prev_start, prev_end, outlet_id)
    
    prev_map = {p['product_id']: p for p in prev_products}
    total_revenue = sum([p['revenue'] for p in current_products], Decimal('0.0'))
    
    results = []
    for cp in current_products:
        pid = cp['product_id']
        rev = cp['revenue']
        
        prev_rev = prev_map[pid]['revenue'] if pid in prev_map else Decimal('0.0')
        growth = calculate_growth_pct(rev, prev_rev)
        signal = determine_signal(growth)
        
        contrib = (rev / total_revenue * Decimal('100.0')) if total_revenue > 0 else Decimal('0.0')
        
        results.append(schemas.ProductMarketingMetrics(
            product_id=pid,
            product_name=cp['product_name'],
            category_name=cp['category_name'],
            revenue=rev,
            quantity_sold=cp['quantity_sold'],
            order_count=cp['order_count'],
            revenue_contribution_pct=contrib,
            growth_pct=growth,
            signal=signal
        ))
        
    return results

def get_category_marketing(db: Session, start_date: datetime, end_date: datetime, outlet_id: Optional[int] = None) -> List[schemas.CategoryMarketingMetrics]:
    prev_start, prev_end = _get_previous_period(start_date, end_date)
    
    current_cats = queries.get_category_performance(db, start_date, end_date, outlet_id)
    prev_cats = queries.get_category_performance(db, prev_start, prev_end, outlet_id)
    
    prev_map = {c['category_id']: c for c in prev_cats}
    total_revenue = sum([c['revenue'] for c in current_cats], Decimal('0.0'))
    
    results = []
    for cc in current_cats:
        cid = cc['category_id']
        rev = cc['revenue']
        
        prev_rev = prev_map[cid]['revenue'] if cid in prev_map else Decimal('0.0')
        growth = calculate_growth_pct(rev, prev_rev)
        signal = determine_signal(growth)
        
        contrib = (rev / total_revenue * Decimal('100.0')) if total_revenue > 0 else Decimal('0.0')
        
        results.append(schemas.CategoryMarketingMetrics(
            category_id=cid,
            category_name=cc['category_name'],
            revenue=rev,
            quantity_sold=cc['quantity_sold'],
            revenue_contribution_pct=contrib,
            growth_pct=growth,
            signal=signal
        ))
        
    return results

def get_outlet_marketing(db: Session, start_date: datetime, end_date: datetime) -> List[schemas.OutletMarketingMetrics]:
    prev_start, prev_end = _get_previous_period(start_date, end_date)
    
    current_outlets = queries.get_outlet_performance(db, start_date, end_date)
    prev_outlets = queries.get_outlet_performance(db, prev_start, prev_end)
    
    prev_map = {o['outlet_id']: o for o in prev_outlets}
    
    results = []
    for co in current_outlets:
        oid = co['outlet_id']
        rev = co['revenue']
        orders = co['order_count']
        
        prev_rev = prev_map[oid]['revenue'] if oid in prev_map else Decimal('0.0')
        prev_ord = prev_map[oid]['order_count'] if oid in prev_map else 0
        
        rev_growth = calculate_growth_pct(rev, prev_rev)
        ord_growth = calculate_growth_pct(Decimal(orders), Decimal(prev_ord))
        signal = determine_signal(rev_growth)
        
        results.append(schemas.OutletMarketingMetrics(
            outlet_id=oid,
            outlet_name=co['outlet_name'],
            revenue=rev,
            orders=orders,
            aov=co['aov'],
            revenue_growth_pct=rev_growth,
            order_growth_pct=ord_growth,
            signal=signal
        ))
        
    return results

def get_marketing_alerts(db: Session, start_date: datetime, end_date: datetime, outlet_id: Optional[int] = None) -> List[schemas.MarketingAlert]:
    alerts = []
    
    # 1. Product Alerts
    products = get_product_marketing(db, start_date, end_date, outlet_id)
    for p in products:
        if p.growth_pct is not None:
            if p.growth_pct <= ALERT_PRODUCT_DECLINE_THRESHOLD:
                alerts.append(schemas.MarketingAlert(
                    type="PRODUCT_DEMAND_DECLINE",
                    severity=schemas.AlertSeverity.HIGH,
                    entity_id=p.product_id,
                    entity_name=p.product_name,
                    metric="revenue_growth_pct",
                    value=p.growth_pct,
                    threshold=ALERT_PRODUCT_DECLINE_THRESHOLD,
                    message=f"Product '{p.product_name}' revenue declined {abs(p.growth_pct):.1f}% compared with the previous equivalent period."
                ))
            elif p.growth_pct >= ALERT_PRODUCT_SURGE_THRESHOLD:
                alerts.append(schemas.MarketingAlert(
                    type="PRODUCT_DEMAND_SURGE",
                    severity=schemas.AlertSeverity.LOW,
                    entity_id=p.product_id,
                    entity_name=p.product_name,
                    metric="revenue_growth_pct",
                    value=p.growth_pct,
                    threshold=ALERT_PRODUCT_SURGE_THRESHOLD,
                    message=f"Product '{p.product_name}' revenue surged {p.growth_pct:.1f}% compared with the previous equivalent period."
                ))

    # 2. Category Alerts
    categories = get_category_marketing(db, start_date, end_date, outlet_id)
    for c in categories:
        if c.growth_pct is not None:
            if c.growth_pct >= ALERT_CATEGORY_SURGE_THRESHOLD:
                alerts.append(schemas.MarketingAlert(
                    type="CATEGORY_SURGE",
                    severity=schemas.AlertSeverity.LOW,
                    entity_id=c.category_id,
                    entity_name=c.category_name,
                    metric="revenue_growth_pct",
                    value=c.growth_pct,
                    threshold=ALERT_CATEGORY_SURGE_THRESHOLD,
                    message=f"Category '{c.category_name}' revenue surged {c.growth_pct:.1f}% compared with the previous period."
                ))
            elif c.growth_pct <= ALERT_CATEGORY_DECLINE_THRESHOLD:
                alerts.append(schemas.MarketingAlert(
                    type="CATEGORY_DECLINE",
                    severity=schemas.AlertSeverity.MEDIUM,
                    entity_id=c.category_id,
                    entity_name=c.category_name,
                    metric="revenue_growth_pct",
                    value=c.growth_pct,
                    threshold=ALERT_CATEGORY_DECLINE_THRESHOLD,
                    message=f"Category '{c.category_name}' revenue declined {abs(c.growth_pct):.1f}% compared with the previous period."
                ))
                
    # 3. Outlet & Summary Alerts
    summary = get_marketing_summary(db, start_date, end_date, outlet_id)
    if summary.aov_growth_pct is not None and summary.aov_growth_pct <= ALERT_AOV_DECLINE_THRESHOLD:
        alerts.append(schemas.MarketingAlert(
            type="AOV_DECLINE",
            severity=schemas.AlertSeverity.MEDIUM,
            entity_id=outlet_id,
            entity_name="Franchise" if not outlet_id else f"Outlet {outlet_id}",
            metric="aov_growth_pct",
            value=summary.aov_growth_pct,
            threshold=ALERT_AOV_DECLINE_THRESHOLD,
            message=f"Average Order Value declined by {abs(summary.aov_growth_pct):.1f}%."
        ))

    if not outlet_id:
        outlets = get_outlet_marketing(db, start_date, end_date)
        for o in outlets:
            if o.revenue_growth_pct is not None and o.revenue_growth_pct <= ALERT_OUTLET_REVENUE_DROP:
                alerts.append(schemas.MarketingAlert(
                    type="OUTLET_REVENUE_DROP",
                    severity=schemas.AlertSeverity.HIGH,
                    entity_id=o.outlet_id,
                    entity_name=o.outlet_name,
                    metric="revenue_growth_pct",
                    value=o.revenue_growth_pct,
                    threshold=ALERT_OUTLET_REVENUE_DROP,
                    message=f"Outlet '{o.outlet_name}' revenue dropped {abs(o.revenue_growth_pct):.1f}% compared with the previous period."
                ))

    return alerts
