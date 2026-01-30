from decimal import Decimal

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.core.exceptions import NotFoundError
from app.models.user import User, UserProfile
from app.schemas.user import UserProfileCreate
from app.utils.calorie_math import calculate_bmr, calculate_tdee, calculate_daily_target


async def get_user_with_profile(db: AsyncSession, user_id: str) -> User:
    result = await db.execute(
        select(User).options(selectinload(User.profile)).where(User.id == user_id)
    )
    user = result.scalar_one_or_none()
    if not user:
        raise NotFoundError("User not found")
    return user


async def create_or_update_profile(
    db: AsyncSession, user_id: str, data: UserProfileCreate
) -> UserProfile:
    result = await db.execute(
        select(UserProfile).where(UserProfile.user_id == user_id)
    )
    profile = result.scalar_one_or_none()

    # Calculate calorie targets
    bmr = calculate_bmr(data.gender, data.weight_kg, data.height_cm, data.age)
    tdee = calculate_tdee(bmr, data.running_frequency, data.training_intensity)
    daily_target = calculate_daily_target(tdee, data.goal, data.gender)

    if profile:
        profile.age = data.age
        profile.gender = data.gender
        profile.height_cm = data.height_cm
        profile.weight_kg = data.weight_kg
        profile.running_frequency = data.running_frequency
        profile.training_intensity = data.training_intensity
        profile.goal = data.goal
        profile.bmr = float(bmr)
        profile.tdee = float(tdee)
        profile.daily_target_kcal = float(daily_target)
    else:
        profile = UserProfile(
            user_id=user_id,
            age=data.age,
            gender=data.gender,
            height_cm=data.height_cm,
            weight_kg=data.weight_kg,
            running_frequency=data.running_frequency,
            training_intensity=data.training_intensity,
            goal=data.goal,
            bmr=float(bmr),
            tdee=float(tdee),
            daily_target_kcal=float(daily_target),
        )
        db.add(profile)

    await db.flush()
    return profile


async def update_goal(db: AsyncSession, user_id: str, goal: str) -> UserProfile:
    result = await db.execute(
        select(UserProfile).where(UserProfile.user_id == user_id)
    )
    profile = result.scalar_one_or_none()
    if not profile:
        raise NotFoundError("Profile not found. Complete onboarding first.")

    profile.goal = goal
    bmr = Decimal(str(profile.bmr))
    tdee = Decimal(str(profile.tdee))
    daily_target = calculate_daily_target(tdee, goal, profile.gender)
    profile.daily_target_kcal = float(daily_target)

    await db.flush()
    return profile


async def deactivate_user(db: AsyncSession, user_id: str) -> None:
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    if user:
        user.is_active = False
