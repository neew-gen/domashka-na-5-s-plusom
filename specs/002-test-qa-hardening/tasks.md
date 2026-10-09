# Tasks: Test Coverage, QA Skill & Reactivity Fixes

**Input**: plan.md, spec.md, research.md

## Phase 1: Setup

- [x] T001 Add `backend/tests/conftest.py` (TestClient, get_db override, table lifecycle)
- [x] T002 [P] Add vitest + @vue/test-utils + jsdom; configure `frontend/vite.config.ts`; script `test` in `frontend/package.json`

## Phase 2: US1 Reactivity (P1)

- [x] T003 [US1] Fix `frontend/src/components/tasks/DayColumn/DayColumn.vue` + content key in `WeekBoardPage.vue`
- [x] T004 [US1] Fix mobile `activeDayIso` as computed in `WeekBoardPage.vue`
- [x] T005 [US1] Fix `MoveTaskModal.vue` dayOptions/selectedDate via computed
- [x] T006 [P] [US1] Regression specs: DayColumn + WeekBoardPage reactivity

## Phase 3: US2 Automated tests (P1)

- [x] T007 [P] [US2] `backend/tests/test_security.py`
- [x] T008 [P] [US2] `backend/tests/test_auth_api.py`
- [x] T009 [P] [US2] `backend/tests/test_tasks_api.py`
- [x] T010 [P] [US2] `backend/tests/test_goals_api.py`
- [x] T011 [P] [US2] `backend/tests/test_stats_api.py`
- [x] T012 [P] [US2] Frontend: `date-lib.spec.ts`, `auth.store.spec.ts`, `board.store.spec.ts`
- [x] T013 [P] [US2] Frontend: API class specs (auth/tasks/goals/stats)
- [x] T014 [P] [US2] Frontend: TaskCard spec

## Phase 4: US3 Manual QA skill (P2)

- [x] T015 [US3] Create `.cursor/skills/manual-qa/SKILL.md`

## Phase 5: Verify

- [x] T016 Run pytest + ruff; frontend lint/typecheck/test/build
- [x] T017 Run manual-qa checklist against running app; report results
