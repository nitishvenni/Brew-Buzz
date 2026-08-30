from pydantic import BaseModel, ConfigDict
from typing import List, Optional
from datetime import datetime
from decimal import Decimal

class FranchiseBase(BaseModel):
    name: str

class Franchise(FranchiseBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    model_config = ConfigDict(from_attributes=True)

class OutletBase(BaseModel):
    name: str
    city: str
    status: str

class Outlet(OutletBase):
    id: int
    franchise_id: int
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    model_config = ConfigDict(from_attributes=True)

class CategoryBase(BaseModel):
    name: str

class Category(CategoryBase):
    id: int
    created_at: datetime
    
    model_config = ConfigDict(from_attributes=True)

class ProductBase(BaseModel):
    name: str
    price: Decimal
    is_active: bool

class Product(ProductBase):
    id: int
    category_id: int
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    model_config = ConfigDict(from_attributes=True)

class OrderBase(BaseModel):
    status: str
    total_amount: Decimal
    order_timestamp: datetime

class Order(OrderBase):
    id: int
    outlet_id: int
    created_at: datetime
    
    model_config = ConfigDict(from_attributes=True)

class OrderItemBase(BaseModel):
    quantity: int
    unit_price: Decimal
    subtotal: Decimal

class OrderItem(OrderItemBase):
    id: int
    order_id: int
    product_id: int
    
    model_config = ConfigDict(from_attributes=True)
