import logging
import time
import uuid
from fastapi import Request, Response
from starlette.middleware.base import BaseHTTPMiddleware, RequestResponseEndpoint

logger = logging.getLogger("app.middleware.logging")


class LoggingMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next: RequestResponseEndpoint) -> Response:
        start_time = time.time()
        
        # 1. Generate correlation request ID
        request_id = request.headers.get("X-Request-ID") or str(uuid.uuid4())
        request.state.request_id = request_id

        # Extrapolate client identity details
        client_host = request.client.host if request.client else "unknown"
        method = request.method
        path = request.url.path

        logger.info(
            f"Incoming Request: {method} {path} from {client_host}",
            extra={
                "request_id": request_id,
                "method": method,
                "path": path,
                "client_host": client_host
            }
        )

        try:
            # 2. Complete execution cascade
            response = await call_next(request)
        except Exception as e:
            # Logs standard trace error inside exception handler but lets middleware capture duration
            duration = int((time.time() - start_time) * 1000)
            logger.error(
                f"Request crashed: {method} {path} - Error: {str(e)}",
                extra={
                    "request_id": request_id,
                    "execution_time_ms": duration,
                    "status_code": 500
                }
            )
            raise e

        duration = int((time.time() - start_time) * 1000)
        status_code = response.status_code

        logger.info(
            f"Outgoing Response: {method} {path} - Status {status_code} in {duration}ms",
            extra={
                "request_id": request_id,
                "status_code": status_code,
                "execution_time_ms": duration
            }
        )

        # 3. Inject correlation header in response
        response.headers["X-Request-ID"] = request_id
        return response
