from typing import List, Optional
from uuid import UUID
from fastapi import APIRouter, Depends, Query, Response, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.schemas.order import OrderCreate, OrderResponse, OrderUpdate
from app.services.order import order_service

router = APIRouter()


@router.post("", response_model=OrderResponse, status_code=status.HTTP_201_CREATED)
def create_order(order_in: OrderCreate, db: Session = Depends(get_db)):
    """Place a new transaction order."""
    return order_service.create_order(db, obj_in=order_in)


@router.get("")
def list_orders(
    page: int = Query(1, ge=1, description="Active page pointer"),
    limit: int = Query(10, ge=1, le=100, description="Items limit per page"),
    search: Optional[str] = Query(None, description="Fuzzy search matching order status"),
    sort_by: Optional[str] = Query("created_at", description="Field target sorting order list"),
    sort_dir: str = Query("desc", pattern="^(asc|desc)$", description="Sorting direction directive"),
    db: Session = Depends(get_db)
):
    """Retrieve filtered, sorted, and paginated order listings."""
    skip = (page - 1) * limit
    items, total = order_service.list_orders(
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
            "items": [OrderResponse.model_validate(i) for i in items],
            "total": total,
            "page": page,
            "limit": limit,
            "pages": pages
        }
    }


@router.get("/{id}", response_model=OrderResponse)
def get_order(id: UUID, db: Session = Depends(get_db)):
    """Fetch granular details of an order invoice including items."""
    return order_service.get_order(db, id=id)


@router.put("/{id}", response_model=OrderResponse)
def update_order(id: UUID, order_in: OrderUpdate, db: Session = Depends(get_db)):
    """Update an order's status and sync inventory."""
    return order_service.update_order(db, id=id, obj_in=order_in)


@router.delete("/{id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_order(id: UUID, db: Session = Depends(get_db)):
    """Cancel and delete an order, restoring dynamic product inventory counts."""
    order_service.delete_order(db, id=id)
    return Response(status_code=status.HTTP_204_NO_CONTENT)
