from collections.abc import Generator
import os
import re

import pytest
from alembic import command
from alembic.config import Config
from fastapi.testclient import TestClient
from sqlalchemy import create_engine, text

_APP_DB_URL = os.environ.get(
    "DATABASE_URL",
    "postgresql+psycopg://tracker:tracker@localhost:5432/tracker",
)
_TEST_DB_URL = os.environ.get(
    "TEST_DATABASE_URL",
    re.sub(r"/tracker(?=$|\?)", "/tracker_test", _APP_DB_URL, count=1),
)
os.environ["DATABASE_URL"] = _TEST_DB_URL
os.environ.setdefault(
    "SECRET_KEY",
    "test-only-secret-key-min-32-characters-ok",
)


def _ensure_test_database() -> None:
    admin_url = re.sub(r"/tracker_test(?=$|\?)", "/tracker", _TEST_DB_URL, count=1)
    engine = create_engine(admin_url, isolation_level="AUTOCOMMIT")
    with engine.connect() as conn:
        exists = conn.execute(
            text("SELECT 1 FROM pg_database WHERE datname = 'tracker_test'")
        ).scalar()
        if exists is None:
            conn.execute(text("CREATE DATABASE tracker_test"))
    engine.dispose()


def _run_migrations() -> None:
    cfg = Config("alembic.ini")
    cfg.set_main_option("sqlalchemy.url", _TEST_DB_URL)
    command.upgrade(cfg, "head")


_ensure_test_database()
_run_migrations()

import app.models  # noqa: E402, F401
from app.core.config import settings  # noqa: E402
from app.db.session import SessionLocal, engine  # noqa: E402
from app.main import app as fastapi_app  # noqa: E402


@pytest.fixture(autouse=True)
def _clean_db() -> Generator[None, None, None]:
    with engine.begin() as conn:
        conn.execute(text("TRUNCATE TABLE tasks, week_goals, users RESTART IDENTITY CASCADE"))
    yield


@pytest.fixture()
def client() -> TestClient:
    return TestClient(fastapi_app)


@pytest.fixture()
def auth_client(client: TestClient) -> TestClient:
    res = client.post(
        "/api/auth/register",
        json={"email": "tester@example.com", "password": "secret12"},
    )
    assert res.status_code == 200
    return client


@pytest.fixture()
def db_session() -> Generator:
    session = SessionLocal()
    try:
        yield session
    finally:
        session.close()


@pytest.fixture()
def cookie_name() -> str:
    return settings.cookie_name
