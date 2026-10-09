from datetime import date, datetime
from typing import Literal

from pydantic import BaseModel, Field

from app.models.task import Importance


class TaskCreate(BaseModel):
    title: str = Field(min_length=1, max_length=30)
    description: str = Field(min_length=1, max_length=500)
    importance: Importance = Importance.medium
    task_date: date
    deadline: date | None = None
    place: Literal["top", "bottom"] = "top"


class TaskUpdate(BaseModel):
    title: str | None = Field(default=None, min_length=1, max_length=30)
    description: str | None = Field(default=None, min_length=1, max_length=500)
    importance: Importance | None = None
    task_date: date | None = None
    deadline: date | None = None
    is_done: bool | None = None
    position: int | None = None


class TaskMove(BaseModel):
    task_date: date
    position: int | None = None


class TaskReorder(BaseModel):
    ordered_ids: list[int]


class TaskRestore(BaseModel):
    task_date: date | None = None


class TaskResponse(BaseModel):
    id: int
    title: str
    description: str
    importance: Importance
    task_date: date
    deadline: date | None
    is_done: bool
    position: int
    deleted_at: datetime | None
    created_at: datetime

    model_config = {"from_attributes": True}
