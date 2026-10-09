from datetime import date

from app.services.task_service import friday_of, monday_of


def test_monday_of():
    assert monday_of(date(2026, 10, 9)) == date(2026, 10, 5)


def test_friday_of():
    assert friday_of(date(2026, 10, 5)) == date(2026, 10, 9)
