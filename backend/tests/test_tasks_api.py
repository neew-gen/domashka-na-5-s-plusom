from fastapi.testclient import TestClient

WEEK_START = "2026-10-05"
TASK_DATE = "2026-10-06"


def test_task_crud_toggle_search_move_reorder_delete_restore(auth_client: TestClient):
    res = auth_client.post(
        "/api/tasks",
        json={
            "title": "Тесты API",
            "description": "Написать тесты",
            "importance": "high",
            "task_date": TASK_DATE,
            "deadline": None,
        },
    )
    assert res.status_code == 200
    task = res.json()
    task_id = task["id"]
    assert task["is_done"] is False
    assert task["title"] == "Тесты API"

    res = auth_client.get("/api/tasks", params={"week_start": WEEK_START})
    assert res.status_code == 200
    assert len(res.json()) == 1

    res = auth_client.patch(f"/api/tasks/{task_id}", json={"is_done": True})
    assert res.status_code == 200
    assert res.json()["is_done"] is True

    res = auth_client.get(
        "/api/tasks",
        params={"week_start": WEEK_START, "search": "тесты"},
    )
    assert res.status_code == 200
    assert len(res.json()) == 1

    res = auth_client.get(
        "/api/tasks",
        params={"week_start": WEEK_START, "search": "API"},
    )
    assert res.status_code == 200
    assert len(res.json()) == 1

    res = auth_client.get(
        "/api/tasks",
        params={"week_start": WEEK_START, "search": "неттакого"},
    )
    assert res.status_code == 200
    assert res.json() == []

    other_date = "2026-10-08"
    res = auth_client.post(
        f"/api/tasks/{task_id}/move",
        json={"task_date": other_date},
    )
    assert res.status_code == 200
    assert res.json()["task_date"] == other_date

    res = auth_client.post(
        "/api/tasks",
        json={
            "title": "Вторая",
            "description": "Дополнительное описание",
            "importance": "low",
            "task_date": other_date,
        },
    )
    second_id = res.json()["id"]

    res = auth_client.post(
        "/api/tasks/reorder",
        params={"task_date": other_date},
        json={"ordered_ids": [second_id, task_id]},
    )
    assert res.status_code == 200
    ordered = [item["id"] for item in res.json()]
    assert ordered == [second_id, task_id]

    res = auth_client.delete(f"/api/tasks/{task_id}")
    assert res.status_code == 200
    assert res.json()["deleted_at"] is not None

    res = auth_client.get("/api/tasks/deleted")
    assert res.status_code == 200
    assert len(res.json()) == 1

    res = auth_client.post(
        f"/api/tasks/{task_id}/restore",
        json={"task_date": TASK_DATE},
    )
    assert res.status_code == 200
    assert res.json()["deleted_at"] is None
    assert res.json()["task_date"] == TASK_DATE

    res = auth_client.delete(f"/api/tasks/{task_id}")
    assert res.status_code == 200
    res = auth_client.delete(f"/api/tasks/{task_id}/permanent")
    assert res.status_code == 200

    res = auth_client.delete("/api/tasks/deleted/purge")
    assert res.status_code == 200


def test_tasks_require_auth(client: TestClient):
    res = client.get("/api/tasks", params={"week_start": WEEK_START})
    assert res.status_code == 401
