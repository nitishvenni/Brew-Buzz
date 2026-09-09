"""
Inventory Intelligence REST API endpoints.

All business logic is delegated to the analytics layer.
Routes handle HTTP concerns only: parsing, validation, response formatting.
"""
from typing import Optional, List
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.analytics import inventory_queries as inv_queries
from app.analytics.inventory import (
    average_daily_consumption,
    days_until_stockout,
    classify_stock_status,
    wastage_rate,
    consumption_growth,
    reorder_recommendation,
    compare_inventory_to_sales,
    generate_item_strengths_weaknesses,
    STATUS_CRITICAL, STATUS_LOW, STATUS_WATCH, STATUS_HEALTHY, STATUS_OVERSTOCK,
    WASTAGE_RATE_HIGH,
    PRIORITY_NONE,
)
from app.schemas.inventory import (
    InventoryItemResponse,
    InventorySummaryResponse,
    InventoryAlertResponse,
    ReorderRecommendationResponse,
    InventoryDetailResponse,
    InventoryTrendPoint,
    InventoryHistoryEntry,
)

router = APIRouter(prefix="/inventory", tags=["inventory"])


def _enrich_item(item: dict, db: Session, start_date=None, end_date=None) -> dict:
    """Add computed analytics fields to a raw inventory item dict."""
    totals = inv_queries.get_transaction_totals(db, item["id"], start_date, end_date)
    num_days = inv_queries.get_transaction_date_range(db, item["id"], start_date, end_date)

    consumed = totals.get("CONSUMPTION", 0.0)
    wasted = totals.get("WASTAGE", 0.0)

    avg_daily = average_daily_consumption(consumed, num_days) if num_days else 0.0
    days_left = days_until_stockout(item["current_quantity"], avg_daily)
    status = classify_stock_status(days_left)

    inv_value = None
    if item.get("unit_cost") is not None:
        inv_value = round(item["current_quantity"] * item["unit_cost"], 2)

    item["average_daily_consumption"] = round(avg_daily, 4)
    item["days_remaining"] = round(days_left, 1) if days_left is not None else None
    item["status"] = status
    item["inventory_value"] = inv_value
    return item


# ---------- 1. Inventory Summary ----------

@router.get("/summary", response_model=InventorySummaryResponse)
def get_inventory_summary(
    outlet_id: Optional[int] = None,
    start_date: Optional[datetime] = None,
    end_date: Optional[datetime] = None,
    db: Session = Depends(get_db),
):
    if start_date and end_date and start_date > end_date:
        raise HTTPException(400, "start_date cannot be after end_date")

    items = inv_queries.get_inventory_items(db, outlet_id=outlet_id)
    enriched = [_enrich_item(item, db, start_date, end_date) for item in items]

    counts = {STATUS_CRITICAL: 0, STATUS_LOW: 0, STATUS_WATCH: 0, STATUS_HEALTHY: 0, STATUS_OVERSTOCK: 0}
    total_value = 0.0
    has_value = False

    for item in enriched:
        counts[item["status"]] = counts.get(item["status"], 0) + 1
        if item["inventory_value"] is not None:
            total_value += item["inventory_value"]
            has_value = True

    return InventorySummaryResponse(
        total_items=len(enriched),
        critical_items=counts[STATUS_CRITICAL],
        low_items=counts[STATUS_LOW],
        watch_items=counts[STATUS_WATCH],
        healthy_items=counts[STATUS_HEALTHY],
        overstock_items=counts[STATUS_OVERSTOCK],
        total_inventory_value=round(total_value, 2) if has_value else None,
    )


# ---------- 2. Inventory Items ----------

@router.get("/items", response_model=List[InventoryItemResponse])
def get_inventory_items(
    outlet_id: Optional[int] = None,
    status: Optional[str] = None,
    category: Optional[str] = None,
    search: Optional[str] = None,
    start_date: Optional[datetime] = None,
    end_date: Optional[datetime] = None,
    db: Session = Depends(get_db),
):
    items = inv_queries.get_inventory_items(db, outlet_id=outlet_id, category=category, search=search)
    enriched = [_enrich_item(item, db, start_date, end_date) for item in items]

    # Filter by computed status if requested
    if status:
        enriched = [i for i in enriched if i["status"] == status.upper()]

    # Sort: CRITICAL first, then LOW, WATCH, HEALTHY, OVERSTOCK
    priority_order = {STATUS_CRITICAL: 0, STATUS_LOW: 1, STATUS_WATCH: 2, STATUS_HEALTHY: 3, STATUS_OVERSTOCK: 4}
    enriched.sort(key=lambda x: (priority_order.get(x["status"], 5), x.get("days_remaining") or 999))

    return [InventoryItemResponse(**item) for item in enriched]


# ---------- 3. Inventory Alerts ----------

@router.get("/alerts", response_model=List[InventoryAlertResponse])
def get_inventory_alerts(
    outlet_id: Optional[int] = None,
    start_date: Optional[datetime] = None,
    end_date: Optional[datetime] = None,
    db: Session = Depends(get_db),
):
    items = inv_queries.get_inventory_items(db, outlet_id=outlet_id)
    enriched = [_enrich_item(item, db, start_date, end_date) for item in items]
    alerts: List[InventoryAlertResponse] = []

    for item in enriched:
        # Critical stock alert
        if item["status"] == STATUS_CRITICAL:
            days_str = f"{item['days_remaining']:.1f}" if item["days_remaining"] is not None else "0"
            alerts.append(InventoryAlertResponse(
                severity="CRITICAL",
                title=f"Critical Stock: {item['ingredient_name']}",
                message=f"{item['ingredient_name']} at {item['outlet_name']} has only {days_str} days of stock remaining.",
                inventory_item_id=item["id"],
                ingredient_name=item["ingredient_name"],
                outlet_name=item["outlet_name"],
            ))

        # Low stock alert
        elif item["status"] == STATUS_LOW:
            days_str = f"{item['days_remaining']:.1f}" if item["days_remaining"] is not None else "N/A"
            alerts.append(InventoryAlertResponse(
                severity="HIGH",
                title=f"Low Stock: {item['ingredient_name']}",
                message=f"{item['ingredient_name']} at {item['outlet_name']} has approximately {days_str} days remaining.",
                inventory_item_id=item["id"],
                ingredient_name=item["ingredient_name"],
                outlet_name=item["outlet_name"],
            ))

        # High wastage alert
        totals = inv_queries.get_transaction_totals(db, item["id"], start_date, end_date)
        waste_pct = wastage_rate(totals.get("WASTAGE", 0), totals.get("CONSUMPTION", 0))
        if waste_pct > WASTAGE_RATE_HIGH:
            alerts.append(InventoryAlertResponse(
                severity="MEDIUM",
                title=f"High Wastage: {item['ingredient_name']}",
                message=f"{item['ingredient_name']} at {item['outlet_name']} has a wastage rate of {waste_pct:.1f}%.",
                inventory_item_id=item["id"],
                ingredient_name=item["ingredient_name"],
                outlet_name=item["outlet_name"],
            ))

        # Abnormal consumption alert
        expected = inv_queries.get_expected_consumption_from_sales(
            db, item["ingredient_id"], item["outlet_id"], start_date, end_date
        )
        comparison = compare_inventory_to_sales(expected, totals.get("CONSUMPTION", 0))
        if comparison["label"] in ("ABOVE_EXPECTED", "BELOW_EXPECTED"):
            variance = comparison.get("variance_percentage", 0)
            direction = "above" if comparison["label"] == "ABOVE_EXPECTED" else "below"
            alerts.append(InventoryAlertResponse(
                severity="MEDIUM",
                title=f"Abnormal Consumption: {item['ingredient_name']}",
                message=f"{item['ingredient_name']} at {item['outlet_name']} consumption is {abs(variance):.1f}% {direction} expected usage based on sales.",
                inventory_item_id=item["id"],
                ingredient_name=item["ingredient_name"],
                outlet_name=item["outlet_name"],
            ))

    # Sort by severity
    sev_order = {"CRITICAL": 0, "HIGH": 1, "MEDIUM": 2, "LOW": 3}
    alerts.sort(key=lambda a: sev_order.get(a.severity, 4))

    return alerts


# ---------- 4. Reorder Recommendations ----------

@router.get("/recommendations", response_model=List[ReorderRecommendationResponse])
def get_reorder_recommendations(
    outlet_id: Optional[int] = None,
    start_date: Optional[datetime] = None,
    end_date: Optional[datetime] = None,
    db: Session = Depends(get_db),
):
    items = inv_queries.get_inventory_items(db, outlet_id=outlet_id)
    enriched = [_enrich_item(item, db, start_date, end_date) for item in items]

    recommendations: List[ReorderRecommendationResponse] = []
    for item in enriched:
        rec = reorder_recommendation(
            avg_daily_consumption=item["average_daily_consumption"],
            lead_time_days=item["supplier_lead_time_days"],
            safety_stock=item["safety_stock"],
            current_stock=item["current_quantity"],
        )

        if rec["priority"] == PRIORITY_NONE:
            continue

        recommendations.append(ReorderRecommendationResponse(
            inventory_item_id=item["id"],
            ingredient_name=item["ingredient_name"],
            ingredient_category=item["ingredient_category"],
            outlet_name=item["outlet_name"],
            unit=item["unit"],
            current_stock=item["current_quantity"],
            days_remaining=item["days_remaining"],
            average_daily_consumption=item["average_daily_consumption"],
            lead_time_days=item["supplier_lead_time_days"],
            safety_stock=item["safety_stock"],
            expected_lead_time_consumption=rec["expected_lead_time_consumption"],
            recommended_quantity=rec["recommended_quantity"],
            priority=rec["priority"],
        ))

    # Sort: URGENT first
    prio_order = {"URGENT": 0, "HIGH": 1, "MEDIUM": 2, "LOW": 3, "NONE": 4}
    recommendations.sort(key=lambda r: prio_order.get(r.priority, 5))

    return recommendations


# ---------- 5. Inventory Item Detail ----------

@router.get("/items/{item_id}", response_model=InventoryDetailResponse)
def get_inventory_item_detail(
    item_id: int,
    start_date: Optional[datetime] = None,
    end_date: Optional[datetime] = None,
    db: Session = Depends(get_db),
):
    item = inv_queries.get_inventory_item_by_id(db, item_id)
    if not item:
        raise HTTPException(404, "Inventory item not found")

    enriched = _enrich_item(item, db, start_date, end_date)

    # Wastage rate
    totals = inv_queries.get_transaction_totals(db, item_id, start_date, end_date)
    waste_pct = wastage_rate(totals.get("WASTAGE", 0), totals.get("CONSUMPTION", 0))

    # Consumption growth (compare halves of the date range)
    growth_val = None
    num_days = inv_queries.get_transaction_date_range(db, item_id, start_date, end_date)
    if num_days and num_days >= 2:
        half = num_days // 2
        # We'll compare first half vs second half consumption via transaction totals
        # For simplicity, use overall growth metric
        growth_val = None  # We'll derive this from period comparison below

    # Sales vs consumption comparison
    expected = inv_queries.get_expected_consumption_from_sales(
        db, enriched["ingredient_id"], enriched["outlet_id"], start_date, end_date
    )
    comparison = compare_inventory_to_sales(expected, totals.get("CONSUMPTION", 0))

    # Strengths and weaknesses
    strengths, weaknesses = generate_item_strengths_weaknesses(
        days_remaining=enriched["days_remaining"],
        wastage_pct=waste_pct,
        growth=growth_val,
        sales_label=comparison["label"],
        avg_daily=enriched["average_daily_consumption"],
    )

    return InventoryDetailResponse(
        **{k: v for k, v in enriched.items()},
        wastage_rate=round(waste_pct, 2),
        consumption_growth=growth_val,
        sales_vs_consumption=comparison["label"],
        sales_vs_consumption_variance=comparison.get("variance_percentage"),
        strengths=strengths,
        weaknesses=weaknesses,
    )


# ---------- 6. Inventory Trends ----------

@router.get("/trends", response_model=List[InventoryTrendPoint])
def get_inventory_trends(
    outlet_id: Optional[int] = None,
    item_id: Optional[int] = None,
    start_date: Optional[datetime] = None,
    end_date: Optional[datetime] = None,
    db: Session = Depends(get_db),
):
    if start_date and end_date and start_date > end_date:
        raise HTTPException(400, "start_date cannot be after end_date")

    trends = inv_queries.get_daily_transaction_trends(
        db,
        inventory_item_id=item_id,
        outlet_id=outlet_id,
        start_date=start_date,
        end_date=end_date,
    )

    return [InventoryTrendPoint(**t) for t in trends]


# ---------- 7. Inventory Item History ----------

@router.get("/items/{item_id}/history", response_model=List[InventoryHistoryEntry])
def get_inventory_item_history(
    item_id: int,
    start_date: Optional[datetime] = None,
    end_date: Optional[datetime] = None,
    db: Session = Depends(get_db),
):
    # Verify item exists
    item = inv_queries.get_inventory_item_by_id(db, item_id)
    if not item:
        raise HTTPException(404, "Inventory item not found")

    history = inv_queries.get_transaction_history(db, item_id, start_date, end_date)
    return [InventoryHistoryEntry(**h) for h in history]
