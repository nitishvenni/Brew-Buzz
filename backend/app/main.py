from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.api.routes import health, analytics, agents, inventory

app = FastAPI(title=settings.PROJECT_NAME)

# Set up CORS
origins = [origin.strip() for origin in settings.CORS_ORIGINS.split(",")]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health.router, tags=["health"])
app.include_router(analytics.router, prefix="/api/v1")
app.include_router(agents.router, prefix="/api/v1")
app.include_router(inventory.router, prefix="/api/v1")

