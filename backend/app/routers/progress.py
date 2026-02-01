from datetime import date
from typing import Optional

from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.dependencies import get_current_user
from app.models.user import User
from app.schemas.progress import (
    WeeklySummaryResponse,
    MonthlySummaryResponse,
    StreakResponse,
    ConsistencyResponse,
)
from app.services import progress_service

router = APIRouter()


@router.get("/weekly", response_model=WeeklySummaryResponse)
async def weekly_summary(
    date_ref: Optional[date] = Query(default=None, alias="date"),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    data = await progress_service.get_weekly_summary(db, current_user.id, date_ref)
    return WeeklySummaryResponse(**data)


@router.get("/monthly", response_model=MonthlySummaryResponse)
async def monthly_summary(
    month: int = Query(ge=1, le=12),
    year: int = Query(ge=2020),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    data = await progress_service.get_monthly_summary(db, current_user.id, year, month)
    return MonthlySummaryResponse(**data)


@router.get("/streak", response_model=StreakResponse)
async def get_streak(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    data = await progress_service.get_streak(db, current_user.id)
    return StreakResponse(**data)


@router.get("/consistency", response_model=ConsistencyResponse)
async def get_consistency(
    period: str = Query(default="30d"),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    days = int(period.replace("d", ""))
    data = await progress_service.get_consistency(db, current_user.id, days)
    return ConsistencyResponse(**data)
