from datetime import datetime
from typing import Optional, Literal
from pydantic import BaseModel, Field


class FoodItemAI(BaseModel):
    name: str
    portion: str
    calories: float
    protein_g: Optional[float] = None
    carbs_g: Optional[float] = None
    fat_g: Optional[float] = None
    fiber_g: Optional[float] = None
    confidence: float = Field(ge=0, le=1)


class AIAnalysisResponse(BaseModel):
    items: list[FoodItemAI]
    total_calories: float
    meal_notes: str = ""


class ConfirmAnalysisRequest(BaseModel):
    meal_type: Literal["breakfast", "lunch", "dinner", "snack"]
    items: list[FoodItemAI]
    photo_url: Optional[str] = None
    ai_raw_response: Optional[dict] = None


class ManualFoodEntry(BaseModel):
    meal_type: Literal["breakfast", "lunch", "dinner", "snack"]
    food_name: str = Field(min_length=1, max_length=255)
    portion_desc: Optional[str] = None
    calories: float = Field(ge=0)
    protein_g: Optional[float] = Field(default=None, ge=0)
    carbs_g: Optional[float] = Field(default=None, ge=0)
    fat_g: Optional[float] = Field(default=None, ge=0)
    fiber_g: Optional[float] = Field(default=None, ge=0)


class FoodEntryResponse(BaseModel):
    id: str
    meal_type: str
    source: str
    food_name: str
    portion_desc: Optional[str]
    calories: float
    protein_g: Optional[float]
    carbs_g: Optional[float]
    fat_g: Optional[float]
    fiber_g: Optional[float]
    photo_url: Optional[str]
    ai_confidence: Optional[float]
    is_favorite: bool
    created_at: datetime

    class Config:
        from_attributes = True


class FoodEntryUpdate(BaseModel):
    food_name: Optional[str] = None
    portion_desc: Optional[str] = None
    calories: Optional[float] = Field(default=None, ge=0)
    protein_g: Optional[float] = Field(default=None, ge=0)
    carbs_g: Optional[float] = Field(default=None, ge=0)
    fat_g: Optional[float] = Field(default=None, ge=0)
    fiber_g: Optional[float] = Field(default=None, ge=0)
