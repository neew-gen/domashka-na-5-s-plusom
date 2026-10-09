# Implementation Plan: Test Coverage, QA Skill & Reactivity Fixes

**Branch**: `002-test-qa-hardening` | **Date**: 2026-10-09 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/002-test-qa-hardening/spec.md`

## Summary

Починить реактивность доски без `watch`; добавить pytest conftest + API/security тесты; vitest + модульные тесты фронта; project skill `manual-qa`; полный прогон проверок.

## Technical Context

**Language/Version**: Python 3.12, TypeScript 5.x / Vue 3

**Primary Dependencies**: FastAPI, SQLAlchemy 2, pytest, httpx; Vue 3, Pinia, vitest, @vue/test-utils, jsdom

**Storage**: PostgreSQL (тесты — override get_db, отдельная сессия/rollback или recreate tables)

**Testing**: pytest (backend), vitest globals (frontend); no comments in tests; stubs only teleport

**Target Platform**: Docker Compose

**Project Type**: web application (backend + frontend)

**Constraints**: No watch/watchEffect; CODE-STYLE; Docker-only runtime; no commits unless asked

**Scale/Scope**: Module-level coverage (1A); manual QA checklist for MVP flows

## Constitution Check

- SDD artifacts before code: pass
- Backend layers: tests hit routers via TestClient; services via API
- Frontend CODE-STYLE + test.mdc: pass
- Docker-only: pytest via compose exec preferred
- No commits unless asked: pass

## Project Structure

```text
specs/002-test-qa-hardening/
  spec.md
  plan.md
  research.md
  quickstart.md
  checklists/
  tasks.md
backend/tests/
  conftest.py
  test_*.py
frontend/
  vite.config.ts          # + vitest
  package.json            # + test script
  src/**/*.spec.ts|vue
.cursor/skills/manual-qa/
  SKILL.md
```

## Design

### Reactivity
- DayColumn: content signature `:key` from parent + local drag list remount; strengthen key beyond ids.
- WeekBoardPage: `selectedDayIso` ref + `activeDayIso` computed from `board.workdays`.
- MoveTaskModal: `dayOptions` as computed; `selectedDate` init from props via remount/`v-if`.

### Backend tests
- conftest: engine from settings, create/drop tables or truncate; TestClient; auth cookie helper.
- Files: test_auth_api, test_tasks_api, test_goals_api, test_stats_api, test_security (+ existing helpers/health).

### Frontend tests
- vitest in vite.config; script `test`.
- Specs: date-lib, auth.store, board.store, DayColumn, TaskCard, API classes (mocked client).

### Manual QA
- Skill with Russian checklist aligned to docs/qa.md + reactivity cases.
