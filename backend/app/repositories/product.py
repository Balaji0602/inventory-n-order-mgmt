from typing import Optional
from uuid import UUID
from sqlalchemy.orm import Session
from app.models.product import Product
from app.repositories.base import BaseRepository


class ProductRepository(BaseRepository[Product]):
    def __init__(self):
        super().__init__(Product)

    def get_by_sku(self, db: Session, sku: str) -> Optional[Product]:
        """Fetch product matching exact SKU code."""
        return db.query(self.model).filter(self.model.sku == sku).first()

    def get_for_update(self, db: Session, id: UUID) -> Optional[Product]:
        """Fetch product and acquire pessimistic row lock (SELECT FOR UPDATE)."""
        return db.query(self.model).filter(self.model.id == id).with_for_update().first()


product_repository = ProductRepository()
