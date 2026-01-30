from datetime import date, timedelta

from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.calorie_log import CalorieLog


async def get_weekly_summary(
    db: AsyncSession, user_id: str, reference_date: date | None = None
) -> dict:
    if reference_date is None:
        reference_date = date.today()

    # Get Monday of the week
    start = reference_date - timedelta(days=reference_date.weekday())
    end = start + timedelta(days=6)

    result = await db.execute(
        select(CalorieLog).where(
            CalorieLog.user_id == user_id,
            CalorieLog.log_date >= start,
            CalorieLog.log_date <= end,
        )
    )
    logs = list(result.scalars().all())

    if not logs:
        return {
            "period_start": start.isoformat(),
            "period_end": end.isoformat(),
            "avg_intake_kcal": None,
            "avg_target_kcal": None,
            "total_intake_kcal": None,
            "days_on_target": 0,
            "days_logged": 0,
            "consistency_score": None,
        }

    days_logged = len(logs)
    total_intake = sum(float(l.consumed_kcal) for l in logs)
    total_target = sum(float(l.target_kcal) for l in logs)
    days_on_target = sum(
        1
        for l in logs
        if abs(float(l.consumed_kcal) - float(l.target_kcal))
        <= float(l.target_kcal) * 0.1
    )

    return {
        "period_start": start.isoformat(),
        "period_end": end.isoformat(),
        "avg_intake_kcal": round(total_intake / days_logged, 2),
        "avg_target_kcal": round(total_target / days_logged, 2),
        "total_intake_kcal": round(total_intake, 2),
        "days_on_target": days_on_target,
        "days_logged": days_logged,
        "consistency_score": round((days_on_target / 7) * 100, 2),
    }


async def get_monthly_summary(
    db: AsyncSession, user_id: str, year: int, month: int
) -> dict:
    start = date(year, month, 1)
    if month == 12:
        end = date(year + 1, 1, 1) - timedelta(days=1)
    else:
        end = date(year, month + 1, 1) - timedelta(days=1)

    total_days = (end - start).days + 1

    result = await db.execute(
        select(CalorieLog).where(
            CalorieLog.user_id == user_id,
            CalorieLog.log_date >= start,
            CalorieLog.log_date <= end,
        )
    )
    logs = list(result.scalars().all())

    if not logs:
        return {
            "period_start": start.isoformat(),
            "period_end": end.isoformat(),
            "avg_intake_kcal": None,
            "avg_target_kcal": None,
            "total_intake_kcal": None,
            "days_on_target": 0,
            "days_logged": 0,
            "consistency_score": None,
        }

    days_logged = len(logs)
    total_intake = sum(float(l.consumed_kcal) for l in logs)
    total_target = sum(float(l.target_kcal) for l in logs)
    days_on_target = sum(
        1
        for l in logs
        if abs(float(l.consumed_kcal) - float(l.target_kcal))
        <= float(l.target_kcal) * 0.1
    )

    return {
        "period_start": start.isoformat(),
        "period_end": end.isoformat(),
        "avg_intake_kcal": round(total_intake / days_logged, 2),
        "avg_target_kcal": round(total_target / days_logged, 2),
        "total_intake_kcal": round(total_intake, 2),
        "days_on_target": days_on_target,
        "days_logged": days_logged,
        "consistency_score": round((days_on_target / total_days) * 100, 2),
    }


async def get_streak(db: AsyncSession, user_id: str) -> dict:
    result = await db.execute(
        select(CalorieLog.log_date)
        .where(CalorieLog.user_id == user_id, CalorieLog.consumed_kcal > 0)
        .order_by(CalorieLog.log_date.desc())
    )
    dates = [row[0] for row in result.all()]

    if not dates:
        return {"current_streak": 0, "longest_streak": 0}

    # Calculate current streak (consecutive days ending today or yesterday)
    current_streak = 0
    today = date.today()
    check_date = today

    for d in dates:
        if d == check_date:
            current_streak += 1
            check_date -= timedelta(days=1)
        elif d == check_date - timedelta(days=1) and current_streak == 0:
            # Allow streak to start from yesterday
            check_date = d
            current_streak = 1
            check_date -= timedelta(days=1)
        else:
            break

    # Calculate longest streak
    longest_streak = 0
    current_run = 1
    sorted_dates = sorted(set(dates))

    for i in range(1, len(sorted_dates)):
        if (sorted_dates[i] - sorted_dates[i - 1]).days == 1:
            current_run += 1
        else:
            longest_streak = max(longest_streak, current_run)
            current_run = 1
    longest_streak = max(longest_streak, current_run)

    return {
        "current_streak": current_streak,
        "longest_streak": longest_streak,
    }


async def get_consistency(
    db: AsyncSession, user_id: str, days: int = 30
) -> dict:
    end = date.today()
    start = end - timedelta(days=days - 1)

    result = await db.execute(
        select(CalorieLog).where(
            CalorieLog.user_id == user_id,
            CalorieLog.log_date >= start,
            CalorieLog.log_date <= end,
        )
    )
    logs = list(result.scalars().all())

    days_on_target = sum(
        1
        for l in logs
        if abs(float(l.consumed_kcal) - float(l.target_kcal))
        <= float(l.target_kcal) * 0.1
    )

    return {
        "score": round((days_on_target / days) * 100, 2) if days > 0 else 0,
        "days_on_target": days_on_target,
        "total_days": days,
        "period": f"{days}d",
    }
