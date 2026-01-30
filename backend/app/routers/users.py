from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.dependencies import get_current_user
from app.models.user import User
from app.schemas.user import (
    UserResponse,
    UserProfileCreate,
    UserProfileResponse,
    GoalUpdateRequest,
)
from app.schemas.auth import MessageResponse
from app.services import user_service

router = APIRouter()


@router.get("/me", response_model=UserResponse)
async def get_me(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    user = await user_service.get_user_with_profile(db, current_user.id)
    return UserResponse(
        id=user.id,
        email=user.email,
        is_active=user.is_active,
        has_profile=user.profile is not None,
        profile=(
            UserProfileResponse.model_validate(user.profile)
            if user.profile
            else None
        ),
    )


@router.put("/me/profile", response_model=UserProfileResponse)
async def update_profile(
    body: UserProfileCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    profile = await user_service.create_or_update_profile(
        db, current_user.id, body
    )
    return UserProfileResponse.model_validate(profile)


@router.patch("/me/goal", response_model=UserProfileResponse)
async def change_goal(
    body: GoalUpdateRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    profile = await user_service.update_goal(db, current_user.id, body.goal)
    return UserProfileResponse.model_validate(profile)


@router.delete("/me", response_model=MessageResponse)
async def deactivate_account(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    await user_service.deactivate_user(db, current_user.id)
    return MessageResponse(message="Account deactivated")
