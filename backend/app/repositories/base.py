from typing import Any, Dict, Generic, List, Optional, Tuple, Type, TypeVar, Union
from uuid import UUID
from sqlalchemy import or_, desc, asc
from sqlalchemy.orm import Session
from app.core.database import Base

ModelType = TypeVar("ModelType", bound=Base)


class BaseRepository(Generic[ModelType]):
    def __init__(self, model: Type[ModelType]):
        """
        Generic repository base covering standard CRUD workflows.
        """
        self.model = model

    def get(self, db: Session, id: UUID) -> Optional[ModelType]:
        return db.query(self.model).filter(self.model.id == id).first()

    def get_multi(
        self,
        db: Session,
        *,
        skip: int = 0,
        limit: int = 10,
        search: Optional[str] = None,
        search_fields: Optional[List[str]] = None,
        sort_by: Optional[str] = None,
        sort_dir: str = "desc"
    ) -> Tuple[List[ModelType], int]:
        """
        Retrieves multiple records with support for dynamic sorting, fuzzy searches, and pagination.
        Returns a tuple: (list of items, total count matching the query).
        """
        query = db.query(self.model)

        # Filter by active records only if is_active column exists
        if hasattr(self.model, "is_active"):
            query = query.filter(self.model.is_active == True)

        # 1. Apply search filters (fuzzy matching)
        if search and search_fields:
            search_filters = []
            for field in search_fields:
                if hasattr(self.model, field):
                    attr = getattr(self.model, field)
                    search_filters.append(attr.ilike(f"%{search}%"))
            if search_filters:
                query = query.filter(or_(*search_filters))

        # Capture total count after filters are applied
        total_count = query.count()

        # 2. Apply sorting
        if sort_by and hasattr(self.model, sort_by):
            sort_attr = getattr(self.model, sort_by)
            order_func = desc if sort_dir.lower() == "desc" else asc
            query = query.order_by(order_func(sort_attr))
        else:
            # Default sorting by created_at if present, else by primary key id
            if hasattr(self.model, "created_at"):
                query = query.order_by(desc(getattr(self.model, "created_at")))
            else:
                query = query.order_by(desc(self.model.id))

        # 3. Apply pagination
        items = query.offset(skip).limit(limit).all()

        return items, total_count

    def create(self, db: Session, *, obj_in: Any) -> ModelType:
        db_obj = self.model(**obj_in)
        db.add(db_obj)
        db.commit()  # Persist changes to database
        db.refresh(db_obj)  # Retrieve generated fields (ID, Timestamps)
        return db_obj

    def update(
        self,
        db: Session,
        *,
        db_obj: ModelType,
        obj_in: Union[Dict[str, Any], Any]
    ) -> ModelType:
        obj_data = db_obj.__dict__
        if isinstance(obj_in, dict):
            update_data = obj_in
        else:
            update_data = obj_in.dict(exclude_unset=True)
            
        for field in obj_data:
            if field in update_data:
                setattr(db_obj, field, update_data[field])
                
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj

    def delete(self, db: Session, *, id: UUID) -> Optional[ModelType]:
        obj = db.query(self.model).filter(self.model.id == id).first()
        if obj:
            if hasattr(obj, "is_active"):
                obj.is_active = False
                db.add(obj)
            else:
                db.delete(obj)
            db.commit()
        return obj
