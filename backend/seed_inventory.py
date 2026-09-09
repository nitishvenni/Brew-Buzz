"""
Inventory seed data for Brew Buzz.

Generates ingredients, recipes (BOM), inventory items per outlet,
and historical inventory transactions derived from actual sales data.

Uses random.seed(42) for reproducibility.
Transactions are generated to create 5 distinct inventory scenarios:
1. Healthy (Downtown/Coffee Beans) — adequate stock, stable consumption
2. Critical (Suburb/Mozzarella) — very low stock, high consumption
3. Low Stock (Mall/Pizza Dough) — approaching reorder point
4. High Wastage (Downtown/Milk) — wastage ~20% of consumption
5. Overstock (Suburb/Sugar) — massive stock, minimal consumption
"""
import random
from datetime import datetime, timedelta, timezone
from decimal import Decimal
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.models.domain import (
    Ingredient, RecipeItem, InventoryItem, InventoryTransaction,
    Product, Order, OrderItem, Outlet,
    TRANSACTION_PURCHASE, TRANSACTION_CONSUMPTION, TRANSACTION_WASTAGE, TRANSACTION_ADJUSTMENT
)

random.seed(42)

# ---- Ingredient definitions ----
INGREDIENTS = [
    {"name": "Pizza Dough",       "category": "Grain",         "unit": "kg",     "unit_cost": 80.00},
    {"name": "Mozzarella Cheese", "category": "Dairy",         "unit": "kg",     "unit_cost": 450.00},
    {"name": "Tomato Sauce",      "category": "Vegetable",     "unit": "liters", "unit_cost": 120.00},
    {"name": "Basil",             "category": "Vegetable",     "unit": "kg",     "unit_cost": 200.00},
    {"name": "Pepperoni Slices",  "category": "Meat",          "unit": "kg",     "unit_cost": 600.00},
    {"name": "Mixed Vegetables",  "category": "Vegetable",     "unit": "kg",     "unit_cost": 150.00},
    {"name": "Mushrooms",         "category": "Vegetable",     "unit": "kg",     "unit_cost": 180.00},
    {"name": "Coffee Beans",      "category": "Beverage Base", "unit": "kg",     "unit_cost": 800.00},
    {"name": "Milk",              "category": "Dairy",         "unit": "liters", "unit_cost": 60.00},
    {"name": "Sugar",             "category": "Sweetener",     "unit": "kg",     "unit_cost": 45.00},
    {"name": "Cocoa Powder",      "category": "Beverage Base", "unit": "kg",     "unit_cost": 350.00},
    {"name": "Flour",             "category": "Grain",         "unit": "kg",     "unit_cost": 40.00},
    {"name": "Butter",            "category": "Dairy",         "unit": "kg",     "unit_cost": 500.00},
    {"name": "Chocolate Chips",   "category": "Sweetener",     "unit": "kg",     "unit_cost": 400.00},
    {"name": "Cream",             "category": "Dairy",         "unit": "liters", "unit_cost": 200.00},
]

# ---- Recipe / BOM definitions ----
# product_name -> [(ingredient_name, quantity_required)]
RECIPES = {
    "Margherita": [
        ("Pizza Dough", 0.25), ("Mozzarella Cheese", 0.15),
        ("Tomato Sauce", 0.10), ("Basil", 0.01),
    ],
    "Pepperoni": [
        ("Pizza Dough", 0.25), ("Mozzarella Cheese", 0.15),
        ("Tomato Sauce", 0.10), ("Pepperoni Slices", 0.08),
    ],
    "Farmhouse": [
        ("Pizza Dough", 0.25), ("Mozzarella Cheese", 0.15),
        ("Tomato Sauce", 0.10), ("Mixed Vegetables", 0.12), ("Mushrooms", 0.08),
    ],
    "Espresso": [
        ("Coffee Beans", 0.02), ("Sugar", 0.005),
    ],
    "Cappuccino": [
        ("Coffee Beans", 0.02), ("Milk", 0.15), ("Sugar", 0.01),
    ],
    "Latte": [
        ("Coffee Beans", 0.02), ("Milk", 0.20), ("Sugar", 0.01),
    ],
    "Cold Coffee": [
        ("Coffee Beans", 0.02), ("Milk", 0.20), ("Sugar", 0.02), ("Cream", 0.03),
    ],
    "Brownie": [
        ("Flour", 0.05), ("Butter", 0.04), ("Cocoa Powder", 0.03),
        ("Sugar", 0.04), ("Chocolate Chips", 0.03),
    ],
}

# Inventory scenario overrides: (outlet_name, ingredient_name) -> config
# These override the default stock levels to create interesting test scenarios
SCENARIO_OVERRIDES = {
    # Scenario 1: Healthy — Coffee Beans at Downtown: ample stock
    ("Brew Buzz Downtown", "Coffee Beans"): {
        "stock_multiplier": 25,   # 25 days of stock
        "reorder_level_days": 7,
        "safety_stock_days": 3,
        "lead_time": 3,
        "wastage_pct": 2.0,       # low wastage
    },
    # Scenario 2: Critical — Mozzarella at Suburb: almost empty
    ("Brew Buzz Suburb", "Mozzarella Cheese"): {
        "stock_multiplier": 1.5,  # only 1.5 days of stock
        "reorder_level_days": 7,
        "safety_stock_days": 3,
        "lead_time": 4,
        "wastage_pct": 3.0,
    },
    # Scenario 3: Low Stock — Pizza Dough at Mall: near reorder point
    ("Brew Buzz Mall", "Pizza Dough"): {
        "stock_multiplier": 5,    # 5 days of stock
        "reorder_level_days": 7,
        "safety_stock_days": 3,
        "lead_time": 3,
        "wastage_pct": 4.0,
    },
    # Scenario 4: High Wastage — Milk at Downtown: high wastage rate
    ("Brew Buzz Downtown", "Milk"): {
        "stock_multiplier": 15,
        "reorder_level_days": 7,
        "safety_stock_days": 3,
        "lead_time": 2,
        "wastage_pct": 22.0,     # Very high wastage!
    },
    # Scenario 5: Overstock — Sugar at Suburb: massive stock, low consumption
    ("Brew Buzz Suburb", "Sugar"): {
        "stock_multiplier": 60,   # 60 days of stock (overstock)
        "reorder_level_days": 7,
        "safety_stock_days": 3,
        "lead_time": 5,
        "wastage_pct": 1.0,
    },
}

DEFAULT_CONFIG = {
    "stock_multiplier": 15,
    "reorder_level_days": 7,
    "safety_stock_days": 3,
    "lead_time": 3,
    "wastage_pct": 5.0,
}


def seed_inventory(db: Session):
    """Seed inventory data. Safe to re-run — checks for existing data."""

    # Guard: skip if ingredients already exist
    if db.query(Ingredient).count() > 0:
        print("Inventory data already exists. Skipping inventory seeding.")
        return

    print("Seeding inventory data...")

    # 1. Create Ingredients
    ingredient_map = {}
    for ing_data in INGREDIENTS:
        ing = Ingredient(
            name=ing_data["name"],
            category=ing_data["category"],
            unit=ing_data["unit"],
            unit_cost=Decimal(str(ing_data["unit_cost"])),
        )
        db.add(ing)
        db.flush()
        ingredient_map[ing.name] = ing

    # 2. Create Recipe Items (BOM)
    products = {p.name: p for p in db.query(Product).all()}
    for product_name, recipe_items in RECIPES.items():
        product = products.get(product_name)
        if not product:
            print(f"  Warning: Product '{product_name}' not found, skipping recipe.")
            continue
        for ingredient_name, qty in recipe_items:
            ing = ingredient_map.get(ingredient_name)
            if not ing:
                continue
            ri = RecipeItem(
                product_id=product.id,
                ingredient_id=ing.id,
                quantity_required=Decimal(str(qty)),
                unit=ing.unit,
            )
            db.add(ri)

    db.flush()

    # 3. Calculate expected daily consumption per outlet per ingredient from actual sales
    outlets = db.query(Outlet).all()
    now = datetime.now(timezone.utc)
    lookback_days = 30  # Use last 30 days of sales to compute average consumption

    for outlet in outlets:
        # Get total product quantities sold at this outlet in the lookback window
        lookback_start = now - timedelta(days=lookback_days)
        product_sales = (
            db.query(
                OrderItem.product_id,
                func.sum(OrderItem.quantity).label("total_qty"),
            )
            .join(Order, OrderItem.order_id == Order.id)
            .filter(
                Order.outlet_id == outlet.id,
                Order.status == "completed",
                Order.order_timestamp >= lookback_start,
            )
            .group_by(OrderItem.product_id)
            .all()
        )

        # Calculate expected ingredient consumption from sales
        ingredient_daily_consumption = {}
        for ps in product_sales:
            product = products.get(next((p.name for p in products.values() if p.id == ps.product_id), None))
            if not product:
                continue
            recipe = RECIPES.get(product.name, [])
            for ingredient_name, qty_per_unit in recipe:
                key = ingredient_name
                total_ingredient_used = float(ps.total_qty) * qty_per_unit
                daily_avg = total_ingredient_used / lookback_days
                ingredient_daily_consumption[key] = ingredient_daily_consumption.get(key, 0.0) + daily_avg

        # 4. Create InventoryItem + Transactions for each ingredient at this outlet
        for ing_name, ing in ingredient_map.items():
            daily_consumption = ingredient_daily_consumption.get(ing_name, 0.0)
            config = SCENARIO_OVERRIDES.get((outlet.name, ing_name), DEFAULT_CONFIG)

            reorder_level = daily_consumption * config["reorder_level_days"]
            safety_stock_val = daily_consumption * config["safety_stock_days"]
            current_stock = daily_consumption * config["stock_multiplier"]

            inv_item = InventoryItem(
                outlet_id=outlet.id,
                ingredient_id=ing.id,
                current_quantity=Decimal(str(round(current_stock, 4))),
                reorder_level=Decimal(str(round(reorder_level, 4))),
                safety_stock=Decimal(str(round(safety_stock_val, 4))),
                supplier_lead_time_days=config["lead_time"],
            )
            db.add(inv_item)
            db.flush()

            # Generate 30 days of transaction history
            total_consumption_txn = 0.0
            for day_offset in range(lookback_days, 0, -1):
                txn_date = now - timedelta(days=day_offset)

                # Daily consumption transaction
                if daily_consumption > 0:
                    daily_var = daily_consumption * random.uniform(0.8, 1.2)
                    total_consumption_txn += daily_var
                    db.add(InventoryTransaction(
                        inventory_item_id=inv_item.id,
                        transaction_type=TRANSACTION_CONSUMPTION,
                        quantity=Decimal(str(round(-daily_var, 4))),
                        reference="Daily consumption",
                        created_at=txn_date.replace(hour=20, minute=0),
                    ))

                    # Wastage (based on configured percentage)
                    if random.random() < 0.3:  # 30% chance of wastage on any given day
                        wastage_amount = daily_var * (config["wastage_pct"] / 100.0)
                        if wastage_amount > 0.001:
                            db.add(InventoryTransaction(
                                inventory_item_id=inv_item.id,
                                transaction_type=TRANSACTION_WASTAGE,
                                quantity=Decimal(str(round(-wastage_amount, 4))),
                                reference="Spoilage/waste",
                                created_at=txn_date.replace(hour=21, minute=0),
                            ))

                # Weekly purchase (restock every 7 days)
                if day_offset % 7 == 0 and daily_consumption > 0:
                    purchase_qty = daily_consumption * 7 * 1.1  # 10% buffer
                    db.add(InventoryTransaction(
                        inventory_item_id=inv_item.id,
                        transaction_type=TRANSACTION_PURCHASE,
                        quantity=Decimal(str(round(purchase_qty, 4))),
                        reference="Weekly restock",
                        created_at=txn_date.replace(hour=8, minute=0),
                    ))
                    inv_item.last_purchase_at = txn_date.replace(hour=8, minute=0)

            db.flush()

    db.commit()
    print("Inventory seed data inserted successfully.")


if __name__ == "__main__":
    from app.core.database import SessionLocal
    db = SessionLocal()
    try:
        seed_inventory(db)
    finally:
        db.close()
