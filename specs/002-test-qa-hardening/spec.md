# Feature Specification: Test Coverage, QA Skill & Reactivity Fixes

**Feature Branch**: `002-test-qa-hardening`

**Created**: 2026-10-09

**Status**: Draft

**Input**: User description: Добавить тесты на модули фронта и бэка (scope 1A), project skill manual-qa, проверить проект; починить баги реактивности доски. Использовать SDD.

## User Scenarios & Testing *(mandatory)*

### User Story 1 — Fix board reactivity (Priority: P1)

Пользователь отмечает задачу выполненной, меняет неделю и на мобильном переключает день — UI всегда отражает актуальные данные без перезагрузки страницы.

**Why this priority**: Без корректной реактивности автотесты и manual QA бессмысленны — продукт сломан.

**Independent Test**: Toggle задачи → карточка сразу показывает новый `is_done`; сдвиг недели на mobile → видна колонка активного дня.

**Acceptance Scenarios**:

1. **Given** задача на доске, **When** пользователь отмечает выполненной, **Then** зачёркивание появляется без F5.
2. **Given** открыта неделя A на mobile, **When** переход на неделю B, **Then** отображается колонка дня (сегодня если в неделе, иначе первый workday).
3. **Given** модалка переноса открыта, **When** список дней недели меняется, **Then** опции дней соответствуют текущей неделе.

---

### User Story 2 — Automated module tests (Priority: P1)

Разработчик/агент запускает pytest и vitest и получает зелёный прогон по модулям приложения (API, stores, libs, ключевые компоненты).

**Why this priority**: Регрессии реактивности и API должны ловиться автоматически.

**Independent Test**: `pytest` в backend Docker; `npm test` (vitest) во frontend — оба exit 0.

**Acceptance Scenarios**:

1. **Given** backend с conftest, **When** pytest, **Then** покрыты auth, tasks, goals, stats, security и week helpers.
2. **Given** frontend с vitest, **When** `npm test`, **Then** проходят тесты DateLib, stores, ключевых task-компонентов и API-клиентов.
3. **Given** правила проекта, **When** читаются тестовые файлы, **Then** нет комментариев в тестах; vitest globals без импортов из vitest; stubs только teleport.

---

### User Story 3 — Manual QA skill (Priority: P2)

Агент по запросу «прогони QA» / «manual qa» следует project skill и выдаёт pass/fail чеклист по критическим сценариям продукта.

**Why this priority**: Закрывает пробел между unit-тестами и реальным UI в Docker.

**Independent Test**: Skill существует в `.cursor/skills/manual-qa/`; агент может выполнить чеклист против `localhost:5173`.

**Acceptance Scenarios**:

1. **Given** skill файлы на месте, **When** агент читает SKILL.md, **Then** есть триггеры, чеклист и формат отчёта.
2. **Given** запущенный compose UI, **When** прогон чеклиста, **Then** отчёт содержит pass/fail по пунктам включая реактивность.

---

### Edge Cases

- Смена только `is_done` у той же задачи (id не меняется) — UI обязан обновиться.
- Неделя без «сегодня» (прошлая/будущая) на mobile — выбран первый workday или сохранённый выбранный день, если он в неделе.
- Out of scope: Playwright E2E; отдельный тест на каждый constant/CSS/layout.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: DayColumn MUST отражать актуальный список задач после обновления store без `watch`/`watchEffect`.
- **FR-002**: Mobile активный день MUST быть производным от текущих workdays + явного выбора пользователя.
- **FR-003**: Backend MUST иметь pytest conftest и интеграционные/unit тесты модулей API (auth, tasks, goals, stats) и security.
- **FR-004**: Frontend MUST иметь vitest (globals) и тесты модулей: DateLib, auth/board stores, ключевые components, API classes.
- **FR-005**: Project MUST содержать `.cursor/skills/manual-qa/SKILL.md` с чеклистом и форматом отчёта.
- **FR-006**: После реализации MUST быть прогнаны ruff/pytest и frontend lint/typecheck/test/build; результат задокументирован.

### Key Entities

- Не применимо (тесты и QA поверх существующих User/Task/WeekGoal).

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Toggle done обновляет карточку без перезагрузки.
- **SC-002**: pytest и vitest завершаются с кодом 0.
- **SC-003**: Skill `manual-qa` доступен в репозитории и использован для проверки.
- **SC-004**: Нет регрессий lint/typecheck/build фронта и ruff бэка.

## Assumptions

- Scope тестов — 1A (модули приложения, не каждый файл).
- Skill лежит в проекте (`.cursor/skills/manual-qa/`).
- Тесты backend гоняются через Docker Compose где возможно.
- Существующий MVP 001 не требует новых продуктовых фич кроме фиксов реактивности.
