import json
from fastapi import Request, Response
from starlette.middleware.base import BaseHTTPMiddleware, RequestResponseEndpoint
from starlette.datastructures import Headers


class ValidationMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next: RequestResponseEndpoint) -> Response:
        """
        Recursively trims whitespace from incoming JSON request payloads to ensure clean inputs.
        """
        # Validate only if payload contains JSON content
        content_type = request.headers.get("content-type", "")
        if "application/json" in content_type and request.method in ("POST", "PUT", "PATCH"):
            try:
                # Read original bytes
                body_bytes = await request.body()
                if body_bytes:
                    body_str = body_bytes.decode("utf-8")
                    data = json.loads(body_str)
                    
                    # Sanitize data
                    sanitized_data = self._trim_strings(data)
                    new_body_bytes = json.dumps(sanitized_data).encode("utf-8")

                    # Override request body stream
                    async def receive():
                        return {"type": "http.request", "body": new_body_bytes, "more_body": False}
                    
                    request._receive = receive
                    
                    # Recalculate content length header if set
                    headers = dict(request.scope["headers"])
                    # Find content-length header (stored as lowercase bytes in scope)
                    for key, val in headers.items():
                        if key == b"content-length":
                            headers[key] = str(len(new_body_bytes)).encode("ascii")
                            break
                    request.scope["headers"] = list(headers.items())

            except Exception:
                # Let Pydantic's validation handle raw JSON decode errors down the pipeline
                pass

        return await call_next(request)

    def _trim_strings(self, value):
        """Recursively parses structures and trims string fields."""
        if isinstance(value, str):
            return value.strip()
        elif isinstance(value, dict):
            return {k: self._trim_strings(v) for k, v in value.items()}
        elif isinstance(value, list):
            return [self._trim_strings(v) for v in value]
        return value
