import uuid
from sqlalchemy import Boolean, Column, DateTime, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import declared_attr
from app.core.database import Base


class TimeStampedModel(Base):
    __abstract__ = True

    id = Column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
        index=True
    )
    
    is_active = Column(
        Boolean,
        server_default="true",
        default=True,
        nullable=False
    )
    
    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False
    )
    
    updated_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False
    )

    # Automatically generate __tablename__ based on class name
    @declared_attr
    def __tablename__(cls) -> str:
        return cls.__name__.lower() + "s"
