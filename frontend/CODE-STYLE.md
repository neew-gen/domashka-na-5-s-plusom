# Стиль написания кода фронтенда (Frontend Code Style)

Документ описывает принятые в проекте соглашения по структуре, именованию и паттернам кода во фронтенд-пакете.

---

## Стек и окружение

- **Vue 3** (Composition API), **TypeScript**, **Vite**
- **Pinia** — состояние, **Vue Router** — маршруты
- **Tailwind CSS** + **SCSS** (scoped) для стилей
- **VeeValidate** + **Zod** для форм
- **lodash** — только через `import _ from 'lodash'` (не именованные импорты)
- Общие типы и константы — пакет `@/libs/types`

---

## Структура `src/`

```
src/
├── api/                 # HTTP-клиент и API-модули
│   ├── api.client.ts    # экземпляр axios (apiClient)
│   └── apis/            # по доменам: auth/, tasks/
├── components/          # переиспользуемые компоненты
│   ├── UI/              # примитивы интерфейса (UIButton, UIInput, UISelect, …)
│   ├── shared/          # общие компоненты (Player, Items, Notifications, …)
│   ├── game/            # игровая логика (Army, Forge, Guild, Trade, …)
│   ├── admin/           # админка
│   ├── auth/            # авторизация
│   └── public/          # публичные страницы
├── layouts/             # layout-компоненты (auth/, tasks/, shared/)
├── libs/                # утилиты, константы, типы, composables, stores
│   ├── assets/styles/   # общие SCSS (shared.scss, переменные)
│   ├── classes/
│   ├── composables/
│   ├── configs/
│   ├── constants/
│   ├── methods/
│   ├── stores/
│   └── types/
├── pages/               # страницы по доменам (auth/, tasks/, shared/, redirect/)
└── router/              # routes, guards
```

- Импорты из `src` — через алиас **`@/`** (например `@/components/UI/UIButton/UIButton.vue`, `@/libs/stores/...`).

---

## Vue-компоненты

### Общие правила

- **Только `<script setup lang="ts">`** — Composition API, без Options API.
- Порядок блоков: **template** → **script** → **style**.
- **Внутри компонента (`<script setup>`) — только стрелочные функции** (`const foo = () => {}` / `const foo = (x: T) => ...`). Объявления через `function foo()` **запрещены**.
- Именование файлов компонентов: **PascalCase**, один «главный» компонент в папке с тем же именем, например:
  - `components/UI/UIButton/UIButton.vue`
  - `components/shared/Player/PlayerShortInfo.vue`
  - `pages/game/Army/ArmyPage.vue`
- **`watch` / `watchEffect` запрещены по умолчанию** — только крайний случай. Сначала: обработчик события / метод в месте изменения; `computed`; mount / remount через `v-if`; при необходимости `defineExpose` + явный вызов с родителя. Нельзя заводить `watch` ради focus, синхронизации моделей, «подчистить state при null» и похожих side-effect’ов, которые можно вызвать напрямую. Допустим лишь если значение меняется снаружи и без подписки поведение выразить нельзя.

### Props и эмиты

- Порядок в `<script setup>` сразу после импортов: **`defineModel` → `defineProps` → остальное** (`defineEmits`, composables, `ref`/`computed`, функции). `defineModel` — сразу сверху, над props.
- Props — через `defineProps<T>()` с типизацией.
- Дефолты — через **`withDefaults(defineProps<...>(), { ... })`**.
- Эмиты — через **`defineEmits<{ eventName: [payload?] }>()`** с типами. В кортеже payload **без имён аргументов**: `saved: [TFoo]`, не `saved: [response: TFoo]`.
- Для компонентов, пробрасывающих атрибуты на корневой элемент, использовать **`defineOptions({ inheritAttrs: false })`** и при необходимости явно прокидывать `v-bind="$attrs"` на нужный элемент.

Пример:

```vue
<script setup lang="ts">
import { useSomething } from '@/libs/composables/use-something'

defineOptions({
  inheritAttrs: false,
})

const model = defineModel<string | null>()

const props = withDefaults(
  defineProps<{
    type?: TUIButtonType
    size?: TUISize
    disabled?: boolean
  }>(),
  {
    type: 'default',
    size: 'normal',
  },
)

const emit = defineEmits<{
  click: []
}>()
</script>
```

### Слоты

- Именованные слоты — через `#slotName` в шаблоне и `<slot name="slotName" />`.
- Проверка наличия слота — через утилиту **`checkIsSlotFilled(slots.slotName)`** из `@/libs/methods/slots.method`.
- Слоты с данными: `<template #row="{ item }">` и т.п.

### Компоненты UI

- В первую очередь использовать компоненты из **`components/UI`** (UIButton, UIInput, UISelect, UIModal, UIPopover, UITable, UIPagination, UILoader и т.д.).
- Типы для UI (размеры, варианты кнопок и т.п.) — в **`@/libs/types/shared/ui.type.ts`**.

---

## Стили

- **В основном Tailwind** — основной приоритет для стилей; утилитарные классы в разметке (отступы, сетки, типографика, цвета из дизайн-системы). Классы не лепить: использовать по необходимости, без нагромождения.
- **SCSS** — для компонентных стилей в блоке `<style scoped lang="scss">`, когда Tailwind недостаточно.
- Общие миксины/функции — подключать через **`@use '@/libs/assets/styles/shared.scss' as *`** (например функция `spacing()`).
- Цвета/переменные — через CSS-переменные (`var(--color-background)`, `var(--color-red-50)` и т.д.).

---

## Типы и классы

- **Типы** хранятся только в файлах с типами: **`libs/types/`** (по доменам: shared, game, auth, public); общие типы запросов/ответов API — в **`@/libs/types`**. В остальных слоях типы не описывают — только импортируют:
  - **API** (`api/apis/`) — типы из common или `@/libs/types/`.
  - **Stores** (`libs/stores/`) — типы из common (и при необходимости из `@/libs/types/`).
  - **Composables** (`libs/composables/`) — типы из `@/libs/types/` (например `use-form.type.ts`) или common.
  - **Компоненты, страницы** — типы из common или `@/libs/types/`.
- **Классы** (доменная логика, утилиты со статическими методами) — в **`libs/classes/`** (суффикс `-lib` или `-service` в имени файла). В **`api/apis/`** лежат только API-классы — вызовы `apiClient`, без описания типов и без переноса туда логики из `libs/classes/`.
- **Константы** — в **`libs/constants/`** по доменам (auth, tasks, shared); типы для констант при необходимости в `libs/types/`.
- **Методы** (чистые функции) — в **`libs/methods/`** (суффикс `.method.ts`); типы параметров/возврата — из `libs/types/` или common, в файле метода типы не объявляют.
- **Discriminant union:** диспетчеризация по `action.type` / `item.type` и т.п. — через `switch`, не цепочку `if (x.type === ...)`.

---

## API-слой

- Базовый клиент — **`apiClient`** из **`@/api/api.client`**.
- Модули API — классы со **статическими методами**, сгруппированные по домену в `api/apis/` (admin, auth, game, public). Внутри только вызовы `apiClient`, типы — в файлах типов или common.
- Возвращаемые типы — из **`@/libs/types/`** (не дублировать типы ответов в api-слое).
- Переменная ответа от API — всегда **`res`** (`const res = await AdminApi.foo(...)` / `apiClient.get(...)`), не `response`. В интерцепторах допустимо `res` для response и `req` для request.

Пример:

```ts
import { apiClient } from '@/api/api.client'

export class EnergyApi {
  public static async restore(): Promise<void> {
    await apiClient.post('/player-energy/restore')
  }
}
```

Для GET с query-параметрами:

```ts
const res = await apiClient.get('/admin/players-money', { params: query })
return res.data
```

---

## Состояние (Pinia)

- Stores — в **`libs/stores/modules/`** (или в подпапках по фичам).
- Определение через **`defineStore('name', () => { ... })`** (composition-style): `ref`, `computed`, функции, return объекта.
- Именование: **`useXxxStore`** (например `useAuthStore`, `useTasksStore`).

---

## Роутинг

- Константы путей и имён страниц — в **`@/libs/types`** (PAGES, PAGES_ADMIN и т.д.).
- Роуты описываются в **`libs/router/routes/`** по доменам (auth, tasks, shared).
- Ленивая загрузка страниц: **`component: () => import('@/pages/...')`**.
- Для страницы с параметрами маршрута использовать **`props: true`** при необходимости.

---

## Composables

- Файлы в **`libs/composables/`**, именование **`useXxx`** (например `useForm`, `useWeekNavigation`).
- Возвращают объект с ref/computed и методами; при работе с формами и глубокими объектами использовать **lodash** (`_.set`, `_.cloneDeep`, `_.unset` и т.д.) через **`import _ from 'lodash'`**.
- **Не выносить одноразовый `computed` в composable.** Если computed нужен только в одном компоненте — оставляй его в этом компоненте. Отдельный файл в `libs/composables/` — только когда одна и та же логика реально переиспользуется в нескольких местах.
- **Из файла composable наружу экспортируется только сам composable** (`export const useXxx = …`). Локальные хелперы в том же файле — без `export`. Функции, которые нужны снаружи (в stores, api, других libs) — в **`libs/classes/*-lib.ts`** (class lib); composable импортирует их оттуда. Нельзя импортировать «просто функции» из файла composable.

---

## Страницы

- Страницы — в **`pages/`**, разбиты по доменам: **game**, **admin**, **auth**, **public**, **redirect**.
- Именование: **XxxPage.vue** для корневой страницы (например `ArmyPage.vue`, `AdminMultiAccountMonitoringReportListPage.vue`).
- Загрузка данных через Pinia stores и API-классы (`api/apis/*`). Страницы не должны раздуваться — выноси UI в `components/tasks` / `components/auth`.
- Результат API всегда в переменной `res`.

---

## Тесты

- Файлы тестов рядом с компонентом: **`ComponentName.spec.ts`**.
- **Не импортировать** ничего из `vitest` в тестах (describe, it, expect и т.д. уже глобальные).
- Использовать **`mount`** из **`@vue/test-utils`**.
- **Не использовать stubs**, кроме **`teleport: true`** для модалок/телепортов.
- Описания кейсов на русском: «рендерится с текстом по умолчанию», «эмитит событие click при нажатии» и т.п.

---

## Именование

- **Компоненты и файлы компонентов** — PascalCase.
- **Переменные, функции, composables, stores** — camelCase.
- **Константы** — UPPER_SNAKE_CASE (в т.ч. константы маршрутов/опций из common).
- **Типы** — префикс **T** (TUIButtonType, TGameData, TAdminPlayersQuery).
- **Enum-подобные объекты/типы** — префикс **E** (EImportance, EWeekday).

**Говорящие, полные имена:** везде использовать осмысленные, расширенные имена; избегать сокращений (по духу как в правилах проекта для SQL — полные имена). В колбэках не использовать однобуквенные аббревиатуры вроде `r`, `s`, `p` — писать полностью (например `response`, `item`, `option`). Исключение: для аргумента ошибки в catch / catchCb допустимо `e` или полное `error`.

**Методы массивов** (.map, .filter, .find, .some, .forEach): в колбэке параметр — **`item`** для «просто элемента списка» или **осмысленное имя сущности** (`option`, `column`, `gear`, `mission`, `key`, `permission` и т.д.), но не однобуквенные имена.

---

## Прочее

- Роуты и ссылки — по **name** и при необходимости **params/query**, используя константы из **PAGES**.
- Для работы с query-параметрами в страницах — **`useRouteQuery`** из **`@vueuse/router`**.
- Типы API и домена — в **`@/libs/types/`**; UI-типы там же в `shared/`.
- **Приведение типов (`as`):** по возможности не использовать; только если тип действительно сложно вывести или выразить иначе (крайний случай).
