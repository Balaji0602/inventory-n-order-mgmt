from typing import List, Optional, Tuple
from uuid import UUID
from sqlalchemy.orm import Session
from app.exceptions.base import DuplicateEntityException, EntityNotFoundException, AppException
from app.models.customer import Customer
from app.repositories.customer import customer_repository
from app.schemas.customer import CustomerCreate, CustomerUpdate
from app.models.order import Order


class CustomerService:
    def get_customer(self, db: Session, id: UUID) -> Customer:
        customer = customer_repository.get(db, id)
        if not customer:
            raise EntityNotFoundException(f"Customer with ID '{id}' was not found.")
        return customer

    def list_customers(
        self,
        db: Session,
        *,
        skip: int = 0,
        limit: int = 10,
        search: Optional[str] = None,
        sort_by: Optional[str] = None,
        sort_dir: str = "desc"
    ) -> Tuple[List[Customer], int]:
        return customer_repository.get_multi(
            db,
            skip=skip,
            limit=limit,
            search=search,
            search_fields=["email", "first_name", "last_name", "phone"],
            sort_by=sort_by,
            sort_dir=sort_dir
        )

    def create_customer(self, db: Session, *, obj_in: CustomerCreate) -> Customer:
        # Check Email uniqueness
        existing = customer_repository.get_by_email(db, email=obj_in.email)
        if existing:
            raise DuplicateEntityException(
                f"A customer with email '{obj_in.email}' already exists.",
                details={"email": obj_in.email}
            )
        return customer_repository.create(db, obj_in=obj_in.model_dump())

    def update_customer(self, db: Session, id: UUID, *, obj_in: CustomerUpdate) -> Customer:
        customer = self.get_customer(db, id)
        
        # Check Email uniqueness if changing
        if obj_in.email is not None and obj_in.email != customer.email:
            existing = customer_repository.get_by_email(db, email=obj_in.email)
            if existing:
                raise DuplicateEntityException(
                    f"A customer with email '{obj_in.email}' already exists.",
                    details={"email": obj_in.email}
                )
                
        return customer_repository.update(db, db_obj=customer, obj_in=obj_in.model_dump(exclude_unset=True))

    def delete_customer(self, db: Session, id: UUID) -> Customer:
        customer = self.get_customer(db, id)
        customer_repository.delete(db, id=id)
        return customer


customer_service = CustomerService()
