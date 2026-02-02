import json
from datetime import date, timedelta

from sqlalchemy import select, and_
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from openai import AsyncOpenAI

from app.config import get_settings
from app.models.training import TrainingPlan, TrainingSession, Race
from app.models.user import UserProfile
from app.models.calorie_log import CalorieLog
from app.core.exceptions import NotFoundError, BadRequestError

settings = get_settings()

_ai_client = None


def _get_ai_client() -> AsyncOpenAI:
    global _ai_client
    if _ai_client is None:
        _ai_client = AsyncOpenAI(api_key=settings.OPENAI_API_KEY)
    return _ai_client


# --- Race CRUD ---
async def create_race(db: AsyncSession, user_id: str, data: dict) -> Race:
    race = Race(user_id=user_id, **data)
    db.add(race)
    await db.commit()
    await db.refresh(race)
    return race


async def get_races(db: AsyncSession, user_id: str) -> list[Race]:
    result = await db.execute(
        select(Race)
        .where(Race.user_id == user_id)
        .order_by(Race.race_date.asc())
    )
    return list(result.scalars().all())


async def get_race(db: AsyncSession, user_id: str, race_id: str) -> Race:
    result = await db.execute(
        select(Race).where(Race.id == race_id, Race.user_id == user_id)
    )
    race = result.scalar_one_or_none()
    if not race:
        raise NotFoundError("Race not found")
    return race


async def update_race(db: AsyncSession, user_id: str, race_id: str, data: dict) -> Race:
    race = await get_race(db, user_id, race_id)
    for key, value in data.items():
        if value is not None:
            setattr(race, key, value)
    await db.commit()
    await db.refresh(race)
    return race


async def delete_race(db: AsyncSession, user_id: str, race_id: str):
    race = await get_race(db, user_id, race_id)
    await db.delete(race)
    await db.commit()


# --- Training Plan CRUD ---
async def create_plan(db: AsyncSession, user_id: str, data: dict) -> TrainingPlan:
    sessions_data = data.pop("sessions", [])
    start = data["start_date"]
    end = data["end_date"]
    weeks = max(1, (end - start).days // 7)

    plan = TrainingPlan(user_id=user_id, weeks=weeks, source="manual", **data)
    db.add(plan)
    await db.flush()

    for sess in sessions_data:
        session = TrainingSession(
            plan_id=plan.id,
            user_id=user_id,
            **sess,
        )
        db.add(session)

    await db.commit()
    return await get_plan(db, user_id, plan.id)


async def get_plans(db: AsyncSession, user_id: str) -> list[TrainingPlan]:
    result = await db.execute(
        select(TrainingPlan)
        .where(TrainingPlan.user_id == user_id)
        .options(selectinload(TrainingPlan.sessions))
        .order_by(TrainingPlan.start_date.desc())
    )
    return list(result.scalars().unique().all())


async def get_plan(db: AsyncSession, user_id: str, plan_id: str) -> TrainingPlan:
    result = await db.execute(
        select(TrainingPlan)
        .where(TrainingPlan.id == plan_id, TrainingPlan.user_id == user_id)
        .options(selectinload(TrainingPlan.sessions))
    )
    plan = result.scalars().unique().one_or_none()
    if not plan:
        raise NotFoundError("Training plan not found")
    return plan


async def update_session(
    db: AsyncSession, user_id: str, session_id: str, data: dict
) -> TrainingSession:
    result = await db.execute(
        select(TrainingSession).where(
            TrainingSession.id == session_id,
            TrainingSession.user_id == user_id,
        )
    )
    session = result.scalar_one_or_none()
    if not session:
        raise NotFoundError("Session not found")

    for key, value in data.items():
        if value is not None:
            setattr(session, key, value)
    await db.commit()
    await db.refresh(session)
    return session


async def get_week_sessions(
    db: AsyncSession, user_id: str, week_start: date
) -> list[TrainingSession]:
    week_end = week_start + timedelta(days=6)
    result = await db.execute(
        select(TrainingSession).where(
            TrainingSession.user_id == user_id,
            TrainingSession.session_date >= week_start,
            TrainingSession.session_date <= week_end,
        ).order_by(TrainingSession.session_date.asc())
    )
    return list(result.scalars().all())


# --- AI Training Plan Generation ---
async def generate_training_plan(
    db: AsyncSession, user_id: str, data: dict
) -> TrainingPlan:
    """Use AI to generate a training plan."""
    # Get user profile for context
    profile_result = await db.execute(
        select(UserProfile).where(UserProfile.user_id == user_id)
    )
    profile = profile_result.scalar_one_or_none()

    # Build context
    context_parts = []
    if profile:
        context_parts.append(
            f"Runner profile: {profile.age}yo {profile.gender}, "
            f"{profile.weight_kg}kg, runs {profile.running_frequency} days/week, "
            f"intensity: {profile.training_intensity}, goal: {profile.goal}"
        )

    if data.get("race_name"):
        context_parts.append(f"Target race: {data['race_name']}")
    if data.get("race_distance_km"):
        context_parts.append(f"Race distance: {data['race_distance_km']}km")
    if data.get("race_date"):
        context_parts.append(f"Race date: {data['race_date']}")
    if data.get("target_time"):
        context_parts.append(f"Target time: {data['target_time']}")
    if data.get("current_weekly_km"):
        context_parts.append(f"Current weekly volume: {data['current_weekly_km']}km")
    if data.get("elevation_gain"):
        context_parts.append(f"Race elevation gain: {data['elevation_gain']}m")
    if data.get("avg_long_run"):
        context_parts.append(f"Average long run distance: {data['avg_long_run']}km")

    # Performance bests (from Strava or manual input)
    pbs = []
    if data.get("best_5k"):
        pbs.append(f"5K: {data['best_5k']}")
    if data.get("best_10k"):
        pbs.append(f"10K: {data['best_10k']}")
    if data.get("best_half"):
        pbs.append(f"Half Marathon: {data['best_half']}")
    if data.get("best_marathon"):
        pbs.append(f"Marathon: {data['best_marathon']}")
    if pbs:
        context_parts.append(f"Personal bests: {', '.join(pbs)}")

    weeks = data.get("weeks", 12)
    today = date.today()
    start_date = today + timedelta(days=(7 - today.weekday()))  # Next Monday
    end_date = start_date + timedelta(weeks=weeks)

    prompt = f"""Generate a {weeks}-week running training plan using proper periodization theory.

Context:
{chr(10).join(context_parts)}

Plan starts: {start_date}, ends: {end_date}

PERIODIZATION STRUCTURE (apply based on plan length):
1. **Base/Foundation Phase** (~30-40% of plan): Build aerobic base with mostly easy runs, gradually increasing weekly volume by no more than 10% per week. Include 1 long run per week.
2. **Build/Specific Phase** (~30-40% of plan): Introduce quality workouts — tempo runs, intervals, and race-specific sessions. Maintain long run progression. Add elevation work if race has significant climbing.
3. **Peak Phase** (~15-20% of plan): Highest training load. Race-pace workouts, back-to-back long runs for ultra distances. Simulate race conditions.
4. **Taper Phase** (final 2-3 weeks): Reduce volume by 40-60% while maintaining intensity. Keep short sharp sessions, drop volume.

LOAD MANAGEMENT:
- Follow a 3:1 load/recovery cycle — every 4th week should be a recovery week (reduce volume 20-30%)
- Hard/easy day alternation — never schedule two hard sessions back to back
- Weekly long run should be 25-35% of total weekly distance

SPORTS MASSAGE / RECOVERY SCHEDULING:
- Schedule a "recovery" session with description "Sports massage — recovery & injury prevention" every 2 weeks
- Time these after the highest-volume weeks or after accumulating ~100-150km
- Place them on a rest day or the day after the long run

PACING (use personal bests if provided to calculate training paces):
- Easy runs: conversational pace, ~60-70% max HR
- Tempo: comfortably hard, ~80-85% max HR
- Intervals: 90-95% effort, with equal or greater recovery

Return a JSON object:
{{
  "plan_name": "descriptive name",
  "sessions": [
    {{
      "week": 1,
      "day": "monday",
      "time_of_day": "morning",
      "type": "easy_run|tempo|interval|long_run|recovery|rest|strength|cross_training|trail",
      "description": "brief description including pace guidance where relevant",
      "distance_km": number or null,
      "duration_min": number or null,
      "elevation_m": number or null
    }}
  ]
}}

Generate sessions for EVERY day of EVERY week (7 sessions per week, {weeks * 7} total).
Use session types: easy_run, tempo, interval, long_run, recovery, rest, strength, cross_training, trail.
Mark rest and massage days as type "rest" or "recovery" respectively."""

    response = await _get_ai_client().chat.completions.create(
        model=settings.OPENAI_MODEL,
        response_format={"type": "json_object"},
        messages=[
            {
                "role": "system",
                "content": (
                    "You are an expert running coach certified in periodization methodology. "
                    "You design training plans following Lydiard, Daniels, and Pfitzinger principles. "
                    "Generate detailed, scientifically periodized training plans that include proper "
                    "load management, recovery scheduling, and sports massage integration."
                ),
            },
            {"role": "user", "content": prompt},
        ],
        max_tokens=16000,
    )

    result = json.loads(response.choices[0].message.content)

    # Create plan
    plan_name = result.get("plan_name", f"AI Plan - {weeks} Weeks")
    plan = TrainingPlan(
        user_id=user_id,
        name=plan_name,
        race_id=data.get("race_id"),
        start_date=start_date,
        end_date=end_date,
        weeks=weeks,
        source="ai_generated",
        is_active=True,
    )
    db.add(plan)
    await db.flush()

    # Create sessions
    day_map = {
        "monday": 0, "tuesday": 1, "wednesday": 2, "thursday": 3,
        "friday": 4, "saturday": 5, "sunday": 6,
    }
    for sess in result.get("sessions", []):
        week_num = sess.get("week", 1)
        day = sess.get("day", "monday").lower()
        day_offset = day_map.get(day, 0)
        session_date = start_date + timedelta(weeks=week_num - 1, days=day_offset)

        session = TrainingSession(
            plan_id=plan.id,
            user_id=user_id,
            session_date=session_date,
            week_number=week_num,
            day_of_week=day,
            time_of_day=sess.get("time_of_day", "morning"),
            session_type=sess.get("type", "easy_run"),
            description=sess.get("description"),
            target_distance_km=sess.get("distance_km"),
            target_duration_min=sess.get("duration_min"),
            elevation_gain_m=sess.get("elevation_m"),
        )
        db.add(session)

    await db.commit()
    return await get_plan(db, user_id, plan.id)


# --- AI Weekly Feedback ---
async def generate_weekly_feedback(
    db: AsyncSession, user_id: str, week_start: date = None
) -> "WeeklyFeedback":
    """Generate AI feedback for the past week."""
    from app.models.gamification import WeeklyFeedback

    if week_start is None:
        today = date.today()
        week_start = today - timedelta(days=today.weekday() + 7)  # Last Monday

    week_end = week_start + timedelta(days=6)

    # Get nutrition data
    cal_result = await db.execute(
        select(CalorieLog).where(
            CalorieLog.user_id == user_id,
            CalorieLog.log_date >= week_start,
            CalorieLog.log_date <= week_end,
        )
    )
    logs = cal_result.scalars().all()

    # Get training data
    sessions = await get_week_sessions(db, user_id, week_start)

    # Get profile
    profile_result = await db.execute(
        select(UserProfile).where(UserProfile.user_id == user_id)
    )
    profile = profile_result.scalar_one_or_none()

    # Build context
    nutrition_data = []
    for log in logs:
        nutrition_data.append(
            f"{log.log_date}: consumed {float(log.consumed_kcal):.0f} / target {float(log.target_kcal):.0f} kcal"
        )

    training_data = []
    for s in sessions:
        training_data.append(
            f"{s.session_date} ({s.day_of_week}): {s.session_type} - "
            f"{'completed' if s.completed else 'not completed'}"
            f"{f', {float(s.actual_distance_km):.1f}km' if s.actual_distance_km else ''}"
        )

    prompt = f"""Analyze this runner's week and provide feedback.

Runner: {profile.age}yo {profile.gender}, {profile.weight_kg}kg, goal: {profile.goal if profile else 'performance'}

Nutrition this week:
{chr(10).join(nutrition_data) if nutrition_data else 'No nutrition data logged'}

Training this week:
{chr(10).join(training_data) if training_data else 'No training data logged'}

Return JSON:
{{
  "nutrition_score": 0-100,
  "training_score": 0-100,
  "overall_score": 0-100,
  "nutrition_feedback": "2-3 sentences",
  "training_feedback": "2-3 sentences",
  "ai_suggestions": "2-3 actionable suggestions",
  "highlights": "positive highlights from the week"
}}"""

    response = await _get_ai_client().chat.completions.create(
        model=settings.OPENAI_MODEL,
        response_format={"type": "json_object"},
        messages=[
            {
                "role": "system",
                "content": "You are a supportive running coach and nutritionist. Give encouraging but honest feedback.",
            },
            {"role": "user", "content": prompt},
        ],
        max_tokens=1000,
    )

    result = json.loads(response.choices[0].message.content)

    feedback = WeeklyFeedback(
        user_id=user_id,
        week_start=week_start,
        week_end=week_end,
        nutrition_score=result.get("nutrition_score", 0),
        training_score=result.get("training_score", 0),
        overall_score=result.get("overall_score", 0),
        nutrition_feedback=result.get("nutrition_feedback"),
        training_feedback=result.get("training_feedback"),
        ai_suggestions=result.get("ai_suggestions"),
        highlights=result.get("highlights"),
    )
    db.add(feedback)
    await db.commit()
    await db.refresh(feedback)
    return feedback
