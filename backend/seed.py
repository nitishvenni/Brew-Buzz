import random
from datetime import datetime, timedelta, timezone
from sqlalchemy.orm import Session
from app.core.database import SessionLocal, engine, Base
from app.models.domain import Franchise, Outlet, Category, Product, Order, OrderItem
import os

# Ensure tables are created if not already
# (Alembic should handle this usually, but good for direct seed run if needed)
# Base.metadata.create_all(bind=engine)

def seed_data(db: Session):
    # 1. Franchise
    franchise = db.query(Franchise).filter_by(name="Brew Buzz").first()
    if not franchise:
        franchise = Franchise(name="Brew Buzz")
        db.add(franchise)
        db.commit()
        db.refresh(franchise)
    
    # 2. Outlets
    outlets_data = [
        {"name": "Brew Buzz Downtown", "city": "Metropolis", "status": "active"}, # High performance
        {"name": "Brew Buzz Mall", "city": "Metropolis", "status": "active"},     # Moderate performance
        {"name": "Brew Buzz Suburb", "city": "Smallville", "status": "active"},   # Declining performance
    ]
    outlets = []
    for o_data in outlets_data:
        outlet = db.query(Outlet).filter_by(name=o_data["name"]).first()
        if not outlet:
            outlet = Outlet(franchise_id=franchise.id, name=o_data["name"], city=o_data["city"], status=o_data["status"])
            db.add(outlet)
            db.commit()
            db.refresh(outlet)
        outlets.append(outlet)

    # 3. Categories
    categories_data = ["Pizza", "Coffee", "Dessert"]
    categories = {}
    for c_name in categories_data:
        category = db.query(Category).filter_by(name=c_name).first()
        if not category:
            category = Category(name=c_name)
            db.add(category)
            db.commit()
            db.refresh(category)
        categories[c_name] = category

    # 4. Products
    products_data = [
        {"category": "Pizza", "name": "Margherita", "price": 12.00},
        {"category": "Pizza", "name": "Pepperoni", "price": 15.00},
        {"category": "Pizza", "name": "Farmhouse", "price": 14.50},
        {"category": "Coffee", "name": "Espresso", "price": 3.00},
        {"category": "Coffee", "name": "Cappuccino", "price": 4.50},
        {"category": "Coffee", "name": "Latte", "price": 5.00},
        {"category": "Coffee", "name": "Cold Coffee", "price": 5.50},
        {"category": "Dessert", "name": "Brownie", "price": 6.00},
    ]
    products = []
    for p_data in products_data:
        cat_id = categories[p_data["category"]].id
        product = db.query(Product).filter_by(name=p_data["name"]).first()
        if not product:
            product = Product(category_id=cat_id, name=p_data["name"], price=p_data["price"])
            db.add(product)
            db.commit()
            db.refresh(product)
        products.append(product)

        # 5. Orders and Order Items
    
    HISTORY_DAYS = 90
    RANDOM_SEED = 42
    rng = random.Random(RANDOM_SEED)

    # Scenarios for deterministic demand variation
    OUTLET_SCENARIOS = {
        "Brew Buzz Downtown": "GROWING",
        "Brew Buzz Mall": "STABLE",
        "Brew Buzz Suburb": "DECLINING",
    }

    PRODUCT_SCENARIOS = {
        "Pepperoni": "GROWING",
        "Cold Coffee": "GROWING",
        "Margherita": "STABLE",
        "Espresso": "STABLE",
        "Cappuccino": "STABLE",
        "Latte": "STABLE",
        "Farmhouse": "DECLINING",
        "Brownie": "DECLINING",
    }
    
    # Check if orders already exist. If so, we wipe them to allow clean reseeding.
    # This ensures the 90-day window is always anchored to the CURRENT run date.
    if db.query(Order).count() > 0:
        print("Wiping existing orders for clean reseeding...")
        from app.models.domain import InventoryTransaction, Shift, InventoryItem, RecipeItem, Ingredient
        db.query(InventoryTransaction).delete()
        db.query(InventoryItem).delete()
        db.query(RecipeItem).delete()
        db.query(Ingredient).delete()
        db.query(Shift).delete()
        db.query(OrderItem).delete()
        db.query(Order).delete()
        db.commit()

    now = datetime.now(timezone.utc)
    
    for day_offset in range(HISTORY_DAYS, -1, -1):
        current_date = now - timedelta(days=day_offset)
        
        # 1. Build product weights for this specific day to simulate product trends
        day_products = []
        day_weights = []
        for p in products:
            scenario = PRODUCT_SCENARIOS.get(p.name, "STABLE")
            
            if scenario == "GROWING":
                # Starts at 1.0, grows to 2.5
                w = 1.0 + (HISTORY_DAYS - day_offset) * (1.5 / HISTORY_DAYS)
            elif scenario == "DECLINING":
                # Starts at 2.5, drops to 1.0
                w = 2.5 - (HISTORY_DAYS - day_offset) * (1.5 / HISTORY_DAYS)
            else:
                # Stable
                w = 1.5
                
            day_products.append(p)
            day_weights.append(max(0.1, w))
        
        # 2. Determine daily order volume per outlet
        for outlet in outlets:
            o_scenario = OUTLET_SCENARIOS.get(outlet.name, "STABLE")
            if o_scenario == "GROWING":
                base_orders = 50 + (HISTORY_DAYS - day_offset) * 0.5
            elif o_scenario == "STABLE":
                base_orders = 45
            else: # DECLINING
                base_orders = 35 - (HISTORY_DAYS - day_offset) * 0.25
                
            num_orders = int(base_orders + rng.randint(-5, 5))
            num_orders = max(1, num_orders)
            
            # 3. Generate individual orders
            for _ in range(num_orders):
                hour = rng.randint(8, 22)
                minute = rng.randint(0, 59)
                order_time = current_date.replace(hour=hour, minute=minute)
                
                num_items = rng.randint(1, 4)
                
                # Pick distinct products using weights
                order_products_set = set()
                while len(order_products_set) < num_items:
                    picked = rng.choices(day_products, weights=day_weights, k=1)[0]
                    order_products_set.add(picked)
                
                order_products = list(order_products_set)
                
                total_amount = sum([p.price for p in order_products])
                
                order = Order(
                    outlet_id=outlet.id,
                    order_timestamp=order_time,
                    status="completed",
                    total_amount=total_amount,
                    created_at=order_time
                )
                db.add(order)
                db.flush()
                
                # We need deterministic AOV behavior - mostly qty=1, sometimes 2
                for product in order_products:
                    qty = rng.choices([1, 2], weights=[0.85, 0.15], k=1)[0]
                    unit_price = product.price
                    subtotal = qty * unit_price
                    
                    order_item = OrderItem(
                        order_id=order.id,
                        product_id=product.id,
                        quantity=qty,
                        unit_price=unit_price,
                        subtotal=subtotal
                    )
                    db.add(order_item)
                    order.total_amount += (subtotal - product.price)
                    
        db.commit()
    
    print("Seed data successfully inserted.")


from app.models.domain import Role, Employee, Shift

def seed_workforce(db: Session):
    rng = random.Random(42)
    
    roles_data = ["Manager", "Barista", "Cashier", "Kitchen Staff", "Support"]
    for rd in roles_data:
        if not db.query(Role).filter_by(name=rd).first():
            db.add(Role(name=rd, description=f"{rd} Role"))
    db.commit()
    roles = {r.name: r for r in db.query(Role).all()}
    
    outlets = db.query(Outlet).all()
    if not outlets:
        return

    if db.query(Employee).count() == 0:
        emp_id = 1
        for outlet in outlets:
            roles_for_outlet = ["Manager", "Barista", "Cashier", "Kitchen Staff", "Support"]
            for i, role_name in enumerate(roles_for_outlet):
                status = "ACTIVE"
                if role_name == "Support" or (role_name == "Kitchen Staff" and outlet.name != "Brew Buzz Downtown"):
                    status = "INACTIVE" 
                db.add(Employee(
                    employee_code=f"EMP{emp_id:03d}",
                    name=f"{role_name} {emp_id}",
                    role_id=roles[role_name].id,
                    outlet_id=outlet.id,
                    employment_status=status,
                    hire_date=datetime.now(timezone.utc) - timedelta(days=rng.randint(100, 365))
                ))
                emp_id += 1
        db.commit()
    
    employees = db.query(Employee).all()
    
    end_date = datetime.now(timezone.utc)
    start_date = end_date - timedelta(days=90)
    
    if db.query(Shift).filter(Shift.shift_date >= start_date).count() == 0:
        current_date = start_date
        
        while current_date <= end_date:
            for outlet in outlets:
                outlet_emps = [e for e in employees if e.outlet_id == outlet.id]
                
                for emp in outlet_emps:
                    if rng.random() < 0.7:
                        scheduled_start = current_date.replace(hour=8, minute=0, second=0, microsecond=0)
                        scheduled_end = scheduled_start + timedelta(hours=8)
                        
                        actual_start = scheduled_start
                        actual_end = scheduled_end
                        status = "COMPLETED"
                        
                        r = rng.random()
                        
                        if outlet.name == "Brew Buzz Downtown": # HEALTHY
                            if r < 0.02: status = "ABSENT"
                            elif r < 0.05: actual_start += timedelta(minutes=rng.randint(10, 30))
                        elif outlet.name == "Brew Buzz Mall": # WATCH
                            if r < 0.05: status = "ABSENT" 
                            elif r < 0.4: actual_end += timedelta(hours=rng.randint(2, 4)) # Overtime
                        elif outlet.name == "Brew Buzz Suburb": # ATTENTION
                            if r < 0.15: status = "ABSENT" 
                            elif r < 0.4: actual_start += timedelta(minutes=rng.randint(20, 60)) # Lateness
                        
                        if status == "ABSENT":
                            actual_start = None
                            actual_end = None
                        
                        db.add(Shift(
                            employee_id=emp.id,
                            outlet_id=outlet.id,
                            shift_date=current_date,
                            scheduled_start=scheduled_start,
                            scheduled_end=scheduled_end,
                            actual_start=actual_start,
                            actual_end=actual_end,
                            status=status
                        ))
            
            db.commit()
            current_date += timedelta(days=1)
        print("Workforce seed data successfully inserted.")

if __name__ == "__main__":
    db = SessionLocal()
    try:
        seed_data(db)
        seed_workforce(db)
    finally:
        db.close()
