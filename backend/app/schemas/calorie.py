from typing import Optional
from pydantic import BaseModel

from app.schemas.food import FoodEntryResponse


class CalorieLogResponse(BaseModel):
    id: str
    log_date: str
    target_kcal: float
    consumed_kcal: float
    remaining_kcal: float
    status: str
    entries: list[FoodEntryResponse] = []

    class Config:
        from_attributes = True


class CalorieLogSummary(BaseModel):
    log_date: str
    target_kcal: float
    consumed_kcal: float
    remaining_kcal: float
    status: str

    class Config:
        from_attributes = True
