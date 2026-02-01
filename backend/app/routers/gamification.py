from datetime import date
from typing import Optional

from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.dependencies import get_current_user
from app.models.user import User
from app.schemas.gamification import (
    UserStatsResponse,
    DailyScoreResponse,
    WeeklyFeedbackResponse,
)
from app.services import gamification_service

router = APIRouter()


@router.get("/stats", response_model=UserStatsResponse)
async def get_stats(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return await gamification_service.get_user_stats(db, current_user.id)


@router.get("/badges")
async def get_badges(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return await gamification_service.get_user_badges(db, current_user.id)


@router.get("/daily-score", response_model=DailyScoreResponse)
async def get_daily_score(
    log_date: Optional[date] = Query(default=None),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return await gamification_service.calculate_daily_score(db, current_user.id, log_date)


@router.post("/check-badges")
async def check_badges(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Manually trigger badge check. Returns newly earned badges."""
    return await gamification_service.check_and_award_badges(db, current_user.id)
