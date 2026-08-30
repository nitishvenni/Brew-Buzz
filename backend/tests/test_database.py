import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.core.database import Base
from app.models.domain import Franchise, Outlet, Category, Product, Order, OrderItem

# Use an in-memory SQLite for tests
SQLALCHEMY_DATABASE_URL = "sqlite:///:memory:"

engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

@pytest.fixture()
def db():
    Base.metadata.create_all(bind=engine)
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()
        Base.metadata.drop_all(bind=engine)

def test_franchise_outlet_relationship(db):
    franchise = Franchise(name="Test Franchise")
    db.add(franchise)
    db.commit()

    outlet = Outlet(franchise_id=franchise.id, name="Test Outlet", city="Test City")
    db.add(outlet)
    db.commit()

    assert outlet.franchise.name == "Test Franchise"
    assert len(franchise.outlets) == 1

def test_product_category_relationship(db):
    category = Category(name="Test Category")
    db.add(category)
    db.commit()

    product = Product(category_id=category.id, name="Test Product", price=10.50)
    db.add(product)
    db.commit()

    assert product.category.name == "Test Category"
    assert len(category.products) == 1

def test_order_items_relationship(db):
    # Setup dependencies
    franchise = Franchise(name="Test Franchise")
    db.add(franchise)
    db.commit()
    
    outlet = Outlet(franchise_id=franchise.id, name="Test Outlet", city="Test City")
    db.add(outlet)
    
    category = Category(name="Test Category")
    db.add(category)
    db.commit()
    
    product = Product(category_id=category.id, name="Test Product", price=10.50)
    db.add(product)
    db.commit()
    
    # Create order
    order = Order(outlet_id=outlet.id, total_amount=21.00)
    db.add(order)
    db.commit()
    
    # Create order item
    item = OrderItem(order_id=order.id, product_id=product.id, quantity=2, unit_price=10.50, subtotal=21.00)
    db.add(item)
    db.commit()
    
    assert item.order.id == order.id
    assert item.product.name == "Test Product"
    assert len(order.items) == 1
    assert order.items[0].quantity == 2
