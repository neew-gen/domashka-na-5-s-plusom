from datetime import date, timedelta

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.models.user import User
from app.models.week_goal import WeekGoal
from app.repositories.goal_repository import GoalRepository
from app.schemas.goal import WeekGoalCreate, WeekGoalUpdate


def monday_of(day: date) -> date:
    return day - timedelta(days=day.weekday())


class GoalService:
    def __init__(self, db: Session) -> None:
        self.goals = GoalRepository(db)

    def list_week(self, user: User, week_start: date) -> list[WeekGoal]:
        week_start = monday_of(week_start)
        return self.goals.carry_incomplete_from_previous(user.id, week_start)

    def create(self, user: User, payload: WeekGoalCreate) -> WeekGoal:
        week_start = monday_of(payload.week_start)
        self.goals.carry_incomplete_from_previous(user.id, week_start)
        return self.goals.create(user_id=user.id, week_start=week_start, text=payload.text.strip())

    def get(self, user: User, goal_id: int) -> WeekGoal:
        goal = self.goals.get_for_user(user.id, goal_id)
        if goal is None:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Цель не найдена")
        return goal

    def update(self, user: User, goal_id: int, payload: WeekGoalUpdate) -> WeekGoal:
        goal = self.get(user, goal_id)
        data = payload.model_dump(exclude_unset=True)
        if "text" in data and data["text"] is not None:
            data["text"] = data["text"].strip()
        for key, value in data.items():
            setattr(goal, key, value)
        return self.goals.save(goal)

    def delete(self, user: User, goal_id: int) -> None:
        goal = self.get(user, goal_id)
        self.goals.delete(goal)
