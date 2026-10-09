# Research: 002-test-qa-hardening

## Decision: Backend test DB strategy

**Choice**: Use the same PostgreSQL URL from settings with `Base.metadata.create_all` / drop_all (or truncate) per session in conftest; override `get_db`.

**Rationale**: Models use Postgres enums; SQLite would need dialect workarounds. Compose DB is already required by constitution.

**Alternative rejected**: SQLite in-memory — enum/`Date` quirks.

## Decision: DayColumn sync without watch

**Choice**: Parent `:key` includes task content fingerprint (`id`, `is_done`, `description`, `deadline`, order); DayColumn keeps local `ref` for vuedraggable mutations.

**Rationale**: vuedraggable needs a mutable array; watch forbidden; remount resets local copy after `loadWeek`.

## Decision: activeDayIso

**Choice**: `selectedDayIso` user override + computed that validates against `board.workdays`, fallback today-in-week else first workday.

**Rationale**: Survives week shift without watch.

## Decision: Frontend test scope 1A

**Choice**: DateLib, stores, DayColumn, TaskCard, API modules; skip pure constants/CSS/layouts.

**Rationale**: User confirmed 1A.
