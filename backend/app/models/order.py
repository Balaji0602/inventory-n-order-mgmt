from sqlalchemy import CheckConstraint, Column, DateTime, ForeignKey, Numeric, String, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.models.base import TimeStampedModel


class Order(TimeStampedModel):
    __tablename__ = "orders"

    customer_id = Column(
        UUID(as_uuid=True),
        ForeignKey("customers.id", ondelete="RESTRICT"),
        nullable=False,
        index=True
    )
    
    order_date = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False
    )
    
    status = Column(
        String(50),
        server_default="PENDING",
        nullable=False
    )
    
    total_amount = Column(
        Numeric(12, 2),
        nullable=False
    )

    # Relationships
    customer = relationship("Customer", back_populates="orders")
    items = relationship("OrderItem", back_populates="order", cascade="all, delete-orphan")

    __table_args__ = (
        CheckConstraint("total_amount >= 0.00", name="chk_order_total_non_negative"),
        CheckConstraint(
            "status IN ('PENDING', 'PROCESSING', 'COMPLETED', 'CANCELLED')",
            name="chk_order_status_valid"
        ),
    )

    def __repr__(self) -> str:
        return f"<Order id={self.id} status={self.status} total={self.total_amount}>"
