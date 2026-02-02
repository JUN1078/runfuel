from datetime import date, datetime
from typing import Optional, Literal
from pydantic import BaseModel, Field


# --- Training Plan ---
class TrainingSessionCreate(BaseModel):
    session_date: date
    week_number: int = Field(ge=1)
    day_of_week: Literal["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"]
    time_of_day: Literal["morning", "evening"] = "morning"
    session_type: Literal[
        "easy_run", "tempo", "interval", "long_run", "recovery", "rest",
        "strength", "cross_training", "race", "trail"
    ]
    description: Optional[str] = None
    target_distance_km: Optional[float] = None
    target_duration_min: Optional[int] = None
    elevation_gain_m: Optional[int] = None


class TrainingSessionUpdate(BaseModel):
    actual_distance_km: Optional[float] = None
    actual_duration_min: Optional[int] = None
    completed: Optional[bool] = None
    notes: Optional[str] = None


class TrainingSessionResponse(BaseModel):
    id: str
    session_date: date
    week_number: int
    day_of_week: str
    time_of_day: str
    session_type: str
    description: Optional[str]
    target_distance_km: Optional[float]
    actual_distance_km: Optional[float]
    target_duration_min: Optional[int]
    actual_duration_min: Optional[int]
    elevation_gain_m: Optional[int]
    completed: bool
    notes: Optional[str]

    class Config:
        from_attributes = True


class TrainingPlanCreate(BaseModel):
    name: str = Field(min_length=1, max_length=255)
    race_id: Optional[str] = None
    start_date: date
    end_date: date
    sessions: list[TrainingSessionCreate] = []


class TrainingPlanResponse(BaseModel):
    id: str
    name: str
    race_id: Optional[str]
    start_date: date
    end_date: date
    weeks: int
    source: str
    is_active: bool
    sessions: list[TrainingSessionResponse] = []
    created_at: datetime

    class Config:
        from_attributes = True


class GeneratePlanRequest(BaseModel):
    race_id: Optional[str] = None
    race_name: Optional[str] = None
    race_date: Optional[date] = None
    race_distance_km: Optional[float] = None
    target_time: Optional[str] = None
    weeks: int = Field(ge=4, le=24, default=12)
    current_weekly_km: Optional[float] = None
    elevation_gain: Optional[int] = None
    best_5k: Optional[str] = None
    best_10k: Optional[str] = None
    best_half: Optional[str] = None
    best_marathon: Optional[str] = None
    avg_long_run: Optional[float] = None


# --- Race ---
class RaceCreate(BaseModel):
    name: str = Field(min_length=1, max_length=255)
    race_date: date
    category: Optional[Literal[
        "5k", "10k", "half_marathon", "marathon", "ultra_50k", "ultra_100k", "trail", "other"
    ]] = None
    distance_km: Optional[float] = None
    elevation_gain_m: Optional[int] = None
    cutoff_time: Optional[str] = None
    mountain_level: Optional[str] = None
    start_time: Optional[str] = None
    race_type: Optional[str] = None
    target_time: Optional[str] = None
    location: Optional[str] = None


class RaceUpdate(BaseModel):
    name: Optional[str] = None
    race_date: Optional[date] = None
    category: Optional[str] = None
    distance_km: Optional[float] = None
    elevation_gain_m: Optional[int] = None
    cutoff_time: Optional[str] = None
    mountain_level: Optional[str] = None
    start_time: Optional[str] = None
    race_type: Optional[str] = None
    target_time: Optional[str] = None
    actual_time: Optional[str] = None
    location: Optional[str] = None
    status: Optional[Literal["upcoming", "completed", "dns", "dnf"]] = None
    notes: Optional[str] = None


class RaceResponse(BaseModel):
    id: str
    name: str
    race_date: date
    category: Optional[str]
    distance_km: Optional[float]
    elevation_gain_m: Optional[int]
    cutoff_time: Optional[str]
    mountain_level: Optional[str]
    start_time: Optional[str]
    race_type: Optional[str]
    target_time: Optional[str]
    actual_time: Optional[str]
    location: Optional[str]
    status: str
    notes: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True
