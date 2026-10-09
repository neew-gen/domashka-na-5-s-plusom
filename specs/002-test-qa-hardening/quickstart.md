# Quickstart: 002-test-qa-hardening

## Backend tests

```bash
docker compose exec backend pytest
docker compose exec backend ruff check .
```

## Frontend tests

```bash
docker compose exec frontend npm test
docker compose exec frontend npm run lint
docker compose exec frontend npm run typecheck
docker compose exec frontend npm run build
```

## Manual QA

Запустить compose, открыть http://localhost:5173, следовать `.cursor/skills/manual-qa/SKILL.md`.
