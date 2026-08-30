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
    # Generate historical data for past 60 days
    # Outlet 0 (Downtown) - High volume, growing
    # Outlet 1 (Mall) - Medium volume, stable
    # Outlet 2 (Suburb) - Low volume, declining
    
    # Check if orders already exist to avoid duplicating seed
    if db.query(Order).count() > 0:
        print("Orders already exist. Skipping order seeding.")
        return

    now = datetime.now(timezone.utc)
    for day_offset in range(60, -1, -1):
        current_date = now - timedelta(days=day_offset)
        
        # Determine number of orders per outlet based on profile and day offset (for trends)
        # Downtown: starts at 50, grows to 80
        orders_downtown = int(50 + (60 - day_offset) * 0.5)
        # Mall: stable around 40
        orders_mall = 40 + random.randint(-5, 5)
        # Suburb: starts at 30, declines to 10
        orders_suburb = int(30 - (60 - day_offset) * 0.3)
        
        outlet_daily_orders = [
            (outlets[0], orders_downtown),
            (outlets[1], orders_mall),
            (outlets[2], orders_suburb)
        ]
        
        for outlet, num_orders in outlet_daily_orders:
            for _ in range(num_orders):
                # Distribute orders throughout the day
                hour = random.randint(8, 22)
                minute = random.randint(0, 59)
                order_time = current_date.replace(hour=hour, minute=minute)
                
                # Determine products for this order
                num_items = random.randint(1, 4)
                order_products = random.sample(products, num_items)
                
                total_amount = sum([p.price for p in order_products])
                
                order = Order(
                    outlet_id=outlet.id,
                    order_timestamp=order_time,
                    status="completed",
                    total_amount=total_amount,
                    created_at=order_time
                )
                db.add(order)
                db.flush() # Get order.id
                
                for product in order_products:
                    # In this setup we assume qty=1 for simplicity, can randomize qty
                    qty = random.randint(1, 2)
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
                    # update order total correctly
                    order.total_amount += (subtotal - product.price) # correct total
                    
        db.commit() # commit daily
    
    print("Seed data successfully inserted.")

if __name__ == "__main__":
    db = SessionLocal()
    try:
        seed_data(db)
    finally:
        db.close()
