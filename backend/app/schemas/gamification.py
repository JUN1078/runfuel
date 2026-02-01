from datetime import datetime, date
from typing import Optional
from pydantic import BaseModel


class BadgeResponse(BaseModel):
    id: str
    key: str
    name: str
    description: str
    icon: str
    category: str
    tier: int
    xp_reward: int

    class Config:
        from_attributes = True


class UserBadgeResponse(BaseModel):
    badge: BadgeResponse
    earned_at: datetime


class UserStatsResponse(BaseModel):
    total_xp: int
    level: int
    xp_for_next_level: int
    xp_progress: float
    current_streak: int
    longest_streak: int
    total_logs: int
    total_photos: int
    perfect_weeks: int
    days_on_target: int


class DailyScoreResponse(BaseModel):
    date: date
    calorie_score: int
    logging_bonus: int
    streak_bonus: int
    total_score: int
    message: str
    encouragement: str


class WeeklyFeedbackResponse(BaseModel):
    id: str
    week_start: date
    week_end: date
    nutrition_score: int
    training_score: int
    overall_score: int
    nutrition_feedback: Optional[str]
    training_feedback: Optional[str]
    ai_suggestions: Optional[str]
    highlights: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True


class LeaderboardEntry(BaseModel):
    rank: int
    email_masked: str
    level: int
    total_xp: int
    current_streak: int
