from typing import Any, Dict, Optional


class AppException(Exception):
    """Base application exception for custom domain error handling."""
    def __init__(
        self,
        code: str,
        message: str,
        status_code: int = 400,
        details: Optional[Dict[str, Any]] = None
    ):
        self.code = code
        self.message = message
        self.status_code = status_code
        self.details = details or {}
        super().__init__(self.message)


class EntityNotFoundException(AppException):
    """Raised when a requested database entity is missing."""
    def __init__(self, message: str, details: Optional[Dict[str, Any]] = None):
        super().__init__(
            code="NOT_FOUND",
            message=message,
            status_code=404,
            details=details
        )


class DuplicateEntityException(AppException):
    """Raised when a unique constraint check is violated (e.g. SKU, Email)."""
    def __init__(self, message: str, details: Optional[Dict[str, Any]] = None):
        super().__init__(
            code="CONFLICT",
            message=message,
            status_code=409,
            details=details
        )


class InsufficientStockException(AppException):
    """Raised when stock quantity is lower than the requested order quantity."""
    def __init__(self, message: str, details: Optional[Dict[str, Any]] = None):
        super().__init__(
            code="INSUFFICIENT_STOCK",
            message=message,
            status_code=422,
            details=details
        )
