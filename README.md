# Трекер задач

MVP еженедельного трекера задач (Пн–Пт) по ТЗ из `docs/`.

## Стек

- Backend: FastAPI, SQLAlchemy 2, Alembic, PostgreSQL
- Frontend: Vue 3, Pinia, Vue Router, Tailwind
- Запуск: Docker Compose

## Быстрый старт

```bash
cp .env.example .env
docker compose up --build
```

- Frontend: http://localhost:5173
- API: http://localhost:8000/api/health
- Docs: http://localhost:8000/docs

## SDD

Spec Kit: `.specify/`, фича `specs/001-task-tracker/`.
