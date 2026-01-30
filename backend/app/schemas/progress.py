from typing import Optional
from pydantic import BaseModel


class WeeklySummaryResponse(BaseModel):
    period_start: str
    period_end: str
    avg_intake_kcal: Optional[float]
    avg_target_kcal: Optional[float]
    total_intake_kcal: Optional[float]
    days_on_target: int
    days_logged: int
    consistency_score: Optional[float]


class MonthlySummaryResponse(BaseModel):
    period_start: str
    period_end: str
    avg_intake_kcal: Optional[float]
    avg_target_kcal: Optional[float]
    total_intake_kcal: Optional[float]
    days_on_target: int
    days_logged: int
    consistency_score: Optional[float]


class StreakResponse(BaseModel):
    current_streak: int
    longest_streak: int


class ConsistencyResponse(BaseModel):
    score: float
    days_on_target: int
    total_days: int
    period: str
