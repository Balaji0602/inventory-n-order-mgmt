import logging
from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from app.exceptions.base import AppException

logger = logging.getLogger("app.exceptions")


def register_exception_handlers(app: FastAPI) -> None:
    @app.exception_handler(AppException)
    async def app_exception_handler(request: Request, exc: AppException) -> JSONResponse:
        logger.warning(
            f"Domain Exception: {exc.code} - {exc.message}",
            extra={"status_code": exc.status_code}
        )
        return JSONResponse(
            status_code=exc.status_code,
            content={
                "success": False,
                "error": {
                    "code": exc.code,
                    "message": exc.message,
                    "details": exc.details
                }
            }
        )

    @app.exception_handler(RequestValidationError)
    async def validation_exception_handler(request: Request, exc: RequestValidationError) -> JSONResponse:
        details = {}
        for error in exc.errors():
            # e.g., body -> items -> 0 -> quantity -> value_error.any_str.min_length
            loc = " -> ".join(str(x) for x in error.get("loc", []))
            details[loc] = error.get("msg", "Validation failed")

        logger.warning(
            f"Validation Error: {len(exc.errors())} violations",
            extra={"status_code": 422}
        )
        return JSONResponse(
            status_code=422,
            content={
                "success": False,
                "error": {
                    "code": "VALIDATION_ERROR",
                    "message": "Input validation failed.",
                    "details": details
                }
            }
        )

    @app.exception_handler(Exception)
    async def general_exception_handler(request: Request, exc: Exception) -> JSONResponse:
        logger.exception("Unhandled server crash detected")
        
        # Pull request ID if available from state
        request_id = getattr(request.state, "request_id", "N/A")
        
        return JSONResponse(
            status_code=500,
            content={
                "success": False,
                "error": {
                    "code": "INTERNAL_SERVER_ERROR",
                    "message": "An unexpected error occurred. Please contact support.",
                    "details": {"request_id": request_id} if request_id != "N/A" else {}
                }
            }
        )
