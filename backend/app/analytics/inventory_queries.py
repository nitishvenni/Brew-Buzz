"""
Inventory data access queries.

Follows the existing project convention of functional query modules
that take `db: Session` as first parameter.
"""
from typing import Optional, List, Dict, Any
from datetime import datetime
from decimal import Decimal
from sqlalchemy.orm import Session
from sqlalchemy import func, and_

from app.models.domain import (
    Ingredient, RecipeItem, InventoryItem, InventoryTransaction,
    Order, OrderItem, Product, Outlet,
    TRANSACTION_PURCHASE, TRANSACTION_CONSUMPTION, TRANSACTION_WASTAGE
)


def get_inventory_items(
    db: Session,
    outlet_id: Optional[int] = None,
    status: Optional[str] = None,
    category: Optional[str] = None,
    search: Optional[str] = None,
) -> List[Dict[str, Any]]:
    """Fetch inventory items with ingredient details, optionally filtered."""
    query = (
        db.query(
            InventoryItem,
            Ingredient.name.label("ingredient_name"),
            Ingredient.category.label("ingredient_category"),
            Ingredient.unit.label("ingredient_unit"),
            Ingredient.unit_cost.label("ingredient_unit_cost"),
            Outlet.name.label("outlet_name"),
        )
        .join(Ingredient, InventoryItem.ingredient_id == Ingredient.id)
        .join(Outlet, InventoryItem.outlet_id == Outlet.id)
    )

    if outlet_id is not None:
        query = query.filter(InventoryItem.outlet_id == outlet_id)
    if category is not None:
        query = query.filter(Ingredient.category == category)
    if search is not None:
        query = query.filter(Ingredient.name.ilike(f"%{search}%"))

    results = query.all()

    items = []
    for row in results:
        inv = row[0]  # InventoryItem object
        items.append({
            "id": inv.id,
            "outlet_id": inv.outlet_id,
            "outlet_name": row.outlet_name,
            "ingredient_id": inv.ingredient_id,
            "ingredient_name": row.ingredient_name,
            "ingredient_category": row.ingredient_category,
            "unit": row.ingredient_unit,
            "unit_cost": float(row.ingredient_unit_cost) if row.ingredient_unit_cost else None,
            "current_quantity": float(inv.current_quantity),
            "reorder_level": float(inv.reorder_level),
            "safety_stock": float(inv.safety_stock),
            "supplier_lead_time_days": inv.supplier_lead_time_days,
            "last_purchase_at": inv.last_purchase_at,
        })

    return items


def get_inventory_item_by_id(db: Session, item_id: int) -> Optional[Dict[str, Any]]:
    """Fetch a single inventory item with full details."""
    row = (
        db.query(
            InventoryItem,
            Ingredient.name.label("ingredient_name"),
            Ingredient.category.label("ingredient_category"),
            Ingredient.unit.label("ingredient_unit"),
            Ingredient.unit_cost.label("ingredient_unit_cost"),
            Outlet.name.label("outlet_name"),
        )
        .join(Ingredient, InventoryItem.ingredient_id == Ingredient.id)
        .join(Outlet, InventoryItem.outlet_id == Outlet.id)
        .filter(InventoryItem.id == item_id)
        .first()
    )
    if not row:
        return None

    inv = row[0]
    return {
        "id": inv.id,
        "outlet_id": inv.outlet_id,
        "outlet_name": row.outlet_name,
        "ingredient_id": inv.ingredient_id,
        "ingredient_name": row.ingredient_name,
        "ingredient_category": row.ingredient_category,
        "unit": row.ingredient_unit,
        "unit_cost": float(row.ingredient_unit_cost) if row.ingredient_unit_cost else None,
        "current_quantity": float(inv.current_quantity),
        "reorder_level": float(inv.reorder_level),
        "safety_stock": float(inv.safety_stock),
        "supplier_lead_time_days": inv.supplier_lead_time_days,
        "last_purchase_at": inv.last_purchase_at,
    }


def get_transaction_totals(
    db: Session,
    inventory_item_id: int,
    start_date: Optional[datetime] = None,
    end_date: Optional[datetime] = None,
) -> Dict[str, float]:
    """Get total quantities grouped by transaction type for an inventory item."""
    filters = [InventoryTransaction.inventory_item_id == inventory_item_id]
    if start_date:
        filters.append(InventoryTransaction.created_at >= start_date)
    if end_date:
        filters.append(InventoryTransaction.created_at <= end_date)

    rows = (
        db.query(
            InventoryTransaction.transaction_type,
            func.sum(InventoryTransaction.quantity).label("total"),
        )
        .filter(*filters)
        .group_by(InventoryTransaction.transaction_type)
        .all()
    )

    totals = {
        TRANSACTION_PURCHASE: 0.0,
        TRANSACTION_CONSUMPTION: 0.0,
        TRANSACTION_WASTAGE: 0.0,
    }
    for row in rows:
        totals[row.transaction_type] = abs(float(row.total or 0))

    return totals


def get_transaction_date_range(
    db: Session,
    inventory_item_id: int,
    start_date: Optional[datetime] = None,
    end_date: Optional[datetime] = None,
) -> Optional[int]:
    """Get the number of days covered by transactions for an inventory item."""
    filters = [InventoryTransaction.inventory_item_id == inventory_item_id]
    if start_date:
        filters.append(InventoryTransaction.created_at >= start_date)
    if end_date:
        filters.append(InventoryTransaction.created_at <= end_date)

    row = (
        db.query(
            func.min(InventoryTransaction.created_at).label("first"),
            func.max(InventoryTransaction.created_at).label("last"),
        )
        .filter(*filters)
        .first()
    )

    if not row or not row.first or not row.last:
        return None

    delta = row.last - row.first
    return max(1, delta.days)


def get_transaction_history(
    db: Session,
    inventory_item_id: int,
    start_date: Optional[datetime] = None,
    end_date: Optional[datetime] = None,
) -> List[Dict[str, Any]]:
    """Get chronological transaction history for an inventory item."""
    filters = [InventoryTransaction.inventory_item_id == inventory_item_id]
    if start_date:
        filters.append(InventoryTransaction.created_at >= start_date)
    if end_date:
        filters.append(InventoryTransaction.created_at <= end_date)

    rows = (
        db.query(InventoryTransaction)
        .filter(*filters)
        .order_by(InventoryTransaction.created_at)
        .all()
    )

    return [
        {
            "id": t.id,
            "transaction_type": t.transaction_type,
            "quantity": float(t.quantity),
            "reference": t.reference,
            "created_at": t.created_at,
        }
        for t in rows
    ]


def get_daily_transaction_trends(
    db: Session,
    inventory_item_id: Optional[int] = None,
    outlet_id: Optional[int] = None,
    start_date: Optional[datetime] = None,
    end_date: Optional[datetime] = None,
) -> List[Dict[str, Any]]:
    """Get daily aggregated transaction data for trend charts."""
    filters = []
    if inventory_item_id is not None:
        filters.append(InventoryTransaction.inventory_item_id == inventory_item_id)
    if outlet_id is not None:
        filters.append(InventoryItem.outlet_id == outlet_id)
    if start_date:
        filters.append(InventoryTransaction.created_at >= start_date)
    if end_date:
        filters.append(InventoryTransaction.created_at <= end_date)

    query = (
        db.query(
            func.date(InventoryTransaction.created_at).label("date"),
            InventoryTransaction.transaction_type,
            func.sum(func.abs(InventoryTransaction.quantity)).label("total"),
        )
        .join(InventoryItem, InventoryTransaction.inventory_item_id == InventoryItem.id)
        .filter(*filters)
        .group_by(func.date(InventoryTransaction.created_at), InventoryTransaction.transaction_type)
        .order_by(func.date(InventoryTransaction.created_at))
    )

    rows = query.all()

    # Pivot by date
    daily: Dict[str, Dict[str, float]] = {}
    for row in rows:
        d = str(row.date)
        if d not in daily:
            daily[d] = {"consumption": 0.0, "wastage": 0.0, "purchases": 0.0}
        total = float(row.total or 0)
        if row.transaction_type == TRANSACTION_CONSUMPTION:
            daily[d]["consumption"] = total
        elif row.transaction_type == TRANSACTION_WASTAGE:
            daily[d]["wastage"] = total
        elif row.transaction_type == TRANSACTION_PURCHASE:
            daily[d]["purchases"] = total

    return [
        {"date": d, **vals}
        for d, vals in sorted(daily.items())
    ]


def get_expected_consumption_from_sales(
    db: Session,
    ingredient_id: int,
    outlet_id: int,
    start_date: Optional[datetime] = None,
    end_date: Optional[datetime] = None,
) -> float:
    """
    Calculate expected ingredient consumption based on actual product sales and recipes.

    Sales (OrderItem qty) × Recipe (quantity_required per product) = Expected consumption.
    """
    filters = [
        Order.status == "completed",
        Order.outlet_id == outlet_id,
        RecipeItem.ingredient_id == ingredient_id,
    ]
    if start_date:
        filters.append(Order.order_timestamp >= start_date)
    if end_date:
        filters.append(Order.order_timestamp <= end_date)

    row = (
        db.query(
            func.sum(OrderItem.quantity * RecipeItem.quantity_required).label("expected")
        )
        .join(Order, OrderItem.order_id == Order.id)
        .join(RecipeItem, and_(
            RecipeItem.product_id == OrderItem.product_id,
            RecipeItem.ingredient_id == ingredient_id,
        ))
        .filter(*filters)
        .first()
    )

    return float(row.expected) if row and row.expected else 0.0
