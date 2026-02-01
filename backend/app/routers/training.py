from datetime import date
from typing import Optional

from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.dependencies import get_current_user
from app.models.user import User
from app.schemas.training import (
    RaceCreate, RaceUpdate, RaceResponse,
    TrainingPlanCreate, TrainingPlanResponse,
    TrainingSessionUpdate, TrainingSessionResponse,
    GeneratePlanRequest,
)
from app.schemas.gamification import WeeklyFeedbackResponse
from app.services import training_service

router = APIRouter()


# --- Races ---
@router.post("/races", response_model=RaceResponse)
async def create_race(
    body: RaceCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    race = await training_service.create_race(db, current_user.id, body.model_dump())
    return RaceResponse.model_validate(race)


@router.get("/races", response_model=list[RaceResponse])
async def list_races(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    races = await training_service.get_races(db, current_user.id)
    return [RaceResponse.model_validate(r) for r in races]


@router.get("/races/{race_id}", response_model=RaceResponse)
async def get_race(
    race_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    race = await training_service.get_race(db, current_user.id, race_id)
    return RaceResponse.model_validate(race)


@router.put("/races/{race_id}", response_model=RaceResponse)
async def update_race(
    race_id: str,
    body: RaceUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    race = await training_service.update_race(
        db, current_user.id, race_id, body.model_dump(exclude_unset=True)
    )
    return RaceResponse.model_validate(race)


@router.delete("/races/{race_id}")
async def delete_race(
    race_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    await training_service.delete_race(db, current_user.id, race_id)
    return {"message": "Race deleted"}


# --- Training Plans ---
@router.post("/plans", response_model=TrainingPlanResponse)
async def create_plan(
    body: TrainingPlanCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    plan = await training_service.create_plan(db, current_user.id, body.model_dump())
    return TrainingPlanResponse.model_validate(plan)


@router.get("/plans", response_model=list[TrainingPlanResponse])
async def list_plans(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    plans = await training_service.get_plans(db, current_user.id)
    return [TrainingPlanResponse.model_validate(p) for p in plans]


@router.get("/plans/{plan_id}", response_model=TrainingPlanResponse)
async def get_plan(
    plan_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    plan = await training_service.get_plan(db, current_user.id, plan_id)
    return TrainingPlanResponse.model_validate(plan)


@router.post("/plans/generate", response_model=TrainingPlanResponse)
async def generate_plan(
    body: GeneratePlanRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    plan = await training_service.generate_training_plan(
        db, current_user.id, body.model_dump()
    )
    return TrainingPlanResponse.model_validate(plan)


# --- Sessions ---
@router.put("/sessions/{session_id}", response_model=TrainingSessionResponse)
async def update_session(
    session_id: str,
    body: TrainingSessionUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    session = await training_service.update_session(
        db, current_user.id, session_id, body.model_dump(exclude_unset=True)
    )
    return TrainingSessionResponse.model_validate(session)


@router.get("/week")
async def get_week_view(
    start: date = Query(...),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    sessions = await training_service.get_week_sessions(db, current_user.id, start)
    return [TrainingSessionResponse.model_validate(s) for s in sessions]


# --- Weekly Feedback ---
@router.post("/feedback", response_model=WeeklyFeedbackResponse)
async def generate_feedback(
    week_start: Optional[date] = Query(default=None),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    feedback = await training_service.generate_weekly_feedback(
        db, current_user.id, week_start
    )
    return WeeklyFeedbackResponse.model_validate(feedback)
