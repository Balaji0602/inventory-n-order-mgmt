from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import text
from app.core.database import get_db
import logging

router = APIRouter()
logger = logging.getLogger("app.api.health")


@router.get("", status_code=200)
def check_health(db: Session = Depends(get_db)):
    """
    Standard check evaluating API runtime status and active database connections.
    """
    try:
        # Run a simple query to assert DB health
        db.execute(text("SELECT 1")).fetchone()
        return {
            "status": "healthy",
            "database": "connected"
        }
    except Exception as e:
        logger.error(f"Health check failed to communicate with Database: {str(e)}")
        return {
            "status": "unhealthy",
            "database": "disconnected",
            "error": str(e)
        }
