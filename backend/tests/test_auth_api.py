from fastapi.testclient import TestClient


def test_register_login_me_logout(client: TestClient, cookie_name: str):
    res = client.post(
        "/api/auth/register",
        json={"email": "user@example.com", "password": "secret12"},
    )
    assert res.status_code == 200
    assert res.json()["email"] == "user@example.com"
    assert cookie_name in res.cookies

    res = client.get("/api/auth/me")
    assert res.status_code == 200
    assert res.json()["email"] == "user@example.com"

    res = client.post("/api/auth/logout")
    assert res.status_code == 200

    res = client.get("/api/auth/me")
    assert res.status_code == 401

    res = client.post(
        "/api/auth/login",
        json={"email": "user@example.com", "password": "secret12"},
    )
    assert res.status_code == 200
    assert cookie_name in res.cookies


def test_register_duplicate_email(client: TestClient):
    payload = {"email": "dup@example.com", "password": "secret12"}
    assert client.post("/api/auth/register", json=payload).status_code == 200
    res = client.post("/api/auth/register", json=payload)
    assert res.status_code == 400


def test_login_wrong_password(client: TestClient):
    client.post(
        "/api/auth/register",
        json={"email": "wrong@example.com", "password": "secret12"},
    )
    res = client.post(
        "/api/auth/login",
        json={"email": "wrong@example.com", "password": "badpass1"},
    )
    assert res.status_code == 401
