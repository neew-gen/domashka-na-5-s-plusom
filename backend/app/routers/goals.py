from datetime import date

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.core.deps import get_current_user
from app.db.session import get_db
from app.models.user import User
from app.schemas.goal import WeekGoalCreate, WeekGoalResponse, WeekGoalUpdate
from app.services.goal_service import GoalService

router = APIRouter(prefix="/api/goals", tags=["goals"])


@router.get("", response_model=list[WeekGoalResponse])
def list_goals(
    week_start: date = Query(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> list:
    return GoalService(db).list_week(current_user, week_start)


@router.post("", response_model=WeekGoalResponse)
def create_goal(
    payload: WeekGoalCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return GoalService(db).create(current_user, payload)


@router.patch("/{goal_id}", response_model=WeekGoalResponse)
def update_goal(
    goal_id: int,
    payload: WeekGoalUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return GoalService(db).update(current_user, goal_id, payload)


@router.delete("/{goal_id}")
def delete_goal(
    goal_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> dict[str, str]:
    GoalService(db).delete(current_user, goal_id)
    return {"status": "ok"}
