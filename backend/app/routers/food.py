from fastapi import APIRouter, Depends, UploadFile, File, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload
from sqlalchemy import select

from app.database import get_db
from app.dependencies import get_current_user
from app.models.user import User, UserProfile
from app.schemas.food import (
    AIAnalysisResponse,
    TextAnalyzeRequest,
    ConfirmAnalysisRequest,
    ManualFoodEntry,
    FoodEntryResponse,
)
from app.services import food_service, ai_service
from app.services import gamification_service

router = APIRouter()


@router.post("/analyze-photo", response_model=AIAnalysisResponse)
async def analyze_photo(
    photo: UploadFile = File(...),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    # Get user goal for context-aware analysis
    result = await db.execute(
        select(UserProfile).where(UserProfile.user_id == current_user.id)
    )
    profile = result.scalar_one_or_none()
    user_goal = profile.goal if profile else "performance"

    image_bytes = await photo.read()
    analysis = await ai_service.analyze_food_photo(image_bytes, user_goal)

    return AIAnalysisResponse(**analysis)


@router.post("/analyze-text", response_model=AIAnalysisResponse)
async def analyze_text(
    body: TextAnalyzeRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Analyze food from a text description using AI."""
    result = await db.execute(
        select(UserProfile).where(UserProfile.user_id == current_user.id)
    )
    profile = result.scalar_one_or_none()
    user_goal = profile.goal if profile else "performance"

    analysis = await ai_service.analyze_food_text(body.description, user_goal)
    return AIAnalysisResponse(**analysis)


@router.post("/confirm-analysis", response_model=list[FoodEntryResponse])
async def confirm_analysis(
    body: ConfirmAnalysisRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    entries = await food_service.confirm_ai_analysis(db, current_user.id, body)
    # Update gamification stats for each entry (photo-based)
    for _ in entries:
        await gamification_service.record_food_log(db, current_user.id, is_photo=True)
    await gamification_service.check_and_award_badges(db, current_user.id)
    return [FoodEntryResponse.model_validate(e) for e in entries]


@router.post("/manual", response_model=FoodEntryResponse)
async def manual_entry(
    body: ManualFoodEntry,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    entry = await food_service.add_manual_entry(db, current_user.id, body)
    # Update gamification stats (manual entry)
    await gamification_service.record_food_log(db, current_user.id, is_photo=False)
    await gamification_service.check_and_award_badges(db, current_user.id)
    return FoodEntryResponse.model_validate(entry)


@router.get("/search", response_model=list[FoodEntryResponse])
async def search_food(
    q: str = Query(min_length=1),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    entries = await food_service.search_foods(db, current_user.id, q)
    return [FoodEntryResponse.model_validate(e) for e in entries]


@router.get("/favorites", response_model=list[FoodEntryResponse])
async def get_favorites(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    entries = await food_service.get_favorites(db, current_user.id)
    return [FoodEntryResponse.model_validate(e) for e in entries]


@router.post("/favorites/{entry_id}", response_model=FoodEntryResponse)
async def toggle_favorite(
    entry_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    entry = await food_service.toggle_favorite(db, current_user.id, entry_id)
    return FoodEntryResponse.model_validate(entry)
