import logging
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.router import api_router
from app.core.config import settings
from app.core.logging import setup_logging
from app.exceptions.handlers import register_exception_handlers
from app.middleware.logging import LoggingMiddleware
from app.middleware.validation import ValidationMiddleware

# 1. Initialize structured system logging
setup_logging()
logger = logging.getLogger("app.main")

# 2. Instantiate FastAPI Application
app = FastAPI(
    title=settings.PROJECT_NAME,
    description="Production-Ready backend handling catalog, customer, and transactional order services.",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# 3. Add Custom Middlewares (Validation sanitization and Request metrics Logger)
app.add_middleware(ValidationMiddleware)
app.add_middleware(LoggingMiddleware)

# 4. Add standard CORS permissions
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 5. Register Custom exception translation layers
register_exception_handlers(app)

# 6. Map API routes
app.include_router(api_router, prefix=settings.API_V1_STR)


@app.on_event("startup")
def startup_event():
    logger.info(
        f"Booting system settings: Environment={settings.ENV} | Debug={settings.DEBUG}",
        extra={"env": settings.ENV}
    )
