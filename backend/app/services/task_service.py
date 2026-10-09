from datetime import date, timedelta

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.models.task import Task
from app.models.user import User
from app.repositories.task_repository import TaskRepository
from app.schemas.task import TaskCreate, TaskMove, TaskReorder, TaskRestore, TaskUpdate


def monday_of(day: date) -> date:
    return day - timedelta(days=day.weekday())


def friday_of(week_start: date) -> date:
    return week_start + timedelta(days=4)


class TaskService:
    def __init__(self, db: Session) -> None:
        self.tasks = TaskRepository(db)

    def list_week(
        self,
        user: User,
        week_start: date,
        *,
        search: str | None = None,
    ) -> list[Task]:
        week_start = monday_of(week_start)
        return self.tasks.list_for_week(
            user.id,
            week_start,
            friday_of(week_start),
            search=search,
        )

    def list_deleted(self, user: User, search: str | None = None) -> list[Task]:
        return self.tasks.list_deleted(user.id, search=search)

    def create(self, user: User, payload: TaskCreate) -> Task:
        return self.tasks.create(
            user_id=user.id,
            title=payload.title.strip(),
            description=payload.description.strip(),
            importance=payload.importance,
            task_date=payload.task_date,
            deadline=payload.deadline,
            place=payload.place,
        )

    def get(self, user: User, task_id: int) -> Task:
        task = self.tasks.get_for_user(user.id, task_id)
        if task is None:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Задача не найдена")
        return task

    def update(self, user: User, task_id: int, payload: TaskUpdate) -> Task:
        task = self.get(user, task_id)
        data = payload.model_dump(exclude_unset=True)
        if "title" in data and data["title"] is not None:
            data["title"] = data["title"].strip()
        if "description" in data and data["description"] is not None:
            data["description"] = data["description"].strip()
        for key, value in data.items():
            setattr(task, key, value)
        return self.tasks.save(task)

    def soft_delete(self, user: User, task_id: int) -> Task:
        task = self.get(user, task_id)
        if task.deleted_at is not None:
            return task
        return self.tasks.soft_delete(task)

    def restore(self, user: User, task_id: int, payload: TaskRestore) -> Task:
        task = self.get(user, task_id)
        if task.deleted_at is None:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Задача не удалена")
        target_date = payload.task_date or task.task_date
        return self.tasks.restore(task, target_date)

    def purge_one(self, user: User, task_id: int) -> None:
        task = self.get(user, task_id)
        if task.deleted_at is None:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Окончательно удалить можно только из удалённых",
            )
        self.tasks.hard_delete(task)

    def purge_all(self, user: User) -> int:
        return self.tasks.purge_deleted(user.id)

    def move(self, user: User, task_id: int, payload: TaskMove) -> Task:
        task = self.get(user, task_id)
        if task.deleted_at is not None:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Сначала восстановите задачу",
            )
        task.task_date = payload.task_date
        if payload.position is None:
            task.position = self.tasks.next_position(user.id, payload.task_date)
        else:
            task.position = payload.position
        return self.tasks.save(task)

    def reorder(self, user: User, task_date: date, payload: TaskReorder) -> list[Task]:
        return self.tasks.reorder(user.id, task_date, payload.ordered_ids)

    def week_stats(self, user: User, week_start: date) -> dict[str, float | int]:
        week_start = monday_of(week_start)
        total, done = self.tasks.count_week_stats(user.id, week_start, friday_of(week_start))
        not_done = total - done
        percent = round((done / total) * 100, 1) if total else 0.0
        return {
            "total": total,
            "done": done,
            "not_done": not_done,
            "completion_percent": percent,
        }
