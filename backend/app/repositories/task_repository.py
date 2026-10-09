from datetime import UTC, date, datetime

from sqlalchemy import or_, select
from sqlalchemy.orm import Session

from app.models.task import Importance, Task


class TaskRepository:
    def __init__(self, db: Session) -> None:
        self.db = db

    def list_for_week(
        self,
        user_id: int,
        week_start: date,
        week_end: date,
        *,
        include_deleted: bool = False,
        search: str | None = None,
    ) -> list[Task]:
        query = select(Task).where(
            Task.user_id == user_id,
            Task.task_date >= week_start,
            Task.task_date <= week_end,
        )
        if include_deleted:
            query = query.where(Task.deleted_at.is_not(None))
        else:
            query = query.where(Task.deleted_at.is_(None))
        if search:
            pattern = f"%{search}%"
            query = query.where(
                or_(Task.title.ilike(pattern), Task.description.ilike(pattern))
            )
        query = query.order_by(Task.task_date, Task.position, Task.id)
        return list(self.db.scalars(query).all())

    def list_deleted(self, user_id: int, search: str | None = None) -> list[Task]:
        query = select(Task).where(Task.user_id == user_id, Task.deleted_at.is_not(None))
        if search:
            pattern = f"%{search}%"
            query = query.where(
                or_(Task.title.ilike(pattern), Task.description.ilike(pattern))
            )
        query = query.order_by(Task.deleted_at.desc())
        return list(self.db.scalars(query).all())

    def get_for_user(self, user_id: int, task_id: int) -> Task | None:
        return self.db.scalar(select(Task).where(Task.id == task_id, Task.user_id == user_id))

    def list_day(self, user_id: int, task_date: date) -> list[Task]:
        return list(
            self.db.scalars(
                select(Task).where(
                    Task.user_id == user_id,
                    Task.task_date == task_date,
                    Task.deleted_at.is_(None),
                )
            ).all()
        )

    def next_position(self, user_id: int, task_date: date) -> int:
        tasks = self.list_day(user_id, task_date)
        if not tasks:
            return 0
        return max(item.position for item in tasks) + 1

    def shift_day_positions(self, user_id: int, task_date: date) -> None:
        day_tasks = sorted(
            self.list_day(user_id, task_date),
            key=lambda item: item.position,
            reverse=True,
        )
        for item in day_tasks:
            item.position += 1
            self.db.add(item)

    def create(
        self,
        *,
        user_id: int,
        title: str,
        description: str,
        importance: Importance,
        task_date: date,
        deadline: date | None,
        place: str = "top",
    ) -> Task:
        if place == "bottom":
            position = self.next_position(user_id, task_date)
        else:
            self.shift_day_positions(user_id, task_date)
            position = 0
        task = Task(
            user_id=user_id,
            title=title,
            description=description,
            importance=importance,
            task_date=task_date,
            deadline=deadline,
            is_done=False,
            position=position,
        )
        self.db.add(task)
        self.db.commit()
        self.db.refresh(task)
        return task

    def save(self, task: Task) -> Task:
        self.db.add(task)
        self.db.commit()
        self.db.refresh(task)
        return task

    def soft_delete(self, task: Task) -> Task:
        task.deleted_at = datetime.now(UTC)
        return self.save(task)

    def restore(self, task: Task, task_date: date) -> Task:
        task.deleted_at = None
        task.task_date = task_date
        task.position = self.next_position(task.user_id, task_date)
        return self.save(task)

    def hard_delete(self, task: Task) -> None:
        self.db.delete(task)
        self.db.commit()

    def purge_deleted(self, user_id: int) -> int:
        tasks = self.list_deleted(user_id)
        count = len(tasks)
        for task in tasks:
            self.db.delete(task)
        self.db.commit()
        return count

    def reorder(self, user_id: int, task_date: date, ordered_ids: list[int]) -> list[Task]:
        tasks = {
            task.id: task
            for task in self.db.scalars(
                select(Task).where(
                    Task.user_id == user_id,
                    Task.task_date == task_date,
                    Task.deleted_at.is_(None),
                )
            ).all()
        }
        for index, task_id in enumerate(ordered_ids):
            task = tasks.get(task_id)
            if task is None:
                continue
            task.position = index
            self.db.add(task)
        self.db.commit()
        return self.list_for_week(user_id, task_date, task_date)

    def count_week_stats(self, user_id: int, week_start: date, week_end: date) -> tuple[int, int]:
        tasks = self.list_for_week(user_id, week_start, week_end)
        total = len(tasks)
        done = sum(1 for item in tasks if item.is_done)
        return total, done
