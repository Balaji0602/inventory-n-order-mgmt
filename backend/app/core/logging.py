import json
import logging
import sys
import time
from typing import Any, Dict
from app.core.config import settings


class JSONFormatter(logging.Formatter):
    def format(self, record: logging.LogRecord) -> str:
        log_data: Dict[str, Any] = {
            "timestamp": self.formatTime(record, self.datefmt),
            "level": record.levelname,
            "logger": record.name,
            "message": record.getMessage(),
            "module": record.module,
            "filename": record.filename,
            "line_number": record.lineno,
        }

        # Include custom values injected via extra={}
        if hasattr(record, "request_id"):
            log_data["request_id"] = record.request_id
        if hasattr(record, "status_code"):
            log_data["status_code"] = record.status_code
        if hasattr(record, "execution_time_ms"):
            log_data["execution_time_ms"] = record.execution_time_ms

        if record.exc_info:
            log_data["exception"] = self.formatException(record.exc_info)

        return json.dumps(log_data)


def setup_logging():
    root_logger = logging.getLogger()
    
    # Clean previous handlers
    for handler in root_logger.handlers[:]:
        root_logger.removeHandler(handler)

    handler = logging.StreamHandler(sys.stdout)
    
    if settings.ENV == "development":
        # Human readable clean logs for development
        formatter = logging.Formatter(
            "[%(asctime)s] %(levelname)s in %(module)s (%(filename)s:%(lineno)d): %(message)s"
        )
    else:
        # JSON logs for production
        formatter = JSONFormatter()

    handler.setFormatter(formatter)
    root_logger.addHandler(handler)
    
    # Configure logging levels
    log_level = logging.DEBUG if settings.DEBUG else logging.INFO
    root_logger.setLevel(log_level)
    
    # Suppress verbose dependency logs slightly
    logging.getLogger("uvicorn.access").setLevel(logging.WARNING)
    logging.getLogger("sqlalchemy.engine").setLevel(logging.WARNING)
