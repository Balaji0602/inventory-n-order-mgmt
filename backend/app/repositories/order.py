from typing import Optional
from uuid import UUID
from sqlalchemy.orm import Session, joinedload
from app.models.order import Order
from app.repositories.base import BaseRepository


class OrderRepository(BaseRepository[Order]):
    def __init__(self):
        super().__init__(Order)

    def get_order_with_relations(self, db: Session, id: UUID) -> Optional[Order]:
        """Fetch order details recursively pre-fetching customer and items to prevent N+1 queries."""
        return (
            db.query(self.model)
            .options(
                joinedload(Order.customer),
                joinedload(Order.items).joinedload(Order.items.property.mapper.class_.product)
            )
            .filter(self.model.id == id)
            .first()
        )


order_repository = OrderRepository()
