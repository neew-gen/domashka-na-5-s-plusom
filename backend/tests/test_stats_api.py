from fastapi.testclient import TestClient

WEEK_START = "2026-10-05"
TASK_DATE = "2026-10-06"


def test_week_stats(auth_client: TestClient):
    auth_client.post(
        "/api/tasks",
        json={
            "title": "A",
            "description": "Описание A",
            "importance": "medium",
            "task_date": TASK_DATE,
        },
    )
    res = auth_client.post(
        "/api/tasks",
        json={
            "title": "B",
            "description": "Описание B",
            "importance": "low",
            "task_date": TASK_DATE,
        },
    )
    task_id = res.json()["id"]
    auth_client.patch(f"/api/tasks/{task_id}", json={"is_done": True})

    res = auth_client.get("/api/stats/week", params={"week_start": WEEK_START})
    assert res.status_code == 200
    body = res.json()
    assert body["total"] == 2
    assert body["done"] == 1
    assert body["not_done"] == 1
    assert body["completion_percent"] == 50


def test_stats_require_auth(client: TestClient):
    res = client.get("/api/stats/week", params={"week_start": WEEK_START})
    assert res.status_code == 401
