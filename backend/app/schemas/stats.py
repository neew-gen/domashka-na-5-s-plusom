from pydantic import BaseModel


class WeekStatsResponse(BaseModel):
    total: int
    done: int
    not_done: int
    completion_percent: float
