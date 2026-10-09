<template>
  <section
    class="day-column flex h-full w-full flex-col"
    :class="{
      'bg-ink/[0.02]': isToday,
      'day-column--editing': isDragLocked,
    }"
  >
    <header class="mb-3 flex items-start justify-between gap-2 border-b border-hairline pb-2">
      <div class="min-w-0">
        <p class="text-xs uppercase tracking-[0.18em] text-ink/50">{{ weekdayLabel }}</p>
        <h3
          class="font-serif text-lg"
          :class="{ 'underline decoration-1 underline-offset-4': isToday }"
        >
          {{ DateLib.formatDayMonth(day) }}
        </h3>
      </div>
      <UIButton
        size="icon"
        variant="primary"
        aria-label="Добавить задачу сверху"
        :disabled="isCreating"
        @click="onStartCreate('top')"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="1.75"
          stroke-linecap="round"
          stroke-linejoin="round"
          class="h-3.5 w-3.5"
          aria-hidden="true"
        >
          <path d="M12 5v14" />
          <path d="M5 12h14" />
        </svg>
      </UIButton>
    </header>

    <TaskCard
      v-if="isCreating && createPlace === 'top'"
      :task="createPlaceholder"
      mode="create"
      @create="onCreate"
      @cancel="onCancelCreate"
    />

    <draggable
      :list="mutableTasks"
      item-key="id"
      class="day-column__list min-h-[120px] w-full min-w-0 flex-1 pb-10"
      group="tasks"
      :disabled="!canDrag || isDragLocked"
      ghost-class="task-card-ghost"
      drag-class="task-card-drag"
      :force-fallback="true"
      :fallback-on-body="true"
      :scroll="true"
      :bubble-scroll="false"
      :empty-insert-threshold="48"
      filter=".task-card__action, .task-card__actions, .task-card__form, .task-card__field"
      :prevent-on-filter="true"
      :delay="80"
      :delay-on-touch-only="false"
      :distance="12"
      @start="onDragStart"
      @end="onDragEnd"
      @change="onChange"
    >
      <template #item="{ element }">
        <TaskCard
          :task="element"
          :can-drag="canDrag && !isDragLocked"
          @toggle="onToggle"
          @delete="emit('delete', $event)"
          @save="onSave"
          @editing="onCardEditing(element.id, $event)"
        />
      </template>
    </draggable>

    <TaskCard
      v-if="isCreating && createPlace === 'bottom'"
      :task="createPlaceholder"
      mode="create"
      @create="onCreate"
      @cancel="onCancelCreate"
    />

    <div class="mt-auto flex justify-center pt-3">
      <UIButton
        size="icon"
        variant="primary"
        aria-label="Добавить задачу снизу"
        :disabled="isCreating"
        @click="onStartCreate('bottom')"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="1.75"
          stroke-linecap="round"
          stroke-linejoin="round"
          class="h-3.5 w-3.5"
          aria-hidden="true"
        >
          <path d="M12 5v14" />
          <path d="M5 12h14" />
        </svg>
      </UIButton>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onBeforeUpdate, ref } from 'vue'
import draggable from 'vuedraggable'

import TaskCard from '@/components/tasks/TaskCard/TaskCard.vue'
import UIButton from '@/components/UI/UIButton/UIButton.vue'
import { WEEKDAY_SHORT } from '@/libs/constants/importance.constant'
import { DateLib } from '@/libs/classes/date-lib'
import type { TImportance, TTask, TTaskCreatePlace } from '@/libs/types/task.type'

const props = defineProps<{
  day: Date
  tasks: TTask[]
  canDrag: boolean
}>()

const emit = defineEmits<{
  toggle: [TTask]
  delete: [TTask]
  move: [TTask]
  create: [
    {
      title: string
      description: string
      importance: TImportance
      deadline: string | null
      task_date: string
      place: TTaskCreatePlace
    },
  ]
  update: [
    number,
    {
      title: string
      description: string
      importance: TImportance
      deadline: string | null
    },
  ]
  reorder: [string, number[]]
  movedIn: [number, string, number[]]
}>()

const dateIso = computed(() => DateLib.toIsoDate(props.day))
const weekdayLabel = computed(() => {
  const index = props.day.getDay() === 0 ? 6 : props.day.getDay() - 1
  return WEEKDAY_SHORT[index]
})
const isToday = computed(() => DateLib.isSameDay(props.day, new Date()))
const buildTaskContentKey = (item: TTask) =>
  `${item.id}:${item.is_done}:${item.title}:${item.description}:${item.importance}:${item.deadline ?? ''}:${item.task_date}`

const buildTasksSyncKey = (list: TTask[]) =>
  list.map((item) => `${buildTaskContentKey(item)}:${item.position}`).join('|')

const mutableTasks = ref<TTask[]>([...props.tasks])
let lastTasksSyncKey = buildTasksSyncKey(props.tasks)
const isCreating = ref(false)
const createPlace = ref<TTaskCreatePlace>('top')
const editingTaskId = ref<number | null>(null)
const isDragLocked = computed(() => isCreating.value || editingTaskId.value !== null)

onBeforeUpdate(() => {
  if (document.body.classList.contains('is-task-dragging')) return
  const nextKey = buildTasksSyncKey(props.tasks)
  if (nextKey === lastTasksSyncKey) return
  lastTasksSyncKey = nextKey

  const prev = mutableTasks.value
  const next = props.tasks
  const sameOrder =
    prev.length === next.length && prev.every((item, index) => item.id === next[index]?.id)

  if (sameOrder) {
    let changed = false
    const merged = next.map((remote, index) => {
      const local = prev[index]
      if (buildTaskContentKey(local) === buildTaskContentKey(remote)) return local
      changed = true
      return { ...remote }
    })
    if (changed) mutableTasks.value = merged
    return
  }

  mutableTasks.value = [...next]
})

const onCardEditing = (taskId: number, active: boolean) => {
  editingTaskId.value = active ? taskId : null
  if (!active) {
    document.body.classList.remove('is-task-dragging')
  }
}

const createPlaceholder = computed<TTask>(() => ({
  id: -1,
  title: '',
  description: '',
  importance: 'medium',
  task_date: dateIso.value,
  deadline: null,
  is_done: false,
  position: 0,
  deleted_at: null,
  created_at: '',
}))

const onStartCreate = (place: TTaskCreatePlace) => {
  createPlace.value = place
  isCreating.value = true
}

const onCancelCreate = () => {
  isCreating.value = false
}

const onCreate = (payload: {
  title: string
  description: string
  importance: TImportance
  deadline: string | null
}) => {
  emit('create', {
    ...payload,
    task_date: dateIso.value,
    place: createPlace.value,
  })
  isCreating.value = false
}

const onSave = (
  task: TTask,
  payload: {
    title: string
    description: string
    importance: TImportance
    deadline: string | null
  },
) => {
  emit('update', task.id, payload)
}

const onToggle = (task: TTask) => {
  emit('toggle', task)
}

const lockDragWidth = (item: HTMLElement) => {
  const measured = item.getBoundingClientRect().width
  item.style.width = `${measured}px`
  window.requestAnimationFrame(() => {
    document.querySelectorAll<HTMLElement>('.task-card-drag').forEach((el) => {
      const styles = window.getComputedStyle(el)
      const pad =
        (Number.parseFloat(styles.paddingLeft) || 0) +
        (Number.parseFloat(styles.paddingRight) || 0)
      el.style.boxSizing = 'border-box'
      el.style.width = `${measured + pad}px`
    })
  })
}

const clearDragWidth = (item: HTMLElement) => {
  item.style.width = ''
}

const onDragStart = (event: { item: HTMLElement }) => {
  document.body.classList.add('is-task-dragging')
  window.getSelection()?.removeAllRanges()
  lockDragWidth(event.item)
}

const onDragEnd = (event: { item: HTMLElement }) => {
  document.body.classList.remove('is-task-dragging')
  clearDragWidth(event.item)
  document.querySelectorAll<HTMLElement>('.task-card-drag').forEach((el) => {
    el.style.width = ''
  })
}

onBeforeUnmount(() => {
  document.body.classList.remove('is-task-dragging')
})

const onChange = (event: {
  added?: { element: TTask }
  moved?: { element: TTask }
}) => {
  const orderedIds = mutableTasks.value.map((item) => item.id)
  if (event.added) {
    emit('movedIn', event.added.element.id, dateIso.value, orderedIds)
    return
  }
  if (event.moved) {
    emit('reorder', dateIso.value, orderedIds)
  }
}
</script>

<style>
.day-column--editing {
  position: relative;
  z-index: 40;
}

.day-column--editing .task-card:not(.task-card--form):hover,
.day-column--editing .task-card:not(.task-card--form):focus-within {
  z-index: 0;
}

.task-card-ghost {
  opacity: 0.35;
}

.day-column__list {
  overflow: visible;
}

.task-card-drag {
  box-sizing: border-box !important;
  padding-left: 0.75rem;
  padding-right: 0.75rem;
  opacity: 1 !important;
  background: var(--color-paper);
  box-shadow: 0 0 0 1px var(--color-hairline);
  transform: scale(0.96);
  transform-origin: center center;
  cursor: grabbing;
  user-select: none;
  z-index: 100 !important;
}

body.is-task-dragging {
  cursor: grabbing;
  user-select: none;
}

body.is-task-dragging .task-card__description {
  overflow: hidden;
  pointer-events: none;
}

body.is-task-dragging .task-card {
  user-select: none;
}
</style>
