from typing import List, Optional, Tuple
from uuid import UUID
from sqlalchemy.orm import Session
from app.exceptions.base import DuplicateEntityException, EntityNotFoundException, AppException
from app.models.product import Product
from app.repositories.product import product_repository
from app.schemas.product import ProductCreate, ProductUpdate
from app.models.order_item import OrderItem


class ProductService:
    def get_product(self, db: Session, id: UUID) -> Product:
        product = product_repository.get(db, id)
        if not product:
            raise EntityNotFoundException(f"Product with ID '{id}' was not found.")
        return product

    def list_products(
        self,
        db: Session,
        *,
        skip: int = 0,
        limit: int = 10,
        search: Optional[str] = None,
        sort_by: Optional[str] = None,
        sort_dir: str = "desc"
    ) -> Tuple[List[Product], int]:
        return product_repository.get_multi(
            db,
            skip=skip,
            limit=limit,
            search=search,
            search_fields=["sku", "name", "description"],
            sort_by=sort_by,
            sort_dir=sort_dir
        )

    def create_product(self, db: Session, *, obj_in: ProductCreate) -> Product:
        # Check SKU uniqueness
        existing = product_repository.get_by_sku(db, sku=obj_in.sku)
        if existing:
            raise DuplicateEntityException(
                f"A product with SKU '{obj_in.sku}' already exists.",
                details={"sku": obj_in.sku}
            )
        return product_repository.create(db, obj_in=obj_in.model_dump())

    def update_product(self, db: Session, id: UUID, *, obj_in: ProductUpdate) -> Product:
        product = self.get_product(db, id)
        
        # Check SKU uniqueness if changing
        if obj_in.sku is not None and obj_in.sku != product.sku:
            existing = product_repository.get_by_sku(db, sku=obj_in.sku)
            if existing:
                raise DuplicateEntityException(
                    f"A product with SKU '{obj_in.sku}' already exists.",
                    details={"sku": obj_in.sku}
                )
                
        return product_repository.update(db, db_obj=product, obj_in=obj_in.model_dump(exclude_unset=True))

    def delete_product(self, db: Session, id: UUID) -> Product:
        product = self.get_product(db, id)
        
        # Verify if referenced by any orders
        order_item_reference = db.query(OrderItem).filter(OrderItem.product_id == id).first()
        if order_item_reference:
            raise AppException(
                code="CONSTRAINT_VIOLATION",
                message=f"Product with SKU '{product.sku}' cannot be deleted because it is linked to existing transactions.",
                status_code=400
            )
            
        product_repository.delete(db, id=id)
        return product


product_service = ProductService()
