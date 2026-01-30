from typing import Optional, Literal
from pydantic import BaseModel, Field


class UserProfileCreate(BaseModel):
    age: int = Field(ge=13, le=120)
    gender: Literal["male", "female", "other"]
    height_cm: float = Field(gt=50, lt=300)
    weight_kg: float = Field(gt=20, lt=500)
    running_frequency: Literal["1-2", "3-4", "5-6", "7+"]
    training_intensity: Literal["easy", "moderate", "hard", "very_hard"]
    goal: Literal["deficit", "performance", "bulking"]


class UserProfileResponse(BaseModel):
    age: int
    gender: str
    height_cm: float
    weight_kg: float
    running_frequency: str
    training_intensity: str
    goal: str
    bmr: Optional[float] = None
    tdee: Optional[float] = None
    daily_target_kcal: Optional[float] = None

    class Config:
        from_attributes = True


class UserResponse(BaseModel):
    id: str
    email: str
    is_active: bool
    has_profile: bool
    profile: Optional[UserProfileResponse] = None

    class Config:
        from_attributes = True


class GoalUpdateRequest(BaseModel):
    goal: Literal["deficit", "performance", "bulking"]
