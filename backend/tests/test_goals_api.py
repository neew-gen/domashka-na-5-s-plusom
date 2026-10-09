from fastapi.testclient import TestClient

WEEK_START = "2026-10-05"


def test_goals_crud(auth_client: TestClient):
    res = auth_client.post(
        "/api/goals",
        json={"text": "Закрыть спринт", "week_start": WEEK_START},
    )
    assert res.status_code == 200
    goal = res.json()
    goal_id = goal["id"]
    assert goal["is_done"] is False

    res = auth_client.get("/api/goals", params={"week_start": WEEK_START})
    assert res.status_code == 200
    assert len(res.json()) == 1

    res = auth_client.patch(f"/api/goals/{goal_id}", json={"is_done": True})
    assert res.status_code == 200
    assert res.json()["is_done"] is True

    res = auth_client.delete(f"/api/goals/{goal_id}")
    assert res.status_code == 200

    res = auth_client.get("/api/goals", params={"week_start": WEEK_START})
    assert res.status_code == 200
    assert res.json() == []


def test_goals_require_auth(client: TestClient):
    res = client.get("/api/goals", params={"week_start": WEEK_START})
    assert res.status_code == 401
