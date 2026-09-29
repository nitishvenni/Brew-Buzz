from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Numeric, Boolean, UniqueConstraint
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base

class Franchise(Base):
    __tablename__ = "franchises"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False, unique=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    outlets = relationship("Outlet", back_populates="franchise")

class Outlet(Base):
    __tablename__ = "outlets"

    id = Column(Integer, primary_key=True, index=True)
    franchise_id = Column(Integer, ForeignKey("franchises.id"), nullable=False)
    name = Column(String, nullable=False)
    city = Column(String, nullable=False)
    status = Column(String, nullable=False, default="active")
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    franchise = relationship("Franchise", back_populates="outlets")
    orders = relationship("Order", back_populates="outlet")
    inventory_items = relationship("InventoryItem", back_populates="outlet")
    employees = relationship("Employee", back_populates="outlet")

class Category(Base):
    __tablename__ = "categories"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False, unique=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    
    products = relationship("Product", back_populates="category")

class Product(Base):
    __tablename__ = "products"

    id = Column(Integer, primary_key=True, index=True)
    category_id = Column(Integer, ForeignKey("categories.id"), nullable=False)
    name = Column(String, nullable=False)
    price = Column(Numeric(10, 2), nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    category = relationship("Category", back_populates="products")
    order_items = relationship("OrderItem", back_populates="product")
    recipe_items = relationship("RecipeItem", back_populates="product")

class Order(Base):
    __tablename__ = "orders"

    id = Column(Integer, primary_key=True, index=True)
    outlet_id = Column(Integer, ForeignKey("outlets.id"), nullable=False)
    order_timestamp = Column(DateTime(timezone=True), nullable=False, server_default=func.now(), index=True)
    status = Column(String, nullable=False, default="completed")
    total_amount = Column(Numeric(10, 2), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    outlet = relationship("Outlet", back_populates="orders")
    items = relationship("OrderItem", back_populates="order")

class OrderItem(Base):
    __tablename__ = "order_items"

    id = Column(Integer, primary_key=True, index=True)
    order_id = Column(Integer, ForeignKey("orders.id"), nullable=False)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=False)
    quantity = Column(Integer, nullable=False)
    unit_price = Column(Numeric(10, 2), nullable=False)
    subtotal = Column(Numeric(10, 2), nullable=False)

    order = relationship("Order", back_populates="items")
    product = relationship("Product", back_populates="order_items")


# --- Inventory Intelligence Models ---

class Ingredient(Base):
    __tablename__ = "ingredients"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False, unique=True)
    category = Column(String, nullable=False)  # e.g., Dairy, Grain, Vegetable, Beverage Base, Sweetener, Meat
    unit = Column(String, nullable=False)       # e.g., kg, liters, units
    unit_cost = Column(Numeric(10, 2), nullable=True)  # cost per unit for valuation
    is_active = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    recipe_items = relationship("RecipeItem", back_populates="ingredient")
    inventory_items = relationship("InventoryItem", back_populates="ingredient")


class RecipeItem(Base):
    """Bill of Materials: how much of each ingredient a product requires."""
    __tablename__ = "recipe_items"
    __table_args__ = (
        UniqueConstraint("product_id", "ingredient_id", name="uq_recipe_product_ingredient"),
    )

    id = Column(Integer, primary_key=True, index=True)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=False)
    ingredient_id = Column(Integer, ForeignKey("ingredients.id"), nullable=False)
    quantity_required = Column(Numeric(10, 4), nullable=False)  # amount per 1 unit of product
    unit = Column(String, nullable=False)

    product = relationship("Product", back_populates="recipe_items")
    ingredient = relationship("Ingredient", back_populates="recipe_items")


class InventoryItem(Base):
    """Per-outlet stock level for an ingredient."""
    __tablename__ = "inventory_items"
    __table_args__ = (
        UniqueConstraint("outlet_id", "ingredient_id", name="uq_inventory_outlet_ingredient"),
    )

    id = Column(Integer, primary_key=True, index=True)
    outlet_id = Column(Integer, ForeignKey("outlets.id"), nullable=False)
    ingredient_id = Column(Integer, ForeignKey("ingredients.id"), nullable=False)
    current_quantity = Column(Numeric(10, 4), nullable=False, default=0)
    reorder_level = Column(Numeric(10, 4), nullable=False, default=0)
    safety_stock = Column(Numeric(10, 4), nullable=False, default=0)
    supplier_lead_time_days = Column(Integer, nullable=False, default=3)
    last_purchase_at = Column(DateTime(timezone=True), nullable=True)
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    outlet = relationship("Outlet", back_populates="inventory_items")
    ingredient = relationship("Ingredient", back_populates="inventory_items")
    transactions = relationship("InventoryTransaction", back_populates="inventory_item")


class InventoryTransaction(Base):
    """Historical inventory movement record."""
    __tablename__ = "inventory_transactions"

    id = Column(Integer, primary_key=True, index=True)
    inventory_item_id = Column(Integer, ForeignKey("inventory_items.id"), nullable=False)
    transaction_type = Column(String, nullable=False)  # PURCHASE, CONSUMPTION, WASTAGE, ADJUSTMENT
    quantity = Column(Numeric(10, 4), nullable=False)
    reference = Column(String, nullable=True)  # e.g., "Daily consumption", "Weekly restock"
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False, index=True)

    inventory_item = relationship("InventoryItem", back_populates="transactions")


# --- Transaction type constants ---
TRANSACTION_PURCHASE = "PURCHASE"
TRANSACTION_CONSUMPTION = "CONSUMPTION"
TRANSACTION_WASTAGE = "WASTAGE"
TRANSACTION_ADJUSTMENT = "ADJUSTMENT"


# --- Staff Intelligence / Workforce Models ---

class Role(Base):
    __tablename__ = "roles"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False, unique=True)
    description = Column(String, nullable=True)

    employees = relationship("Employee", back_populates="role")

class Employee(Base):
    __tablename__ = "employees"

    id = Column(Integer, primary_key=True, index=True)
    employee_code = Column(String, nullable=False, unique=True, index=True)
    name = Column(String, nullable=False)
    role_id = Column(Integer, ForeignKey("roles.id"), nullable=False)
    outlet_id = Column(Integer, ForeignKey("outlets.id"), nullable=False)
    employment_status = Column(String, nullable=False, default="ACTIVE")
    hire_date = Column(DateTime(timezone=True), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    role = relationship("Role", back_populates="employees")
    outlet = relationship("Outlet", back_populates="employees")
    shifts = relationship("Shift", back_populates="employee")

class Shift(Base):
    __tablename__ = "shifts"

    id = Column(Integer, primary_key=True, index=True)
    employee_id = Column(Integer, ForeignKey("employees.id"), nullable=False)
    outlet_id = Column(Integer, ForeignKey("outlets.id"), nullable=False)
    shift_date = Column(DateTime(timezone=True), nullable=False, index=True)
    scheduled_start = Column(DateTime(timezone=True), nullable=False)
    scheduled_end = Column(DateTime(timezone=True), nullable=False)
    actual_start = Column(DateTime(timezone=True), nullable=True)
    actual_end = Column(DateTime(timezone=True), nullable=True)
    status = Column(String, nullable=False, default="SCHEDULED") # SCHEDULED, COMPLETED, ABSENT, CANCELLED
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    employee = relationship("Employee", back_populates="shifts")
    outlet = relationship("Outlet")
