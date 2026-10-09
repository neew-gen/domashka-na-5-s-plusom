# Инструкции для AI-агента

## 1. Общие правила

- Перед выполнением задачи сначала изучи относящуюся к ней документацию проекта.
- Не начинай изменять код, пока не понял требования задачи.
- Реализуй только то, что требуется текущей задачей или текущей фазой.
- Не реализуй функциональность следующих фаз заранее.
- Не усложняй решение без необходимости.
- Проект является MVP, поэтому предпочитай простые и понятные решения.
- Следуй существующей архитектуре и стилю проекта.
- Коммиты — только по явной просьбе пользователя.

## 2. Документация проекта

Основная документация: `docs/`.

- Требования: `docs/requirements.md`, уточнения: `docs/qa.md`
- Планы: `docs/01-infrastructure.md`, `docs/02-backend.md`, `docs/03-frontend.md`
- SDD: `.specify/`, `specs/`, skills `speckit-*`
- Конституция: `.specify/memory/constitution.md`
- Стиль фронта: `frontend/CODE-STYLE.md`
- Дизайн с ИИ: `.cursor/skills/ai-design-best-practices/`

Документация проекта — источник требований. Не придумывай новые требования самостоятельно.

## 3. Стек

- Backend: FastAPI, SQLAlchemy 2.x, Alembic, PostgreSQL
- Frontend: Vue 3, TypeScript, Vite, Pinia, Vue Router, Tailwind, VeeValidate + Zod
- Запуск: Docker Compose

## 4. Backend

Сохраняй разделение: router → service → repository → schemas → models.
Не помещай бизнес-логику в FastAPI routers.
При изменении моделей — Alembic migration.

## 5. Frontend

Следуй `frontend/CODE-STYLE.md` и структуре castle-keepers (адаптированной).
Работу с API — через `api/apis/*` и Pinia stores.
Не добавляй новый state manager.
Перед UI — читай skill `ai-design-best-practices` и референс NYTimes editorial.

## 6. Проверка изменений

Backend: pytest, ruff.
Frontend: lint, typecheck, tests, build.
Не утверждай успех проверки, если команда не запускалась.
В тестах не пиши комментарии.

## 7. Завершение задачи

Кратко сообщи: что реализовано, какие файлы, какие проверки, известные ограничения.
