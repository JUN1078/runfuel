import uuid
from datetime import datetime, timezone

from sqlalchemy import String, Boolean, SmallInteger, Enum, Numeric, ForeignKey, Index
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base


class User(Base):
    __tablename__ = "users"

    id: Mapped[str] = mapped_column(
        String(36), primary_key=True, default=lambda: str(uuid.uuid4())
    )
    email: Mapped[str] = mapped_column(String(255), unique=True, nullable=False)
    password_hash: Mapped[str] = mapped_column(String(255), nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    is_verified: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        default=lambda: datetime.now(timezone.utc)
    )
    updated_at: Mapped[datetime] = mapped_column(
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
    )

    profile: Mapped["UserProfile"] = relationship(
        back_populates="user", uselist=False, cascade="all, delete-orphan"
    )

    __table_args__ = (Index("idx_users_email", "email"),)


class UserProfile(Base):
    __tablename__ = "user_profiles"

    id: Mapped[str] = mapped_column(
        String(36), primary_key=True, default=lambda: str(uuid.uuid4())
    )
    user_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False
    )
    age: Mapped[int] = mapped_column(SmallInteger, nullable=False)
    gender: Mapped[str] = mapped_column(
        Enum("male", "female", "other", name="gender_enum"), nullable=False
    )
    height_cm: Mapped[float] = mapped_column(Numeric(5, 1), nullable=False)
    weight_kg: Mapped[float] = mapped_column(Numeric(5, 1), nullable=False)
    running_frequency: Mapped[str] = mapped_column(
        Enum("1-2", "3-4", "5-6", "7+", name="frequency_enum"), nullable=False
    )
    training_intensity: Mapped[str] = mapped_column(
        Enum("easy", "moderate", "hard", "very_hard", name="intensity_enum"),
        nullable=False,
    )
    goal: Mapped[str] = mapped_column(
        Enum("deficit", "performance", "bulking", name="goal_enum"), nullable=False
    )
    bmr: Mapped[float] = mapped_column(Numeric(7, 2), nullable=True)
    tdee: Mapped[float] = mapped_column(Numeric(7, 2), nullable=True)
    daily_target_kcal: Mapped[float] = mapped_column(Numeric(7, 2), nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        default=lambda: datetime.now(timezone.utc)
    )
    updated_at: Mapped[datetime] = mapped_column(
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
    )

    user: Mapped["User"] = relationship(back_populates="profile")
