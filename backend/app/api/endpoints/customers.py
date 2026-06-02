from typing import List, Optional
from uuid import UUID
from fastapi import APIRouter, Depends, Query, Response, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.schemas.customer import CustomerCreate, CustomerResponse, CustomerUpdate
from app.services.customer import customer_service

router = APIRouter()


@router.post("", response_model=CustomerResponse, status_code=status.HTTP_201_CREATED)
def create_customer(customer_in: CustomerCreate, db: Session = Depends(get_db)):
    """Register a new customer profile record."""
    return customer_service.create_customer(db, obj_in=customer_in)


@router.get("")
def list_customers(
    page: int = Query(1, ge=1, description="Active page pointer"),
    limit: int = Query(10, ge=1, le=100, description="Items limit per page"),
    search: Optional[str] = Query(None, description="Fuzzy search matching email, names, or phone"),
    sort_by: Optional[str] = Query("created_at", description="Field target sorting catalog"),
    sort_dir: str = Query("desc", pattern="^(asc|desc)$", description="Sorting direction directive"),
    db: Session = Depends(get_db)
):
    """Retrieve filtered, sorted, and paginated customer records."""
    skip = (page - 1) * limit
    items, total = customer_service.list_customers(
        db,
        skip=skip,
        limit=limit,
        search=search,
        sort_by=sort_by,
        sort_dir=sort_dir
    )
    pages = (total + limit - 1) // limit
    
    return {
        "success": True,
        "data": {
            "items": [CustomerResponse.model_validate(i) for i in items],
            "total": total,
            "page": page,
            "limit": limit,
            "pages": pages
        }
    }


@router.get("/{id}", response_model=CustomerResponse)
def get_customer(id: UUID, db: Session = Depends(get_db)):
    """Fetch profile properties of a customer."""
    return customer_service.get_customer(db, id=id)


@router.put("/{id}", response_model=CustomerResponse)
def update_customer(id: UUID, customer_in: CustomerUpdate, db: Session = Depends(get_db)):
    """Update profile details of a customer."""
    return customer_service.update_customer(db, id=id, obj_in=customer_in)


@router.delete("/{id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_customer(id: UUID, db: Session = Depends(get_db)):
    """Remove a customer profile."""
    customer_service.delete_customer(db, id=id)
    return Response(status_code=status.HTTP_204_NO_CONTENT)
