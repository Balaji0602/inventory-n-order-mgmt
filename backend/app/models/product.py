from sqlalchemy import CheckConstraint, Column, Numeric, Integer, String, Text
from sqlalchemy.orm import relationship
from app.models.base import TimeStampedModel


class Product(TimeStampedModel):
    __tablename__ = "products"

    sku = Column(String(100), unique=True, index=True, nullable=False)
    name = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    price = Column(Numeric(12, 2), nullable=False)
    stock_quantity = Column(Integer, nullable=False)

    # Relationships
    order_items = relationship("OrderItem", back_populates="product")

    __table_args__ = (
        CheckConstraint("price >= 0.00", name="chk_product_price_non_negative"),
        CheckConstraint("stock_quantity >= 0", name="chk_product_stock_non_negative"),
    )

    def __repr__(self) -> str:
        return f"<Product sku={self.sku} name={self.name} stock={self.stock_quantity}>"
