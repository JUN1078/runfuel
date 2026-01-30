import uuid
from datetime import datetime, timezone

from sqlalchemy import String, Boolean, Numeric, Enum, ForeignKey, Index, JSON
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base


class FoodEntry(Base):
    __tablename__ = "food_entries"

    id: Mapped[str] = mapped_column(
        String(36), primary_key=True, default=lambda: str(uuid.uuid4())
    )
    calorie_log_id: Mapped[str] = mapped_column(
        String(36),
        ForeignKey("calorie_logs.id", ondelete="CASCADE"),
        nullable=False,
    )
    user_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False
    )
    meal_type: Mapped[str] = mapped_column(
        Enum("breakfast", "lunch", "dinner", "snack", name="meal_type_enum"),
        nullable=False,
    )
    source: Mapped[str] = mapped_column(
        Enum("ai_photo", "manual", "search", "favorite", name="source_enum"),
        nullable=False,
    )
    food_name: Mapped[str] = mapped_column(String(255), nullable=False)
    portion_desc: Mapped[str] = mapped_column(String(255), nullable=True)
    calories: Mapped[float] = mapped_column(Numeric(7, 2), nullable=False)
    protein_g: Mapped[float] = mapped_column(Numeric(6, 2), nullable=True)
    carbs_g: Mapped[float] = mapped_column(Numeric(6, 2), nullable=True)
    fat_g: Mapped[float] = mapped_column(Numeric(6, 2), nullable=True)
    fiber_g: Mapped[float] = mapped_column(Numeric(6, 2), nullable=True)
    photo_url: Mapped[str] = mapped_column(String(512), nullable=True)
    ai_confidence: Mapped[float] = mapped_column(Numeric(3, 2), nullable=True)
    ai_raw_response: Mapped[dict] = mapped_column(JSON, nullable=True)
    is_favorite: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        default=lambda: datetime.now(timezone.utc)
    )

    calorie_log: Mapped["CalorieLog"] = relationship(back_populates="entries")

    __table_args__ = (
        Index("idx_food_entries_user", "user_id"),
        Index("idx_food_entries_log", "calorie_log_id"),
        Index("idx_food_entries_favorite", "user_id", "is_favorite"),
    )
