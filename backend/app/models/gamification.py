import uuid
from datetime import datetime, timezone, date

from sqlalchemy import String, Text, SmallInteger, Integer, ForeignKey, Date, Boolean
from sqlalchemy.orm import Mapped, mapped_column

from app.models.base import Base


class Badge(Base):
    __tablename__ = "badges"

    id: Mapped[str] = mapped_column(
        String(36), primary_key=True, default=lambda: str(uuid.uuid4())
    )
    key: Mapped[str] = mapped_column(String(50), unique=True, nullable=False)
    name: Mapped[str] = mapped_column(String(100), nullable=False)
    description: Mapped[str] = mapped_column(String(255), nullable=False)
    icon: Mapped[str] = mapped_column(String(50), nullable=False)
    category: Mapped[str] = mapped_column(String(50), nullable=False)
    tier: Mapped[int] = mapped_column(SmallInteger, default=1, nullable=False)
    xp_reward: Mapped[int] = mapped_column(Integer, default=10, nullable=False)


class UserBadge(Base):
    __tablename__ = "user_badges"

    id: Mapped[str] = mapped_column(
        String(36), primary_key=True, default=lambda: str(uuid.uuid4())
    )
    user_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False
    )
    badge_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("badges.id", ondelete="CASCADE"), nullable=False
    )
    earned_at: Mapped[datetime] = mapped_column(
        default=lambda: datetime.now(timezone.utc)
    )


class UserStats(Base):
    __tablename__ = "user_stats"

    id: Mapped[str] = mapped_column(
        String(36), primary_key=True, default=lambda: str(uuid.uuid4())
    )
    user_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False
    )
    total_xp: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    level: Mapped[int] = mapped_column(SmallInteger, default=1, nullable=False)
    current_streak: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    longest_streak: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    total_logs: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    total_photos: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    perfect_weeks: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    days_on_target: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    updated_at: Mapped[datetime] = mapped_column(
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
    )


class WeeklyFeedback(Base):
    __tablename__ = "weekly_feedback"

    id: Mapped[str] = mapped_column(
        String(36), primary_key=True, default=lambda: str(uuid.uuid4())
    )
    user_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False
    )
    week_start: Mapped[date] = mapped_column(Date, nullable=False)
    week_end: Mapped[date] = mapped_column(Date, nullable=False)
    nutrition_score: Mapped[int] = mapped_column(SmallInteger, default=0, nullable=False)
    training_score: Mapped[int] = mapped_column(SmallInteger, default=0, nullable=False)
    overall_score: Mapped[int] = mapped_column(SmallInteger, default=0, nullable=False)
    nutrition_feedback: Mapped[str | None] = mapped_column(Text, nullable=True)
    training_feedback: Mapped[str | None] = mapped_column(Text, nullable=True)
    ai_suggestions: Mapped[str | None] = mapped_column(Text, nullable=True)
    highlights: Mapped[str | None] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        default=lambda: datetime.now(timezone.utc)
    )
