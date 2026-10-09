<template>
  <section class="min-w-0 overflow-hidden border border-hairline p-3">
    <div class="mb-2 flex min-h-7 items-center justify-between gap-2">
      <form
        v-if="isAdding"
        class="flex min-w-0 flex-1 items-center gap-2"
        @submit.prevent="onAdd"
        @keydown.escape.prevent="onCancelAdd"
      >
        <button
          type="button"
          class="goal-icon-btn"
          aria-label="Отмена"
          @click="onCancelAdd"
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
            <path d="M18 6 6 18" />
            <path d="m6 6 12 12" />
          </svg>
        </button>
        <input
          ref="addInputRef"
          v-model="text"
          type="text"
          class="box-border h-7 min-w-0 flex-1 border border-hairline bg-paper px-2 text-sm text-ink outline-none focus:border-ink"
          placeholder="Новая цель недели"
          lang="ru"
          :maxlength="GOAL_TEXT_MAX_LENGTH"
        />
        <button
          type="submit"
          class="goal-icon-btn goal-icon-btn--primary"
          aria-label="Сохранить"
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
        </button>
      </form>
      <template v-else>
        <div class="flex min-w-0 items-baseline gap-3">
          <h2 class="font-serif text-base">Цели недели</h2>
          <p class="text-xs text-ink/60">{{ doneCount }} из {{ goals.length }} выполнено</p>
        </div>
        <button
          type="button"
          class="goal-icon-btn goal-icon-btn--primary"
          aria-label="Добавить"
          @click="onStartAdd"
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
        </button>
      </template>
    </div>

    <ul ref="listRef" class="max-h-[calc(3*2.75rem)] space-y-0 overflow-y-auto">
      <li
        v-for="goal in sortedGoals"
        :key="goal.id"
        :data-goal-id="String(goal.id)"
        class="goal-row group relative flex h-[2.75rem] min-w-0 items-center gap-2 border-b border-hairline sm:gap-3"
        :class="{ 'goal-row--flash': flashId === goal.id }"
      >
        <div class="flex min-w-0 flex-1 items-center gap-2 overflow-hidden">
          <input
            type="checkbox"
            class="goal-checkbox h-4 w-4 shrink-0 cursor-pointer appearance-none border border-hairline bg-paper transition checked:border-success checked:bg-success focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-1 focus-visible:outline-ink"
            :checked="goal.is_done"
            :aria-label="goal.text"
            :disabled="isAnimating"
            @pointerdown="onBurstPointer"
            @change="onToggle(goal)"
          />
          <input
            v-if="editingId === goal.id"
            ref="editInputRef"
            v-model="editDraft"
            type="text"
            class="min-w-0 flex-1 border border-hairline bg-paper px-2 py-1 font-serif text-sm outline-none focus:border-ink"
            :maxlength="GOAL_TEXT_MAX_LENGTH"
            @keydown.enter.prevent="onSaveEdit(goal)"
            @keydown.escape.prevent="onCancelEdit"
            @blur="onSaveEdit(goal)"
          />
          <span
            v-else
            class="min-w-0 flex-1 truncate font-serif text-sm"
            :class="{ 'text-success line-through': goal.is_done }"
          >
            {{ goal.text }}
          </span>
        </div>

        <div class="goal-actions shrink-0">
          <button
            type="button"
            class="goal-actions__btn"
            aria-label="Редактировать"
            @mousedown.prevent
            @click="onStartEdit(goal)"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="1.75"
              stroke-linecap="round"
              stroke-linejoin="round"
              class="h-4 w-4"
              aria-hidden="true"
            >
              <path d="M12 20h9" />
              <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z" />
            </svg>
          </button>
          <button
            type="button"
            class="goal-actions__btn goal-actions__btn--danger"
            aria-label="Удалить"
            @mousedown.prevent
            @click="emit('remove', goal.id)"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="1.75"
              stroke-linecap="round"
              stroke-linejoin="round"
              class="h-4 w-4"
              aria-hidden="true"
            >
              <path d="M3 6h18" />
              <path d="M8 6V4h8v2" />
              <path d="M19 6l-1 14H6L5 6" />
              <path d="M10 11v6" />
              <path d="M14 11v6" />
            </svg>
          </button>
        </div>
      </li>
    </ul>
  </section>
</template>

<script setup lang="ts">
import { computed, nextTick, ref, useTemplateRef } from 'vue'

import { spawnSuccessBurst } from '@/libs/classes/success-burst-lib'
import { GOAL_TEXT_MAX_LENGTH } from '@/libs/constants/limits.constant'
import type { TWeekGoal } from '@/libs/types/task.type'

const props = defineProps<{
  goals: TWeekGoal[]
  doneCount: number
}>()

const emit = defineEmits<{
  add: [string]
  toggle: [TWeekGoal]
  remove: [number]
  update: [{ id: number; text: string }]
}>()

const text = ref('')
const isAdding = ref(false)
const editingId = ref<number | null>(null)
const editDraft = ref('')
const flashId = ref<number | null>(null)
const burstClient = ref({ x: 0, y: 0 })
const isAnimating = ref(false)
const optimisticDoneIds = ref<number[]>([])
const completionOrder = ref<Record<number, number>>({})
const completionSeq = ref(0)
const editInputRef = useTemplateRef('editInputRef')
const addInputRef = useTemplateRef('addInputRef')
const listRef = useTemplateRef('listRef')

const sortGoals = (goals: TWeekGoal[]) =>
  [...goals].sort((left, right) => {
    if (left.is_done !== right.is_done) return Number(left.is_done) - Number(right.is_done)

    if (left.is_done) {
      const leftRank = completionOrder.value[left.id] ?? 0
      const rightRank = completionOrder.value[right.id] ?? 0
      if (leftRank !== rightRank) return rightRank - leftRank
      return right.id - left.id
    }

    const byCreated = right.created_at.localeCompare(left.created_at)
    if (byCreated !== 0) return byCreated
    return right.id - left.id
  })

const sortedGoals = computed(() => {
  const optimistic = new Set(optimisticDoneIds.value)
  const goals = props.goals.map((goal) =>
    optimistic.has(goal.id) ? { ...goal, is_done: true } : goal,
  )
  return sortGoals(goals)
})

const capturePositions = () => {
  const map = new Map<string, DOMRect>()
  listRef.value?.querySelectorAll<HTMLElement>('[data-goal-id]').forEach((el) => {
    const id = el.dataset.goalId
    if (!id) return
    map.set(id, el.getBoundingClientRect())
  })
  return map
}

const playFlip = async (first: Map<string, DOMRect>) => {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

  const elements = listRef.value?.querySelectorAll<HTMLElement>('[data-goal-id]')
  if (!elements?.length) return

  elements.forEach((el) => {
    const id = el.dataset.goalId
    if (!id) return
    const firstRect = first.get(id)
    if (!firstRect) return
    const lastRect = el.getBoundingClientRect()
    const dy = firstRect.top - lastRect.top
    if (Math.abs(dy) < 1) return
    el.style.transition = 'transform 0s'
    el.style.transform = `translateY(${dy}px)`
  })

  await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()))
  await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()))

  elements.forEach((el) => {
    el.style.transition = 'transform 420ms cubic-bezier(0.22, 1, 0.36, 1)'
    el.style.transform = ''
  })

  await new Promise<void>((resolve) => {
    window.setTimeout(resolve, 430)
  })

  elements.forEach((el) => {
    el.style.transition = ''
  })
}

const onBurstPointer = (event: PointerEvent) => {
  burstClient.value = {
    x: event.clientX,
    y: event.clientY,
  }
}

const onToggle = async (goal: TWeekGoal) => {
  if (isAnimating.value) return

  if (goal.is_done) {
    optimisticDoneIds.value = optimisticDoneIds.value.filter((id) => id !== goal.id)
    const nextOrder = { ...completionOrder.value }
    delete nextOrder[goal.id]
    completionOrder.value = nextOrder
    emit('toggle', goal)
    return
  }

  isAnimating.value = true
  const first = capturePositions()
  completionSeq.value += 1
  completionOrder.value = { ...completionOrder.value, [goal.id]: completionSeq.value }
  optimisticDoneIds.value = [...optimisticDoneIds.value, goal.id]
  flashId.value = goal.id
  spawnSuccessBurst(burstClient.value.x, burstClient.value.y)
  emit('toggle', goal)

  await nextTick()
  await playFlip(first)

  flashId.value = null
  isAnimating.value = false
  optimisticDoneIds.value = optimisticDoneIds.value.filter(
    (id) => !props.goals.some((item) => item.id === id && item.is_done),
  )
}

const onStartAdd = async () => {
  isAdding.value = true
  await nextTick()
  addInputRef.value?.focus()
}

const onCancelAdd = () => {
  isAdding.value = false
  text.value = ''
}

const onAdd = () => {
  const value = text.value.trim()
  if (!value) return
  emit('add', value)
  text.value = ''
  isAdding.value = false
}

const onStartEdit = async (goal: TWeekGoal) => {
  editingId.value = goal.id
  editDraft.value = goal.text
  await nextTick()
  editInputRef.value?.focus()
  editInputRef.value?.select()
}

const onCancelEdit = () => {
  editingId.value = null
  editDraft.value = ''
}

const onSaveEdit = (goal: TWeekGoal) => {
  if (editingId.value !== goal.id) return
  const value = editDraft.value.trim()
  editingId.value = null
  editDraft.value = ''
  if (!value || value === goal.text) return
  emit('update', { id: goal.id, text: value })
}
</script>

<style scoped>
.goal-checkbox:checked {
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16' fill='none' stroke='%23f7f7f4' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M3.5 8.5 6.5 11.5 12.5 4.5'/%3E%3C/svg%3E");
  background-position: center;
  background-repeat: no-repeat;
  background-size: 0.75rem 0.75rem;
}

.goal-row {
  z-index: 0;
  overflow: visible;
}

.goal-row--flash {
  z-index: 2;
  animation: goal-success-flash 480ms ease-out;
}

@keyframes goal-success-flash {
  0% {
    background-color: color-mix(in srgb, var(--color-success) 0%, transparent);
  }
  30% {
    background-color: color-mix(in srgb, var(--color-success) 12%, transparent);
  }
  100% {
    background-color: transparent;
  }
}

@media (prefers-reduced-motion: reduce) {
  .goal-row--flash {
    animation: none;
  }
}

.goal-icon-btn {
  display: inline-flex;
  height: 1.75rem;
  width: 1.75rem;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  border: 1px solid var(--color-hairline);
  color: color-mix(in srgb, var(--color-ink) 55%, transparent);
  transition:
    color 150ms ease,
    border-color 150ms ease,
    background-color 150ms ease;
}

.goal-icon-btn:hover {
  border-color: var(--color-ink);
  color: var(--color-ink);
}

.goal-icon-btn--primary {
  border-color: var(--color-ink);
  background: var(--color-ink);
  color: var(--color-paper);
}

.goal-icon-btn--primary:hover {
  opacity: 0.9;
  color: var(--color-paper);
}

.goal-actions {
  display: flex;
  align-items: center;
  gap: 0.125rem;
  max-width: 0;
  overflow: hidden;
  opacity: 0;
  transform: translateX(-0.5rem);
  pointer-events: none;
  transition:
    max-width 280ms cubic-bezier(0.22, 1, 0.36, 1),
    opacity 160ms ease,
    transform 280ms cubic-bezier(0.22, 1, 0.36, 1);
}

.goal-row:hover .goal-actions,
.goal-row:focus-within .goal-actions {
  max-width: 4.5rem;
  opacity: 1;
  transform: translateX(0);
  pointer-events: auto;
}

.goal-actions__btn {
  display: inline-flex;
  height: 1.75rem;
  width: 1.75rem;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  color: color-mix(in srgb, var(--color-ink) 40%, transparent);
  transition: color 150ms ease;
}

.goal-actions__btn:hover {
  color: var(--color-ink);
}

.goal-actions__btn--danger:hover {
  color: var(--color-accent);
}

@media (max-width: 767px) {
  .goal-actions {
    max-width: 4.5rem;
    opacity: 1;
    transform: translateX(0);
    pointer-events: auto;
  }
}
</style>
