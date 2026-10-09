from datetime import date, datetime

from pydantic import BaseModel, Field


class WeekGoalCreate(BaseModel):
    text: str = Field(min_length=1, max_length=100)
    week_start: date


class WeekGoalUpdate(BaseModel):
    text: str | None = Field(default=None, min_length=1, max_length=100)
    is_done: bool | None = None


class WeekGoalResponse(BaseModel):
    id: int
    week_start: date
    text: str
    is_done: bool
    created_at: datetime

    model_config = {"from_attributes": True}
