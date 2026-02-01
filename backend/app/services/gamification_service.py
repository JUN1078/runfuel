import json
from datetime import date, datetime, timezone, timedelta

from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.gamification import Badge, UserBadge, UserStats, WeeklyFeedback
from app.models.calorie_log import CalorieLog
from app.models.food_entry import FoodEntry
from app.models.training import TrainingSession

# XP per level: level N requires N * 100 XP
XP_PER_LEVEL = 100

BADGE_DEFINITIONS = [
    # Logging badges
    {"key": "first_log", "name": "First Bite", "description": "Log your first meal", "icon": "utensils", "category": "logging", "tier": 1, "xp_reward": 10},
    {"key": "log_10", "name": "Consistent Logger", "description": "Log 10 meals", "icon": "clipboard-list", "category": "logging", "tier": 1, "xp_reward": 25},
    {"key": "log_50", "name": "Dedicated Tracker", "description": "Log 50 meals", "icon": "clipboard-check", "category": "logging", "tier": 2, "xp_reward": 50},
    {"key": "log_100", "name": "Nutrition Master", "description": "Log 100 meals", "icon": "award", "category": "logging", "tier": 3, "xp_reward": 100},
    # Photo badges
    {"key": "first_photo", "name": "Snap & Track", "description": "Use AI photo logging for the first time", "icon": "camera", "category": "photo", "tier": 1, "xp_reward": 15},
    {"key": "photo_25", "name": "Shutterbug", "description": "Log 25 meals with photos", "icon": "image", "category": "photo", "tier": 2, "xp_reward": 50},
    # Streak badges
    {"key": "streak_3", "name": "On a Roll", "description": "3-day logging streak", "icon": "flame", "category": "streak", "tier": 1, "xp_reward": 15},
    {"key": "streak_7", "name": "Week Warrior", "description": "7-day logging streak", "icon": "flame", "category": "streak", "tier": 2, "xp_reward": 30},
    {"key": "streak_14", "name": "Two-Week Titan", "description": "14-day logging streak", "icon": "flame", "category": "streak", "tier": 2, "xp_reward": 50},
    {"key": "streak_30", "name": "Monthly Machine", "description": "30-day logging streak", "icon": "flame", "category": "streak", "tier": 3, "xp_reward": 100},
    {"key": "streak_100", "name": "Century Streak", "description": "100-day logging streak", "icon": "zap", "category": "streak", "tier": 4, "xp_reward": 250},
    # Target badges
    {"key": "on_target_1", "name": "Bullseye", "description": "Hit your calorie target for 1 day", "icon": "target", "category": "target", "tier": 1, "xp_reward": 10},
    {"key": "on_target_7", "name": "Perfect Week", "description": "Hit your calorie target 7 days in a row", "icon": "trophy", "category": "target", "tier": 2, "xp_reward": 50},
    {"key": "on_target_30", "name": "Laser Focused", "description": "Hit your calorie target 30 days total", "icon": "medal", "category": "target", "tier": 3, "xp_reward": 100},
    # Running badges
    {"key": "first_run", "name": "First Steps", "description": "Complete your first training session", "icon": "footprints", "category": "running", "tier": 1, "xp_reward": 15},
    {"key": "run_50k", "name": "50K Club", "description": "Run a total of 50km", "icon": "map-pin", "category": "running", "tier": 2, "xp_reward": 50},
    {"key": "run_100k", "name": "100K Achiever", "description": "Run a total of 100km", "icon": "mountain", "category": "running", "tier": 3, "xp_reward": 100},
    # Race badges
    {"key": "first_race", "name": "Race Ready", "description": "Add your first race", "icon": "flag", "category": "race", "tier": 1, "xp_reward": 15},
    {"key": "race_finisher", "name": "Finisher", "description": "Complete a race", "icon": "medal", "category": "race", "tier": 2, "xp_reward": 50},
]


async def seed_badges(db: AsyncSession):
    """Seed badge definitions if not already present."""
    result = await db.execute(select(func.count(Badge.id)))
    count = result.scalar()
    if count > 0:
        return

    for badge_def in BADGE_DEFINITIONS:
        badge = Badge(**badge_def)
        db.add(badge)
    await db.commit()


async def get_or_create_stats(db: AsyncSession, user_id: str) -> UserStats:
    """Get or create user stats row."""
    result = await db.execute(
        select(UserStats).where(UserStats.user_id == user_id)
    )
    stats = result.scalar_one_or_none()
    if not stats:
        stats = UserStats(user_id=user_id)
        db.add(stats)
        await db.commit()
        await db.refresh(stats)
    return stats


async def get_user_stats(db: AsyncSession, user_id: str) -> dict:
    """Get user stats with level progress."""
    stats = await get_or_create_stats(db, user_id)
    level = stats.level
    xp_for_current = level * XP_PER_LEVEL
    xp_into_level = stats.total_xp - sum(i * XP_PER_LEVEL for i in range(1, level))
    xp_progress = min(xp_into_level / xp_for_current * 100, 100) if xp_for_current > 0 else 0

    return {
        "total_xp": stats.total_xp,
        "level": stats.level,
        "xp_for_next_level": xp_for_current,
        "xp_progress": round(xp_progress, 1),
        "current_streak": stats.current_streak,
        "longest_streak": stats.longest_streak,
        "total_logs": stats.total_logs,
        "total_photos": stats.total_photos,
        "perfect_weeks": stats.perfect_weeks,
        "days_on_target": stats.days_on_target,
    }


async def get_user_badges(db: AsyncSession, user_id: str) -> list[dict]:
    """Get all badges with earned status for user."""
    all_badges_result = await db.execute(select(Badge))
    all_badges = all_badges_result.scalars().all()

    earned_result = await db.execute(
        select(UserBadge).where(UserBadge.user_id == user_id)
    )
    earned = {ub.badge_id: ub.earned_at for ub in earned_result.scalars().all()}

    badges = []
    for badge in all_badges:
        badges.append({
            "badge": {
                "id": badge.id,
                "key": badge.key,
                "name": badge.name,
                "description": badge.description,
                "icon": badge.icon,
                "category": badge.category,
                "tier": badge.tier,
                "xp_reward": badge.xp_reward,
            },
            "earned_at": earned.get(badge.id),
            "earned": badge.id in earned,
        })

    return badges


async def add_xp(db: AsyncSession, user_id: str, xp: int):
    """Add XP and update level."""
    stats = await get_or_create_stats(db, user_id)
    stats.total_xp += xp

    # Recalculate level
    total = stats.total_xp
    level = 1
    while total >= level * XP_PER_LEVEL:
        total -= level * XP_PER_LEVEL
        level += 1
    stats.level = level
    await db.commit()


async def check_and_award_badges(db: AsyncSession, user_id: str) -> list[dict]:
    """Check all badge conditions and award new badges. Returns newly earned badges."""
    stats = await get_or_create_stats(db, user_id)

    # Get already earned badge keys
    earned_result = await db.execute(
        select(UserBadge.badge_id).where(UserBadge.user_id == user_id)
    )
    earned_badge_ids = set(earned_result.scalars().all())

    # Get all badges
    all_badges_result = await db.execute(select(Badge))
    all_badges = {b.key: b for b in all_badges_result.scalars().all()}

    new_badges = []

    # Check conditions
    checks = {
        "first_log": stats.total_logs >= 1,
        "log_10": stats.total_logs >= 10,
        "log_50": stats.total_logs >= 50,
        "log_100": stats.total_logs >= 100,
        "first_photo": stats.total_photos >= 1,
        "photo_25": stats.total_photos >= 25,
        "streak_3": stats.current_streak >= 3,
        "streak_7": stats.current_streak >= 7,
        "streak_14": stats.current_streak >= 14,
        "streak_30": stats.current_streak >= 30,
        "streak_100": stats.current_streak >= 100,
        "on_target_1": stats.days_on_target >= 1,
        "on_target_7": stats.perfect_weeks >= 1,
        "on_target_30": stats.days_on_target >= 30,
    }

    for key, condition in checks.items():
        badge = all_badges.get(key)
        if badge and badge.id not in earned_badge_ids and condition:
            user_badge = UserBadge(user_id=user_id, badge_id=badge.id)
            db.add(user_badge)
            await add_xp(db, user_id, badge.xp_reward)
            new_badges.append({
                "key": badge.key,
                "name": badge.name,
                "description": badge.description,
                "icon": badge.icon,
                "xp_reward": badge.xp_reward,
            })

    if new_badges:
        await db.commit()

    return new_badges


async def update_streak(db: AsyncSession, user_id: str):
    """Update streak based on calorie log dates."""
    stats = await get_or_create_stats(db, user_id)

    today = date.today()
    result = await db.execute(
        select(CalorieLog.log_date)
        .where(CalorieLog.user_id == user_id)
        .order_by(CalorieLog.log_date.desc())
    )
    log_dates = [row[0] for row in result.all()]

    if not log_dates:
        stats.current_streak = 0
        await db.commit()
        return

    streak = 0
    check_date = today
    for d in log_dates:
        if d == check_date:
            streak += 1
            check_date -= timedelta(days=1)
        elif d == check_date - timedelta(days=1):
            check_date = d
            streak += 1
            check_date -= timedelta(days=1)
        else:
            break

    stats.current_streak = streak
    if streak > stats.longest_streak:
        stats.longest_streak = streak
    await db.commit()


async def record_food_log(db: AsyncSession, user_id: str, is_photo: bool = False):
    """Called after a food entry is created to update stats."""
    stats = await get_or_create_stats(db, user_id)
    stats.total_logs += 1
    if is_photo:
        stats.total_photos += 1
    await db.commit()

    await update_streak(db, user_id)


async def calculate_daily_score(db: AsyncSession, user_id: str, log_date: date = None) -> dict:
    """Calculate daily Duolingo-style score."""
    if log_date is None:
        log_date = date.today()

    stats = await get_or_create_stats(db, user_id)

    result = await db.execute(
        select(CalorieLog).where(
            CalorieLog.user_id == user_id,
            CalorieLog.log_date == log_date,
        )
    )
    log = result.scalar_one_or_none()

    if not log:
        return {
            "date": log_date,
            "calorie_score": 0,
            "logging_bonus": 0,
            "streak_bonus": 0,
            "total_score": 0,
            "message": "No meals logged yet today.",
            "encouragement": "Start logging to earn points!",
        }

    # Calorie score: 0-50 based on how close to target
    if log.target_kcal > 0 and log.consumed_kcal > 0:
        ratio = log.consumed_kcal / float(log.target_kcal)
        if 0.9 <= ratio <= 1.1:
            calorie_score = 50
        elif 0.8 <= ratio <= 1.2:
            calorie_score = 35
        elif 0.7 <= ratio <= 1.3:
            calorie_score = 20
        else:
            calorie_score = 10
    else:
        calorie_score = 0

    # Logging bonus: 10 per entry, max 30
    entry_result = await db.execute(
        select(func.count(FoodEntry.id)).where(
            FoodEntry.calorie_log_id == log.id
        )
    )
    entry_count = entry_result.scalar() or 0
    logging_bonus = min(entry_count * 10, 30)

    # Streak bonus: 5 per day, max 20
    streak_bonus = min(stats.current_streak * 5, 20)

    total = calorie_score + logging_bonus + streak_bonus

    # Encouragement messages
    if total >= 90:
        message = "Outstanding!"
        encouragement = "You're on fire! Keep this energy going!"
    elif total >= 70:
        message = "Great job!"
        encouragement = "You're crushing your goals today!"
    elif total >= 50:
        message = "Good progress!"
        encouragement = "You're on the right track. Keep logging!"
    elif total >= 30:
        message = "Getting there!"
        encouragement = "Log a few more meals to boost your score."
    else:
        message = "Let's get started!"
        encouragement = "Every meal logged brings you closer to your goals."

    return {
        "date": log_date,
        "calorie_score": calorie_score,
        "logging_bonus": logging_bonus,
        "streak_bonus": streak_bonus,
        "total_score": total,
        "message": message,
        "encouragement": encouragement,
    }
