# Tasks: Task Tracker MVP

**Input**: plan.md, spec.md

## Phase 0 — Scaffold

- [x] T001 Create `docker-compose.yml`, `.env.example`, backend/frontend Dockerfiles
- [x] T002 [P] Backend pyproject: FastAPI stack + ruff + pytest skeleton
- [x] T003 [P] Frontend Vite Vue TS + Pinia + Tailwind + ESLint/Prettier + CK `src/` tree

## Phase 1 — US1 Auth & board

- [x] T004 Models + Alembic initial migration (users, tasks, week_goals)
- [x] T005 [US1] Auth register/login/logout JWT cookie + `/api/auth/me`
- [x] T006 [US1] Tasks CRUD + list by week + toggle done + reorder endpoint
- [x] T007 [US1] Frontend auth pages + app layout masthead
- [x] T008 [US1] Week board Пн–Пт, create/edit/delete UI, week nav, today highlight

## Phase 2 — US2 DnD, trash, search

- [x] T009 [US2] Soft-delete, restore, purge deleted API
- [x] T010 [US2] Move task (date) + position update API
- [x] T011 [US2] Frontend DnD (desktop), mobile move menu, Deleted page, search

## Phase 3 — US3 Goals & dashboard

- [x] T012 [US3] Week goals API + auto-carry incomplete to opened week
- [x] T013 [US3] Week stats API
- [x] T014 [US3] Frontend goals block + dashboard strip + donut

## Phase 4 — Polish & verify

- [x] T015 Design skill + apply NYT tokens/CSS variables
- [x] T016 Backend tests (auth + tasks smoke) + ruff
- [x] T017 Frontend lint/typecheck + docker compose smoke
