# Task Tracker Constitution

## Core Principles

### I. Package Boundaries
- **`backend/`** — FastAPI API, SQLAlchemy models, Alembic migrations, services, repositories
- **`frontend/`** — Vue 3 UI, Pinia stores, API client

Cross-cutting types for API contracts live in backend schemas and frontend `libs/types/`. Do not invent a shared package unless needed.

### II. Code Style (NON-NEGOTIABLE)
- Frontend: [`frontend/CODE-STYLE.md`](../../frontend/CODE-STYLE.md) and `.cursor/rules/` (files, composables, class-methods-order, test)
- Backend: router → service → repository; no business logic in routers; SQLAlchemy 2.x style
- Agents MUST re-read CODE-STYLE before writing frontend code

### III. Minimal Scope, Maximum Traceability
Specs define what/why; plans define how; tasks define file-level work. No unrelated changes.

### IV. SDD Before Code
Non-trivial work: `constitution check → specify → plan → tasks → implement`.
No production feature code without `spec.md`, `plan.md`, and `tasks.md` under `specs/`.

### V. Docker-Only Runtime
App services run via Docker Compose (`db`, `backend`, `frontend`). Local ad-hoc interpreters are for one-off tooling only.

### VI. No Commits Unless Asked
Agents MUST NOT create git commits unless the user explicitly requests it.

### VII. Test Conventions
- Backend: pytest; no comments in test bodies
- Frontend: vitest globals (no vitest imports); no stubs except teleport; no comments in tests

## Operational Constraints

- Secrets MUST NOT be committed; use env / `.env.example`
- UI language: Russian
- No abbreviations in UI copy except weekday names
- Design: NYTimes editorial; read `.cursor/skills/ai-design-best-practices/` before UI work

## Delivery Workflow

1. Update or create Spec Kit artifacts
2. Implement tasks in order
3. Run lint / typecheck / tests via Docker where possible
4. Report what changed and what was verified
