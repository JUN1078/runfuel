import uuid
from datetime import datetime, date, timezone

from sqlalchemy import String, Date, Numeric, Enum, ForeignKey, Index
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base


class CalorieLog(Base):
    __tablename__ = "calorie_logs"

    id: Mapped[str] = mapped_column(
        String(36), primary_key=True, default=lambda: str(uuid.uuid4())
    )
    user_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False
    )
    log_date: Mapped[date] = mapped_column(Date, nullable=False)
    target_kcal: Mapped[float] = mapped_column(Numeric(7, 2), nullable=False)
    consumed_kcal: Mapped[float] = mapped_column(Numeric(7, 2), default=0, nullable=False)
    status: Mapped[str] = mapped_column(
        Enum("normal", "near_limit", "over", "under", name="log_status_enum"),
        default="normal",
        nullable=False,
    )
    created_at: Mapped[datetime] = mapped_column(
        default=lambda: datetime.now(timezone.utc)
    )
    updated_at: Mapped[datetime] = mapped_column(
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
    )

    entries: Mapped[list["FoodEntry"]] = relationship(
        back_populates="calorie_log", cascade="all, delete-orphan"
    )

    @property
    def remaining_kcal(self) -> float:
        return float(self.target_kcal) - float(self.consumed_kcal)

    __table_args__ = (
        Index("idx_calorie_log_user_date", "user_id", "log_date", unique=True),
    )
