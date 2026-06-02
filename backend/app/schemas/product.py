from datetime import datetime
from decimal import Decimal
from typing import Optional
from uuid import UUID
from pydantic import BaseModel, ConfigDict, Field, field_validator


class ProductBase(BaseModel):
    sku: str = Field(..., min_length=3, max_length=100, description="Unique stock keeping unit code")
    name: str = Field(..., min_length=1, max_length=255, description="Product display name")
    description: Optional[str] = Field(None, description="Detailed product catalog description")
    price: Decimal = Field(..., ge=0.00, decimal_places=2, description="Unit cost, must be positive")
    stock_quantity: int = Field(..., ge=0, description="Available inventory count, must be >= 0")

    @field_validator("sku")
    @classmethod
    def clean_sku(cls, v: str) -> str:
        return v.strip().upper()


class ProductCreate(ProductBase):
    pass


class ProductUpdate(BaseModel):
    sku: Optional[str] = Field(None, min_length=3, max_length=100)
    name: Optional[str] = Field(None, min_length=1, max_length=255)
    description: Optional[str] = None
    price: Optional[Decimal] = Field(None, ge=0.00, decimal_places=2)
    stock_quantity: Optional[int] = Field(None, ge=0)

    @field_validator("sku")
    @classmethod
    def clean_sku(cls, v: Optional[str]) -> Optional[str]:
        if v is not None:
            return v.strip().upper()
        return v


class ProductResponse(ProductBase):
    id: UUID
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
