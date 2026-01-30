import uuid
from datetime import datetime, date, timezone

from sqlalchemy import String, SmallInteger, Date, Numeric, Enum, ForeignKey, Index
from sqlalchemy.orm import Mapped, mapped_column

from app.models.base import Base


class ProgressSummary(Base):
    __tablename__ = "progress_summaries"

    id: Mapped[str] = mapped_column(
        String(36), primary_key=True, default=lambda: str(uuid.uuid4())
    )
    user_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False
    )
    period_type: Mapped[str] = mapped_column(
        Enum("daily", "weekly", "monthly", name="period_type_enum"), nullable=False
    )
    period_start: Mapped[date] = mapped_column(Date, nullable=False)
    period_end: Mapped[date] = mapped_column(Date, nullable=False)
    avg_intake_kcal: Mapped[float] = mapped_column(Numeric(7, 2), nullable=True)
    avg_target_kcal: Mapped[float] = mapped_column(Numeric(7, 2), nullable=True)
    total_intake_kcal: Mapped[float] = mapped_column(Numeric(9, 2), nullable=True)
    days_on_target: Mapped[int] = mapped_column(SmallInteger, default=0)
    days_logged: Mapped[int] = mapped_column(SmallInteger, default=0)
    consistency_score: Mapped[float] = mapped_column(Numeric(5, 2), nullable=True)
    current_streak: Mapped[int] = mapped_column(SmallInteger, default=0)
    longest_streak: Mapped[int] = mapped_column(SmallInteger, default=0)
    created_at: Mapped[datetime] = mapped_column(
        default=lambda: datetime.now(timezone.utc)
    )
    updated_at: Mapped[datetime] = mapped_column(
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
    )

    __table_args__ = (
        Index(
            "idx_progress_user_period",
            "user_id",
            "period_type",
            "period_start",
            unique=True,
        ),
    )
