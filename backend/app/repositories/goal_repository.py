from datetime import date, timedelta

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.week_goal import WeekGoal


class GoalRepository:
    def __init__(self, db: Session) -> None:
        self.db = db

    def list_for_week(self, user_id: int, week_start: date) -> list[WeekGoal]:
        return list(
            self.db.scalars(
                select(WeekGoal)
                .where(WeekGoal.user_id == user_id, WeekGoal.week_start == week_start)
                .order_by(WeekGoal.id)
            ).all()
        )

    def get_for_user(self, user_id: int, goal_id: int) -> WeekGoal | None:
        return self.db.scalar(
            select(WeekGoal).where(WeekGoal.id == goal_id, WeekGoal.user_id == user_id)
        )

    def create(self, *, user_id: int, week_start: date, text: str) -> WeekGoal:
        goal = WeekGoal(user_id=user_id, week_start=week_start, text=text, is_done=False)
        self.db.add(goal)
        self.db.commit()
        self.db.refresh(goal)
        return goal

    def save(self, goal: WeekGoal) -> WeekGoal:
        self.db.add(goal)
        self.db.commit()
        self.db.refresh(goal)
        return goal

    def delete(self, goal: WeekGoal) -> None:
        self.db.delete(goal)
        self.db.commit()

    def carry_incomplete_from_previous(self, user_id: int, week_start: date) -> list[WeekGoal]:
        existing = self.list_for_week(user_id, week_start)
        if existing:
            return existing
        previous_start = week_start - timedelta(days=7)
        previous_goals = self.list_for_week(user_id, previous_start)
        incomplete = [item for item in previous_goals if not item.is_done]
        if not incomplete:
            return []
        for item in incomplete:
            self.db.add(
                WeekGoal(
                    user_id=user_id,
                    week_start=week_start,
                    text=item.text,
                    is_done=False,
                )
            )
        self.db.commit()
        return self.list_for_week(user_id, week_start)
