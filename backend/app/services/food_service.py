from datetime import date

from sqlalchemy import select, update
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exceptions import NotFoundError
from app.models.food_entry import FoodEntry
from app.models.calorie_log import CalorieLog
from app.schemas.food import ManualFoodEntry, FoodEntryUpdate, ConfirmAnalysisRequest
from app.services.calorie_service import get_or_create_daily_log, update_consumed_total


async def add_manual_entry(
    db: AsyncSession, user_id: str, data: ManualFoodEntry
) -> FoodEntry:
    log = await get_or_create_daily_log(db, user_id)

    entry = FoodEntry(
        calorie_log_id=log.id,
        user_id=user_id,
        meal_type=data.meal_type,
        source="manual",
        food_name=data.food_name,
        portion_desc=data.portion_desc,
        calories=data.calories,
        protein_g=data.protein_g,
        carbs_g=data.carbs_g,
        fat_g=data.fat_g,
        fiber_g=data.fiber_g,
    )
    db.add(entry)
    await db.flush()

    await update_consumed_total(db, log)
    return entry


async def confirm_ai_analysis(
    db: AsyncSession, user_id: str, data: ConfirmAnalysisRequest
) -> list[FoodEntry]:
    log = await get_or_create_daily_log(db, user_id)
    entries = []

    for item in data.items:
        entry = FoodEntry(
            calorie_log_id=log.id,
            user_id=user_id,
            meal_type=data.meal_type,
            source="ai_photo",
            food_name=item.name,
            portion_desc=item.portion,
            calories=item.calories,
            protein_g=item.protein_g,
            carbs_g=item.carbs_g,
            fat_g=item.fat_g,
            fiber_g=item.fiber_g,
            ai_confidence=item.confidence,
            photo_url=data.photo_url,
            ai_raw_response=data.ai_raw_response,
        )
        db.add(entry)
        entries.append(entry)

    await db.flush()
    await update_consumed_total(db, log)
    return entries


async def update_food_entry(
    db: AsyncSession, user_id: str, entry_id: str, data: FoodEntryUpdate
) -> FoodEntry:
    result = await db.execute(
        select(FoodEntry).where(
            FoodEntry.id == entry_id, FoodEntry.user_id == user_id
        )
    )
    entry = result.scalar_one_or_none()
    if not entry:
        raise NotFoundError("Food entry not found")

    update_data = data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(entry, field, value)

    await db.flush()

    # Recalculate log total
    log_result = await db.execute(
        select(CalorieLog).where(CalorieLog.id == entry.calorie_log_id)
    )
    log = log_result.scalar_one()
    await update_consumed_total(db, log)

    return entry


async def delete_food_entry(
    db: AsyncSession, user_id: str, entry_id: str
) -> None:
    result = await db.execute(
        select(FoodEntry).where(
            FoodEntry.id == entry_id, FoodEntry.user_id == user_id
        )
    )
    entry = result.scalar_one_or_none()
    if not entry:
        raise NotFoundError("Food entry not found")

    calorie_log_id = entry.calorie_log_id
    await db.delete(entry)
    await db.flush()

    # Recalculate log total
    log_result = await db.execute(
        select(CalorieLog).where(CalorieLog.id == calorie_log_id)
    )
    log = log_result.scalar_one()
    await update_consumed_total(db, log)


async def get_favorites(db: AsyncSession, user_id: str) -> list[FoodEntry]:
    result = await db.execute(
        select(FoodEntry)
        .where(FoodEntry.user_id == user_id, FoodEntry.is_favorite == True)
        .order_by(FoodEntry.created_at.desc())
    )
    return list(result.scalars().all())


async def toggle_favorite(
    db: AsyncSession, user_id: str, entry_id: str
) -> FoodEntry:
    result = await db.execute(
        select(FoodEntry).where(
            FoodEntry.id == entry_id, FoodEntry.user_id == user_id
        )
    )
    entry = result.scalar_one_or_none()
    if not entry:
        raise NotFoundError("Food entry not found")

    entry.is_favorite = not entry.is_favorite
    await db.flush()
    return entry


async def search_foods(
    db: AsyncSession, user_id: str, query: str
) -> list[FoodEntry]:
    """Search user's past food entries by name."""
    result = await db.execute(
        select(FoodEntry)
        .where(
            FoodEntry.user_id == user_id,
            FoodEntry.food_name.ilike(f"%{query}%"),
        )
        .order_by(FoodEntry.created_at.desc())
        .limit(20)
    )
    return list(result.scalars().all())
