from datetime import datetime
from decimal import Decimal
from uuid import UUID
from pydantic import BaseModel, ConfigDict, Field
from app.schemas.product import ProductResponse


class OrderItemBase(BaseModel):
    product_id: UUID = Field(..., description="Unique product record identifier")
    quantity: int = Field(..., gt=0, description="Purchase count, must be >= 1")


class OrderItemCreate(OrderItemBase):
    pass


class OrderItemResponse(OrderItemBase):
    id: UUID
    order_id: UUID
    unit_price: Decimal = Field(..., ge=0.00, decimal_places=2, description="Price snapshot recorded at purchase")
    product: Optional[ProductResponse] = None

    model_config = ConfigDict(from_attributes=True)
