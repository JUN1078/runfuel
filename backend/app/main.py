from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded

from app.config import get_settings
from app.core.rate_limiter import limiter
from app.routers import auth, users, food, calories, progress, gamification, training

settings = get_settings()


def create_app() -> FastAPI:
    app = FastAPI(
        title=settings.APP_NAME,
        docs_url="/api/docs",
        redoc_url="/api/redoc",
        openapi_url="/api/openapi.json",
    )

    # CORS
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origins,
        allow_credentials=True,
        allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
        allow_headers=["Authorization", "Content-Type"],
        max_age=600,
    )

    # Rate limiter
    app.state.limiter = limiter
    app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

    # Routers
    prefix = settings.API_V1_PREFIX
    app.include_router(auth.router, prefix=f"{prefix}/auth", tags=["auth"])
    app.include_router(users.router, prefix=f"{prefix}/users", tags=["users"])
    app.include_router(food.router, prefix=f"{prefix}/food", tags=["food"])
    app.include_router(calories.router, prefix=f"{prefix}/calories", tags=["calories"])
    app.include_router(progress.router, prefix=f"{prefix}/progress", tags=["progress"])
    app.include_router(gamification.router, prefix=f"{prefix}/gamification", tags=["gamification"])
    app.include_router(training.router, prefix=f"{prefix}/training", tags=["training"])

    @app.on_event("startup")
    async def startup_event():
        from app.database import AsyncSessionLocal
        from app.services.gamification_service import seed_badges
        async with AsyncSessionLocal() as db:
            await seed_badges(db)

    @app.get("/health")
    async def health():
        return {"status": "healthy", "app": settings.APP_NAME}

    return app


app = create_app()
