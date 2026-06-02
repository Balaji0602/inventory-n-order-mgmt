from sqlalchemy import Column, String
from sqlalchemy.orm import relationship
from app.models.base import TimeStampedModel


class Customer(TimeStampedModel):
    __tablename__ = "customers"

    email = Column(String(255), unique=True, index=True, nullable=False)
    first_name = Column(String(100), nullable=False)
    last_name = Column(String(100), nullable=False)
    phone = Column(String(20), nullable=True)

    # Relationships
    orders = relationship("Order", back_populates="customer", cascade="all, delete-orphan")

    def __repr__(self) -> str:
        return f"<Customer email={self.email} name={self.first_name} {self.last_name}>"
