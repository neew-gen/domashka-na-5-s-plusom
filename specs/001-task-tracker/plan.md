# Implementation Plan: Task Tracker MVP

**Branch**: `001-task-tracker` | **Date**: 2026-10-09 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/001-task-tracker/spec.md`

## Summary

MVP трекера задач: FastAPI + PostgreSQL + Vue 3 (Pinia), всё в Docker. UI — editorial NYTimes (мастхед, hairline, полоса дашборд+цели, 5 колонок дней).

## Technical Context

**Language/Version**: Python 3.12, TypeScript 5.x / Vue 3

**Primary Dependencies**: FastAPI, SQLAlchemy 2, Alembic, passlib/bcrypt, PyJWT; Vue 3, Vite, Pinia, Vue Router, Axios, Tailwind, VeeValidate, Zod, vuedraggable

**Storage**: PostgreSQL 16

**Testing**: pytest, ruff; frontend eslint/prettier/vue-tsc (smoke)

**Target Platform**: Docker Compose (linux containers), browser desktop + mobile adaptive

## Constitution Check

- SDD artifacts present before implement
- Backend layers respected
- Frontend follows CODE-STYLE
- Docker-only runtime
- No commits unless asked

## Project Structure

```text
backend/
  app/
    main.py
    core/          # config, security, deps
    db/            # session, base
    models/
    schemas/
    repositories/
    services/
    routers/
  alembic/
  tests/
  Dockerfile
  pyproject.toml
frontend/
  src/             # CK-style tree
  Dockerfile
  package.json
docker-compose.yml
```

## Design

- NYTimes editorial; skill `ai-design-best-practices` before UI
- Desktop C: top strip dashboard+goals; 5 day columns
- Mobile M2: stack + simplified move; DnD ≥md
- Importance: muted color + full words

## Data Model

See spec Key Entities. Indexes on `(user_id, task_date)`, `(user_id, deleted_at)`, `(user_id, week_start)`.
