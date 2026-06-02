from typing import List, Optional
from uuid import UUID
from fastapi import APIRouter, Depends, Query, Response, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.schemas.product import ProductCreate, ProductResponse, ProductUpdate
from app.services.product import product_service

router = APIRouter()


@router.post("", response_model=ProductResponse, status_code=status.HTTP_201_CREATED)
def create_product(product_in: ProductCreate, db: Session = Depends(get_db)):
    """Create a new product catalog listing."""
    return product_service.create_product(db, obj_in=product_in)


@router.get("")
def list_products(
    page: int = Query(1, ge=1, description="Active page pointer"),
    limit: int = Query(10, ge=1, le=100, description="Items limit per page"),
    search: Optional[str] = Query(None, description="Fuzzy search matching SKU or Name"),
    sort_by: Optional[str] = Query("created_at", description="Field target sorting catalog"),
    sort_dir: str = Query("desc", regex="^(asc|desc)$", description="Sorting direction directive"),
    db: Session = Depends(get_db)
):
    """Retrieve filtered, sorted, and paginated product items."""
    skip = (page - 1) * limit
    items, total = product_service.list_products(
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
            "items": [ProductResponse.model_validate(i) for i in items],
            "total": total,
            "page": page,
            "limit": limit,
            "pages": pages
        }
    }


@router.get("/{id}", response_model=ProductResponse)
def get_product(id: UUID, db: Session = Depends(get_db)):
    """Get single product detail properties."""
    return product_service.get_product(db, id=id)


@router.put("/{id}", response_model=ProductResponse)
def update_product(id: UUID, product_in: ProductUpdate, db: Session = Depends(get_db)):
    """Perform full or partial product catalog updates."""
    return product_service.update_product(db, id=id, obj_in=product_in)


@router.delete("/{id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_product(id: UUID, db: Session = Depends(get_db)):
    """Delete a product catalog item."""
    product_service.delete_product(db, id=id)
    return Response(status_code=status.HTTP_204_NO_CONTENT)
