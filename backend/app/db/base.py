# Import all the models so that Base has them before Alembic imports env.py
from app.core.database import Base  # noqa
from app.models.base import TimeStampedModel  # noqa
from app.models.customer import Customer  # noqa
from app.models.product import Product  # noqa
from app.models.order import Order  # noqa
from app.models.order_item import OrderItem  # noqa
