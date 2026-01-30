from datetime import date, datetime, timezone

from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.core.exceptions import NotFoundError
from app.models.calorie_log import CalorieLog
from app.models.food_entry import FoodEntry
from app.models.user import UserProfile


async def get_or_create_daily_log(
    db: AsyncSession, user_id: str, log_date: date | None = None
) -> CalorieLog:
    """Get today's calorie log or create one from the user's profile target."""
    if log_date is None:
        log_date = date.today()

    result = await db.execute(
        select(CalorieLog)
        .options(selectinload(CalorieLog.entries))
        .where(CalorieLog.user_id == user_id, CalorieLog.log_date == log_date)
    )
    log = result.scalar_one_or_none()

    if log:
        return log

    # Get user profile for target
    profile_result = await db.execute(
        select(UserProfile).where(UserProfile.user_id == user_id)
    )
    profile = profile_result.scalar_one_or_none()
    if not profile:
        raise NotFoundError("Profile not found. Complete onboarding first.")

    log = CalorieLog(
        user_id=user_id,
        log_date=log_date,
        target_kcal=float(profile.daily_target_kcal or 2000),
        consumed_kcal=0,
    )
    db.add(log)
    await db.flush()
    # Load entries relationship (empty for new log)
    await db.refresh(log, ["entries"])
    return log


async def get_log_by_date(
    db: AsyncSession, user_id: str, log_date: date
) -> CalorieLog:
    result = await db.execute(
        select(CalorieLog)
        .options(selectinload(CalorieLog.entries))
        .where(CalorieLog.user_id == user_id, CalorieLog.log_date == log_date)
    )
    log = result.scalar_one_or_none()
    if not log:
        raise NotFoundError(f"No log found for {log_date}")
    return log


async def get_logs_in_range(
    db: AsyncSession, user_id: str, start: date, end: date
) -> list[CalorieLog]:
    result = await db.execute(
        select(CalorieLog)
        .where(
            CalorieLog.user_id == user_id,
            CalorieLog.log_date >= start,
            CalorieLog.log_date <= end,
        )
        .order_by(CalorieLog.log_date)
    )
    return list(result.scalars().all())


async def update_consumed_total(db: AsyncSession, calorie_log: CalorieLog) -> None:
    """Recalculate consumed_kcal from all food entries."""
    result = await db.execute(
        select(func.coalesce(func.sum(FoodEntry.calories), 0)).where(
            FoodEntry.calorie_log_id == calorie_log.id
        )
    )
    total = float(result.scalar())
    calorie_log.consumed_kcal = total

    # Update status
    target = float(calorie_log.target_kcal)
    ratio = total / target if target > 0 else 0

    if ratio > 1.0:
        calorie_log.status = "over"
    elif ratio >= 0.85:
        calorie_log.status = "near_limit"
    elif ratio < 0.5 and total > 0:
        calorie_log.status = "under"
    else:
        calorie_log.status = "normal"
