from decimal import Decimal
from typing import List, Optional, Tuple
from uuid import UUID
import logging
from sqlalchemy.orm import Session
from app.exceptions.base import EntityNotFoundException, InsufficientStockException, AppException
from app.models.order import Order
from app.models.order_item import OrderItem
from app.repositories.order import order_repository
from app.repositories.product import product_repository
from app.services.customer import customer_service
from app.schemas.order import OrderCreate

logger = logging.getLogger("app.services.order")


class OrderService:
    def get_order(self, db: Session, id: UUID) -> Order:
        order = order_repository.get_order_with_relations(db, id)
        if not order:
            raise EntityNotFoundException(f"Order with ID '{id}' was not found.")
        return order

    def list_orders(
        self,
        db: Session,
        *,
        skip: int = 0,
        limit: int = 10,
        search: Optional[str] = None,
        sort_by: Optional[str] = None,
        sort_dir: str = "desc"
    ) -> Tuple[List[Order], int]:
        # Custom search fields linking customer details or order status
        return order_repository.get_multi(
            db,
            skip=skip,
            limit=limit,
            search=search,
            search_fields=["status"],  # Can expand filters in Repository layer
            sort_by=sort_by,
            sort_dir=sort_dir
        )

    def create_order(self, db: Session, *, obj_in: OrderCreate) -> Order:
        """
        Creates an order inside a strict database transaction.
        Acquires pessimistic locks on product rows to avoid overselling.
        Rolls back the entire transaction if inventory checks fail or errors occur.
        """
        # 1. Validate customer existence
        customer_service.get_customer(db, obj_in.customer_id)

        # 2. Consolidate product IDs in request (in case of duplicate lines)
        consolidated_items = {}
        for item in obj_in.items:
            consolidated_items[item.product_id] = consolidated_items.get(item.product_id, 0) + item.quantity

        try:
            # 3. Create core order record first
            order = Order(
                customer_id=obj_in.customer_id,
                total_amount=Decimal("0.00"),
                status="PENDING"
            )
            db.add(order)
            db.flush()  # Flushes order to DB to generate order.id

            total_amount = Decimal("0.00")
            order_items = []

            # 4. Iterate consolidated items and lock rows pessimistic-style
            for product_id, quantity in consolidated_items.items():
                # Acquire pessimistic lock
                product = product_repository.get_for_update(db, id=product_id)
                if not product:
                    raise EntityNotFoundException(f"Product with ID '{product_id}' was not found.")

                # Validate stock availability
                if product.stock_quantity < quantity:
                    raise InsufficientStockException(
                        f"Stock quantity for SKU '{product.sku}' ({product.stock_quantity} remaining) "
                        f"is insufficient for requested quantity ({quantity}).",
                        details={
                            "product_id": str(product.id),
                            "sku": product.sku,
                            "available": product.stock_quantity,
                            "requested": quantity
                        }
                    )

                # Deduct stock
                product.stock_quantity -= quantity
                db.add(product)

                # Calculate line subtotal
                unit_price = product.price
                total_amount += unit_price * quantity

                # Create OrderItem entity
                order_item = OrderItem(
                    order_id=order.id,
                    product_id=product.id,
                    quantity=quantity,
                    unit_price=unit_price
                )
                db.add(order_item)
                order_items.append(order_item)

            # 5. Save order totals
            order.total_amount = total_amount
            db.add(order)
            db.flush()

            # Commit the session transaction
            db.commit()
            
            # Fetch complete loaded relationship properties
            return self.get_order(db, order.id)

        except Exception as e:
            # Absolute transaction safe rollback on any failure
            db.rollback()
            logger.error(f"Transaction aborted during Order placement: {str(e)}")
            raise e

    def delete_order(self, db: Session, id: UUID) -> Order:
        """
        Deletes/cancels an order. Restores inventory levels before removing details.
        Runs inside transaction bounds.
        """
        order = self.get_order(db, id)

        try:
            # If order was not cancelled, restore target inventory levels
            if order.status != "CANCELLED":
                for item in order.items:
                    # Lock product record
                    product = product_repository.get_for_update(db, id=item.product_id)
                    if product:
                        product.stock_quantity += item.quantity
                        db.add(product)

            # Perform order deletion (cascades delete order_items dynamically)
            db.delete(order)
            db.commit()
            return order

        except Exception as e:
            db.rollback()
            logger.error(f"Transaction aborted during Order deletion (ID: {id}): {str(e)}")
            raise e


order_service = OrderService()
