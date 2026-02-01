import uuid
from datetime import datetime, timezone, date

from sqlalchemy import String, Text, SmallInteger, Integer, Numeric, ForeignKey, Date, Enum, JSON, Boolean
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base


class TrainingPlan(Base):
    __tablename__ = "training_plans"

    id: Mapped[str] = mapped_column(
        String(36), primary_key=True, default=lambda: str(uuid.uuid4())
    )
    user_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False
    )
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    race_id: Mapped[str | None] = mapped_column(
        String(36), ForeignKey("races.id", ondelete="SET NULL"), nullable=True
    )
    start_date: Mapped[date] = mapped_column(Date, nullable=False)
    end_date: Mapped[date] = mapped_column(Date, nullable=False)
    weeks: Mapped[int] = mapped_column(SmallInteger, nullable=False)
    source: Mapped[str] = mapped_column(
        Enum("manual", "ai_generated", name="plan_source_enum"), nullable=False
    )
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        default=lambda: datetime.now(timezone.utc)
    )

    sessions: Mapped[list["TrainingSession"]] = relationship(
        back_populates="plan", cascade="all, delete-orphan"
    )


class TrainingSession(Base):
    __tablename__ = "training_sessions"

    id: Mapped[str] = mapped_column(
        String(36), primary_key=True, default=lambda: str(uuid.uuid4())
    )
    plan_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("training_plans.id", ondelete="CASCADE"), nullable=False
    )
    user_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False
    )
    session_date: Mapped[date] = mapped_column(Date, nullable=False)
    week_number: Mapped[int] = mapped_column(SmallInteger, nullable=False)
    day_of_week: Mapped[str] = mapped_column(
        Enum("monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday",
             name="day_enum"),
        nullable=False,
    )
    time_of_day: Mapped[str] = mapped_column(
        Enum("morning", "evening", name="time_enum"), default="morning", nullable=False
    )
    session_type: Mapped[str] = mapped_column(
        Enum("easy_run", "tempo", "interval", "long_run", "recovery", "rest",
             "strength", "cross_training", "race", "trail",
             name="session_type_enum"),
        nullable=False,
    )
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    target_distance_km: Mapped[float | None] = mapped_column(Numeric(5, 1), nullable=True)
    actual_distance_km: Mapped[float | None] = mapped_column(Numeric(5, 1), nullable=True)
    target_duration_min: Mapped[int | None] = mapped_column(Integer, nullable=True)
    actual_duration_min: Mapped[int | None] = mapped_column(Integer, nullable=True)
    elevation_gain_m: Mapped[int | None] = mapped_column(Integer, nullable=True)
    completed: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        default=lambda: datetime.now(timezone.utc)
    )

    plan: Mapped["TrainingPlan"] = relationship(back_populates="sessions")


class Race(Base):
    __tablename__ = "races"

    id: Mapped[str] = mapped_column(
        String(36), primary_key=True, default=lambda: str(uuid.uuid4())
    )
    user_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False
    )
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    race_date: Mapped[date] = mapped_column(Date, nullable=False)
    category: Mapped[str | None] = mapped_column(
        Enum("5k", "10k", "half_marathon", "marathon", "ultra_50k", "ultra_100k",
             "trail", "other", name="race_category_enum"),
        nullable=True,
    )
    distance_km: Mapped[float | None] = mapped_column(Numeric(6, 1), nullable=True)
    elevation_gain_m: Mapped[int | None] = mapped_column(Integer, nullable=True)
    cutoff_time: Mapped[str | None] = mapped_column(String(50), nullable=True)
    mountain_level: Mapped[str | None] = mapped_column(String(50), nullable=True)
    start_time: Mapped[str | None] = mapped_column(String(20), nullable=True)
    race_type: Mapped[str | None] = mapped_column(String(50), nullable=True)
    target_time: Mapped[str | None] = mapped_column(String(50), nullable=True)
    actual_time: Mapped[str | None] = mapped_column(String(50), nullable=True)
    location: Mapped[str | None] = mapped_column(String(255), nullable=True)
    status: Mapped[str] = mapped_column(
        Enum("upcoming", "completed", "dns", "dnf", name="race_status_enum"),
        default="upcoming", nullable=False,
    )
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        default=lambda: datetime.now(timezone.utc)
    )
