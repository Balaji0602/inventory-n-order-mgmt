from datetime import datetime
from decimal import Decimal
from typing import List, Optional
from uuid import UUID
from pydantic import BaseModel, ConfigDict, Field
from app.schemas.customer import CustomerResponse
from app.schemas.order_item import OrderItemCreate, OrderItemResponse


class OrderCreate(BaseModel):
    customer_id: UUID = Field(..., description="Unique customer profile identifier")
    items: List[OrderItemCreate] = Field(..., min_items=1, description="List of purchase order items")


class OrderResponse(BaseModel):
    id: UUID
    customer_id: UUID
    order_date: datetime
    status: str
    total_amount: Decimal
    items: List[OrderItemResponse]
    customer: Optional[CustomerResponse] = None
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class OrderUpdate(BaseModel):
    status: str = Field(..., description="Target status update (PENDING, PROCESSING, COMPLETED, CANCELLED)")

