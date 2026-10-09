from datetime import date

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.core.deps import get_current_user
from app.db.session import get_db
from app.models.user import User
from app.schemas.task import (
    TaskCreate,
    TaskMove,
    TaskReorder,
    TaskResponse,
    TaskRestore,
    TaskUpdate,
)
from app.services.task_service import TaskService

router = APIRouter(prefix="/api/tasks", tags=["tasks"])


@router.get("", response_model=list[TaskResponse])
def list_tasks(
    week_start: date = Query(...),
    search: str | None = Query(default=None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> list:
    return TaskService(db).list_week(current_user, week_start, search=search)


@router.get("/deleted", response_model=list[TaskResponse])
def list_deleted(
    search: str | None = Query(default=None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> list:
    return TaskService(db).list_deleted(current_user, search=search)


@router.delete("/deleted/purge")
def purge_all(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> dict[str, int]:
    count = TaskService(db).purge_all(current_user)
    return {"deleted": count}


@router.post("/reorder", response_model=list[TaskResponse])
def reorder_tasks(
    task_date: date = Query(...),
    payload: TaskReorder = ...,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> list:
    return TaskService(db).reorder(current_user, task_date, payload)


@router.post("", response_model=TaskResponse)
def create_task(
    payload: TaskCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return TaskService(db).create(current_user, payload)


@router.patch("/{task_id}", response_model=TaskResponse)
def update_task(
    task_id: int,
    payload: TaskUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return TaskService(db).update(current_user, task_id, payload)


@router.post("/{task_id}/move", response_model=TaskResponse)
def move_task(
    task_id: int,
    payload: TaskMove,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return TaskService(db).move(current_user, task_id, payload)


@router.delete("/{task_id}", response_model=TaskResponse)
def soft_delete_task(
    task_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return TaskService(db).soft_delete(current_user, task_id)


@router.post("/{task_id}/restore", response_model=TaskResponse)
def restore_task(
    task_id: int,
    payload: TaskRestore,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return TaskService(db).restore(current_user, task_id, payload)


@router.delete("/{task_id}/permanent")
def purge_task(
    task_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> dict[str, str]:
    TaskService(db).purge_one(current_user, task_id)
    return {"status": "ok"}
