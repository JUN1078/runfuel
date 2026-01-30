from datetime import date

from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.dependencies import get_current_user
from app.models.user import User
from app.schemas.calorie import CalorieLogResponse, CalorieLogSummary
from app.schemas.food import FoodEntryResponse, FoodEntryUpdate
from app.schemas.auth import MessageResponse
from app.services import calorie_service, food_service

router = APIRouter()


@router.get("/today", response_model=CalorieLogResponse)
async def get_today(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    log = await calorie_service.get_or_create_daily_log(db, current_user.id)
    return CalorieLogResponse(
        id=log.id,
        log_date=log.log_date.isoformat(),
        target_kcal=float(log.target_kcal),
        consumed_kcal=float(log.consumed_kcal),
        remaining_kcal=log.remaining_kcal,
        status=log.status,
        entries=[FoodEntryResponse.model_validate(e) for e in log.entries],
    )


@router.get("/date/{log_date}", response_model=CalorieLogResponse)
async def get_by_date(
    log_date: date,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    log = await calorie_service.get_log_by_date(db, current_user.id, log_date)
    return CalorieLogResponse(
        id=log.id,
        log_date=log.log_date.isoformat(),
        target_kcal=float(log.target_kcal),
        consumed_kcal=float(log.consumed_kcal),
        remaining_kcal=log.remaining_kcal,
        status=log.status,
        entries=[FoodEntryResponse.model_validate(e) for e in log.entries],
    )


@router.get("/range", response_model=list[CalorieLogSummary])
async def get_range(
    start: date = Query(...),
    end: date = Query(...),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    logs = await calorie_service.get_logs_in_range(db, current_user.id, start, end)
    return [
        CalorieLogSummary(
            log_date=l.log_date.isoformat(),
            target_kcal=float(l.target_kcal),
            consumed_kcal=float(l.consumed_kcal),
            remaining_kcal=l.remaining_kcal,
            status=l.status,
        )
        for l in logs
    ]


@router.put("/entry/{entry_id}", response_model=FoodEntryResponse)
async def update_entry(
    entry_id: str,
    body: FoodEntryUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    entry = await food_service.update_food_entry(
        db, current_user.id, entry_id, body
    )
    return FoodEntryResponse.model_validate(entry)


@router.delete("/entry/{entry_id}", response_model=MessageResponse)
async def delete_entry(
    entry_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    await food_service.delete_food_entry(db, current_user.id, entry_id)
    return MessageResponse(message="Entry deleted")
