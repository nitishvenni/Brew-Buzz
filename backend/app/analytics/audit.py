import logging
from sqlalchemy.orm import Session
from datetime import datetime
from typing import Optional, List, Dict, Any

from app.analytics import service as outlet_service
from app.analytics import scoring as outlet_scoring
from app.analytics import workforce as workforce_analytics
from app.analytics import marketing as marketing_analytics
from app.api.routes.inventory import get_inventory_summary, get_inventory_alerts
from app.analytics import inventory_queries as inv_queries
from app.api.routes.inventory import _enrich_item
from app.models.domain import Outlet, Product, RecipeItem, Ingredient, InventoryItem
from sqlalchemy import select

from app.schemas.audit import (
    SnapshotOutletMetrics,
    SnapshotInventoryMetrics,
    SnapshotWorkforceMetrics,
    SnapshotMarketingMetrics,
    AuditFranchiseSnapshot,
    AuditAlert,
    AuditCrossDomainSignal,
    AuditOutletComparison,
    StructuredEvidence,
    EvidenceMetric
)

logger = logging.getLogger(__name__)

def _safe_float(val) -> float:
    if val is None:
        return 0.0
    try:
        return float(val)
    except Exception:
        return 0.0

def _map_severity(severity_str: str) -> int:
    s = severity_str.upper() if severity_str else ""
    if s == 'CRITICAL': return 0
    if s == 'HIGH': return 1
    if s == 'MEDIUM': return 2
    if s == 'LOW': return 3
    return 4

def get_franchise_snapshot(db: Session, start_date: datetime, end_date: datetime, outlet_id: Optional[int] = None) -> AuditFranchiseSnapshot:
    # Outlet
    out_summary = outlet_service.get_summary(db, start_date=start_date, end_date=end_date, outlet_id=outlet_id)
    period_duration = end_date - start_date
    prev_start = start_date - period_duration
    prev_end = start_date
    
    # We must properly handle if period_comparison raises an exception or returns None if no data
    out_comp = outlet_service.get_period_comparison(db, current_start=start_date, current_end=end_date, prev_start=prev_start, prev_end=prev_end, outlet_id=outlet_id)
    out_metrics = SnapshotOutletMetrics(
        revenue=_safe_float(out_summary.revenue),
        orders=out_summary.order_count,
        aov=_safe_float(out_summary.aov),
        growth_pct=_safe_float(out_comp.percentage_change) if out_comp else None
    )

    # Inventory
    inv_summary = get_inventory_summary(outlet_id=outlet_id, start_date=start_date, end_date=end_date, db=db)
    if isinstance(inv_summary, dict):
        critical_items = inv_summary.get("critical_items", 0)
        low_stock_items = inv_summary.get("low_items", 0)
        total_val = inv_summary.get("total_inventory_value")
    else:
        critical_items = getattr(inv_summary, "critical_items", 0)
        low_stock_items = getattr(inv_summary, "low_items", 0)
        total_val = getattr(inv_summary, "total_inventory_value", None)

    inv_metrics = SnapshotInventoryMetrics(
        critical_items=critical_items,
        low_stock_items=low_stock_items,
        total_inventory_value=_safe_float(total_val) if total_val is not None else None
    )

    # Workforce
    wf_summary = workforce_analytics.get_workforce_summary(db, start_date=start_date, end_date=end_date, outlet_id=outlet_id)
    wf_metrics = SnapshotWorkforceMetrics(
        active_staff=wf_summary.get("active_staff", 0),
        attendance_rate=wf_summary.get("attendance_rate", 0.0),
        overtime_hours=wf_summary.get("overtime_hours", 0.0),
        orders_per_staff_hour=wf_summary.get("orders_per_staff_hour", 0.0)
    )

    # Marketing
    mk_summary = marketing_analytics.get_marketing_summary(db, start_date=start_date, end_date=end_date, outlet_id=outlet_id)
    mk_metrics = SnapshotMarketingMetrics(
        revenue_growth_pct=_safe_float(mk_summary.revenue_growth_pct) if mk_summary.revenue_growth_pct is not None else None,
        order_growth_pct=_safe_float(mk_summary.order_growth_pct) if mk_summary.order_growth_pct is not None else None,
        aov_growth_pct=_safe_float(mk_summary.aov_growth_pct) if mk_summary.aov_growth_pct is not None else None,
        product_count=mk_summary.product_count
    )

    return AuditFranchiseSnapshot(
        outlet_metrics=out_metrics,
        inventory_metrics=inv_metrics,
        workforce_metrics=wf_metrics,
        marketing_metrics=mk_metrics
    )

def get_consolidated_alerts(db: Session, start_date: datetime, end_date: datetime, outlet_id: Optional[int] = None) -> List[AuditAlert]:
    alerts = []
    
    # 1. Outlet Alerts
    try:
        franchise_scores = outlet_scoring.calculate_franchise_scores(db, start_date, end_date)
        for s in franchise_scores.outlet_scores:
            if outlet_id is not None and s.outlet_id != outlet_id:
                continue
            if s.performance_band in ["Needs Attention", "Critical"]:
                alerts.append(AuditAlert(
                    domain="outlet",
                    alert_type="PERFORMANCE_ATTENTION",
                    severity="HIGH" if s.performance_band == "Critical" else "MEDIUM",
                    title="Outlet Performance Needs Attention",
                    description=f"{s.outlet_name} performance is {s.performance_band.lower()}.",
                    outlet_id=s.outlet_id,
                    metric_value=s.overall_score,
                    threshold=60.0
                ))
    except Exception as e:
        logger.warning(f"Could not calculate outlet scores for alerts: {e}")

    # 2. Inventory Alerts
    inv_alerts = get_inventory_alerts(outlet_id=outlet_id, start_date=start_date, end_date=end_date, db=db)
    for a in inv_alerts:
        if isinstance(a, dict):
            alerts.append(AuditAlert(
                domain="inventory",
                alert_type="INVENTORY_ATTENTION",
                severity=a.get("severity", "MEDIUM"),
                title=a.get("title", ""),
                description=a.get("message", ""),
                outlet_id=outlet_id, 
                metric_value=None,
                threshold=None
            ))
        else:
            alerts.append(AuditAlert(
                domain="inventory",
                alert_type="INVENTORY_ATTENTION",
                severity=getattr(a, "severity", "MEDIUM"),
                title=getattr(a, "title", ""),
                description=getattr(a, "message", ""),
                outlet_id=outlet_id,
                metric_value=None,
                threshold=None
            ))

    # 3. Workforce Alerts
    wf_alerts = workforce_analytics.get_workforce_alerts(db, start_date=start_date, end_date=end_date)
    for a in wf_alerts:
        if outlet_id is not None and a.get("outlet_id") != outlet_id:
            continue
        alerts.append(AuditAlert(
            domain="workforce",
            alert_type=a.get("type", "WORKFORCE_ATTENTION"),
            severity=a.get("severity", "MEDIUM"),
            title="Workforce Alert",
            description=a.get("message", ""),
            outlet_id=a.get("outlet_id"),
            metric_value=_safe_float(a.get("value")),
            threshold=_safe_float(a.get("threshold"))
        ))

    # 4. Marketing Alerts
    mk_alerts = marketing_analytics.get_marketing_alerts(db, start_date=start_date, end_date=end_date, outlet_id=outlet_id)
    for a in mk_alerts:
        alerts.append(AuditAlert(
            domain="marketing",
            alert_type=a.type,
            severity=a.severity.value if hasattr(a.severity, 'value') else str(a.severity),
            title=f"Marketing Alert: {a.entity_name}",
            description=a.message,
            outlet_id=outlet_id,
            metric_value=_safe_float(a.value),
            threshold=_safe_float(a.threshold)
        ))

    alerts.sort(key=lambda x: _map_severity(x.severity))
    return alerts

def get_cross_domain_signals(db: Session, start_date: datetime, end_date: datetime, outlet_id: Optional[int] = None) -> List[AuditCrossDomainSignal]:
    signals = []
    
    # 1. Marketing + Inventory: Product Demand Surging & Inventory Critical/Low
    mk_prods = marketing_analytics.get_product_marketing(db, start_date, end_date, outlet_id)
    surging_prods = [p for p in mk_prods if p.signal in ["SURGING", "GROWING"]]
    
    if surging_prods:
        surging_prod_ids = [p.product_id for p in surging_prods]
        recipes = db.execute(select(RecipeItem).where(RecipeItem.product_id.in_(surging_prod_ids))).scalars().all()
        ingredient_ids = [r.ingredient_id for r in recipes]
        
        all_inv_items = inv_queries.get_inventory_items(db, outlet_id=outlet_id)
        enriched = [_enrich_item(item, db, start_date, end_date) for item in all_inv_items]
        
        for item in enriched:
            if item["ingredient_id"] in ingredient_ids and item["status"] in ["CRITICAL", "LOW"]:
                prod_names = []
                max_growth = 0.0
                for p in surging_prods:
                    if any(r.product_id == p.product_id and r.ingredient_id == item["ingredient_id"] for r in recipes):
                        if p.product_name not in prod_names:
                            prod_names.append(p.product_name)
                            if p.growth_pct is not None and float(p.growth_pct) > max_growth:
                                max_growth = float(p.growth_pct)
                
                if prod_names:
                    signals.append(AuditCrossDomainSignal(
                        signal_type="DEMAND_INVENTORY_MISMATCH",
                        severity="HIGH" if item["status"] == "CRITICAL" else "MEDIUM",
                        domain_a="marketing",
                        domain_b="inventory",
                        outlet_id=item.get("outlet_id"),
                        title="Surging Demand with Critical/Low Stock",
                        description=f"Demand is surging for products ({', '.join(prod_names)}) while a related ingredient ({item['ingredient_name']}) is in {item['status'].lower()} stock condition.",
                        evidence=[
                            f"Products: {', '.join(prod_names)}",
                            f"Ingredient: {item['ingredient_name']} (Status: {item['status']})"
                        ],
                        structured_evidence=[
                            StructuredEvidence(
                                domain="marketing",
                                title="Demand Surge",
                                metrics=[
                                    EvidenceMetric(label="Products", value=", ".join(prod_names)),
                                    EvidenceMetric(label="Max Growth", value=round(max_growth, 1), unit="%", direction="up")
                                ]
                            ),
                            StructuredEvidence(
                                domain="inventory",
                                title="Ingredient Pressure",
                                metrics=[
                                    EvidenceMetric(label="Ingredient", value=item['ingredient_name']),
                                    EvidenceMetric(label="Stock Status", value=item['status'], status=item['status']),
                                    EvidenceMetric(label="Days Remaining", value=round(item['days_remaining'], 1) if item.get('days_remaining') is not None else "N/A", unit="days" if item.get('days_remaining') is not None else None, direction="down")
                                ]
                            )
                        ]
                    ))

    # 2. Marketing + Workforce: Increased Demand & Increased Workload
    wf_metrics = workforce_analytics.get_outlet_metrics(db, start_date=start_date, end_date=end_date)
    mk_outlets = marketing_analytics.get_outlet_marketing(db, start_date, end_date)
    
    for mo in mk_outlets:
        if outlet_id is not None and mo.outlet_id != outlet_id:
            continue
        if mo.signal in ["SURGING", "GROWING"]:
            wo_match = next((wo for wo in wf_metrics if wo["outlet_id"] == mo.outlet_id), None)
            if wo_match and wo_match.get("status") in ["ATTENTION", "WATCH"]:
                reasons = wo_match.get("reasons", [])
                signals.append(AuditCrossDomainSignal(
                    signal_type="DEMAND_WORKLOAD_PRESSURE",
                    severity="MEDIUM",
                    domain_a="marketing",
                    domain_b="workforce",
                    outlet_id=mo.outlet_id,
                    title="Demand Growth alongside Elevated Workload",
                    description=f"Rising order volume was observed alongside increased workforce pressure at {mo.outlet_name}.",
                    evidence=[
                        f"Demand Signal: {mo.signal}",
                        f"Workforce Status: {wo_match['status']}",
                        f"Reasons: {', '.join(reasons)}"
                    ],
                    structured_evidence=[
                        StructuredEvidence(
                            domain="marketing",
                            title="Demand Growth",
                            metrics=[
                                EvidenceMetric(label="Signal", value=mo.signal.name if hasattr(mo.signal, 'name') else str(mo.signal)),
                                EvidenceMetric(label="Revenue Growth", value=round(float(mo.revenue_growth_pct), 1) if mo.revenue_growth_pct is not None else 0.0, unit="%", direction="up"),
                                EvidenceMetric(label="Order Growth", value=round(float(mo.order_growth_pct), 1) if mo.order_growth_pct is not None else 0.0, unit="%", direction="up")
                            ]
                        ),
                        StructuredEvidence(
                            domain="workforce",
                            title="Workforce Pressure",
                            metrics=[
                                EvidenceMetric(label="Status", value=wo_match['status'], status=wo_match['status']),
                                EvidenceMetric(label="Attendance", value=round(wo_match['attendance_rate'], 1), unit="%"),
                                EvidenceMetric(label="Workload", value=round(wo_match.get('orders_per_staff_hour', 0.0), 1), unit="orders/hr", direction="up")
                            ]
                        )
                    ]
                ))

    # 3. Outlet + Workforce and 4. Outlet + Inventory
    try:
        franchise_scores = outlet_scoring.calculate_franchise_scores(db, start_date, end_date)
        for score in franchise_scores.outlet_scores:
            if outlet_id is not None and score.outlet_id != outlet_id:
                continue
            
            if score.performance_band in ["Needs Attention", "Critical"]:
                # 3. Outlet + Workforce
                wo_match = next((w for w in wf_metrics if w["outlet_id"] == score.outlet_id), None)
                if wo_match and wo_match.get("status") in ["ATTENTION", "WATCH"]:
                    signals.append(AuditCrossDomainSignal(
                        signal_type="PERFORMANCE_WORKFORCE_ISSUE",
                        severity="HIGH" if score.performance_band == "Critical" else "MEDIUM",
                        domain_a="outlet",
                        domain_b="workforce",
                        outlet_id=score.outlet_id,
                        title="Outlet Underperformance alongside Workforce Issues",
                        description=f"Lower outlet performance was observed alongside elevated workforce attention indicators at {score.outlet_name}.",
                        evidence=[
                            f"Performance Band: {score.performance_band}",
                            f"Workforce Status: {wo_match.get('status')}",
                            f"Reasons: {', '.join(wo_match.get('reasons', []))}"
                        ],
                        structured_evidence=[
                            StructuredEvidence(
                                domain="outlet",
                                title="Outlet Performance",
                                metrics=[
                                    EvidenceMetric(label="Score", value=score.overall_score, comparison="/ 100", status=score.performance_band),
                                    EvidenceMetric(label="Band", value=score.performance_band),
                                    EvidenceMetric(label="Growth", value=round(score.growth_percentage, 1), unit="%", direction="down" if score.growth_percentage < 0 else "up")
                                ]
                            ),
                            StructuredEvidence(
                                domain="workforce",
                                title="Workforce Pressure",
                                metrics=[
                                    EvidenceMetric(label="Status", value=wo_match['status'], status=wo_match['status']),
                                    EvidenceMetric(label="Attendance", value=round(wo_match['attendance_rate'], 1), unit="%"),
                                    EvidenceMetric(label="Workload", value=round(wo_match.get('orders_per_staff_hour', 0.0), 1), unit="orders/hr")
                                ]
                            )
                        ]
                    ))
                
                # 4. Outlet + Inventory
                out_inv_items = inv_queries.get_inventory_items(db, outlet_id=score.outlet_id)
                out_enriched = [_enrich_item(item, db, start_date, end_date) for item in out_inv_items]
                critical_inv = [i for i in out_enriched if i["status"] in ["CRITICAL", "LOW"]]
                if critical_inv:
                    signals.append(AuditCrossDomainSignal(
                        signal_type="PERFORMANCE_INVENTORY_ISSUE",
                        severity="HIGH" if score.performance_band == "Critical" else "MEDIUM",
                        domain_a="outlet",
                        domain_b="inventory",
                        outlet_id=score.outlet_id,
                        title="Outlet Underperformance alongside Inventory Issues",
                        description=f"Lower outlet performance was observed alongside elevated inventory attention at {score.outlet_name}.",
                        evidence=[
                            f"Performance Band: {score.performance_band}",
                            f"Critical/Low Items: {len(critical_inv)}"
                        ],
                        structured_evidence=[
                            StructuredEvidence(
                                domain="outlet",
                                title="Outlet Performance",
                                metrics=[
                                    EvidenceMetric(label="Score", value=score.overall_score, comparison="/ 100", status=score.performance_band),
                                    EvidenceMetric(label="Band", value=score.performance_band)
                                ]
                            ),
                            StructuredEvidence(
                                domain="inventory",
                                title="Inventory Pressure",
                                metrics=[
                                    EvidenceMetric(label="Critical Items", value=len(critical_inv), status="CRITICAL"),
                                    EvidenceMetric(label="Top Issue", value=critical_inv[0]['ingredient_name'] if critical_inv else "N/A"),
                                    EvidenceMetric(label="Days Left", value=round(critical_inv[0]['days_remaining'], 1) if critical_inv and critical_inv[0].get('days_remaining') is not None else "N/A", unit="days" if critical_inv and critical_inv[0].get('days_remaining') is not None else None)
                                ]
                            )
                        ]
                    ))
    except Exception as e:
        logger.warning(f"Could not calculate outlet scores for signals: {e}")

    return signals

def compare_outlet_domains(db: Session, outlet_id: int, start_date: datetime, end_date: datetime) -> AuditOutletComparison:
    outlets = db.execute(select(Outlet).where(Outlet.id == outlet_id)).scalars().first()
    if not outlets:
        raise ValueError("Outlet not found")
        
    out_name = outlets.name
    
    # 1. Outlet
    out_summary = outlet_service.get_summary(db, start_date, end_date, outlet_id)
    period_duration = end_date - start_date
    prev_start = start_date - period_duration
    prev_end = start_date
    out_comp = outlet_service.get_period_comparison(db, current_start=start_date, current_end=end_date, prev_start=prev_start, prev_end=prev_end, outlet_id=outlet_id)
    
    out_health = None
    out_band = None
    try:
        franchise_scores = outlet_scoring.calculate_franchise_scores(db, start_date, end_date)
        for s in franchise_scores.outlet_scores:
            if s.outlet_id == outlet_id:
                out_health = s.overall_score
                out_band = s.performance_band
    except Exception as e:
        logger.warning(f"Could not calculate outlet scores for comparison: {e}")
        
    # 2. Inventory
    inv_alerts = get_inventory_alerts(outlet_id=outlet_id, start_date=start_date, end_date=end_date, db=db)
    inv_attention = [a.get("message", "") if isinstance(a, dict) else getattr(a, "message", "") for a in inv_alerts]
    
    # 3. Workforce
    wf_alerts = workforce_analytics.get_workforce_alerts(db, start_date=start_date, end_date=end_date)
    wf_attention = [a.get("message", "") for a in wf_alerts if a.get("outlet_id") == outlet_id]
    
    # 4. Marketing
    mk_alerts = marketing_analytics.get_marketing_alerts(db, start_date=start_date, end_date=end_date, outlet_id=outlet_id)
    mk_attention = [a.message for a in mk_alerts]

    return AuditOutletComparison(
        outlet_id=outlet_id,
        outlet_name=out_name,
        outlet_health_score=out_health,
        outlet_health_band=out_band,
        revenue=_safe_float(out_summary.revenue),
        revenue_growth_pct=_safe_float(out_comp.percentage_change) if out_comp else None,
        orders=out_summary.order_count,
        aov=_safe_float(out_summary.aov),
        inventory_attention=inv_attention,
        workforce_attention=wf_attention,
        marketing_attention=mk_attention
    )
