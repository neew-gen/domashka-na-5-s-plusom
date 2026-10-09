from datetime import date

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.core.deps import get_current_user
from app.db.session import get_db
from app.models.user import User
from app.schemas.stats import WeekStatsResponse
from app.services.task_service import TaskService

router = APIRouter(prefix="/api/stats", tags=["stats"])


@router.get("/week", response_model=WeekStatsResponse)
def week_stats(
    week_start: date = Query(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> dict:
    return TaskService(db).week_stats(current_user, week_start)
