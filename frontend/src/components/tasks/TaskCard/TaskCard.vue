<template>
  <article
    ref="rootRef"
    class="task-card group relative w-full min-w-0 border-b border-hairline py-3"
    :class="{
      'task-card--draggable': canDrag && !isFormMode,
      'task-card--form': isFormMode,
    }"
    @keydown.escape.prevent="onCancel"
    @focusout="onFocusOut"
    @dblclick="onDoubleClick"
  >
    <form v-if="isFormMode" class="task-card__form" @submit.prevent="onSave">
      <div class="task-card__header mb-1 flex items-center justify-between gap-2">
        <UISelect
          v-model="draft.importance"
          variant="plain"
          :class="IMPORTANCE_CLASS[draft.importance]"
          :options="IMPORTANCE_OPTIONS"
          aria-label="Важность"
        />
        <UIDatePicker
          v-model="draft.deadline"
          compact
          aria-label="Дата до которой нужно выполнить"
        />
      </div>
      <input
        ref="titleInputRef"
        v-model="draft.title"
        type="text"
        required
        lang="ru"
        placeholder="Название"
        :maxlength="TASK_TITLE_MAX_LENGTH"
        class="task-card__field task-card__field--title"
      />
      <textarea
        v-model="draft.description"
        required
        lang="ru"
        placeholder="Описание задачи"
        rows="1"
        :maxlength="TASK_DESCRIPTION_MAX_LENGTH"
        class="task-card__field task-card__field--description"
      />
      <div class="task-card__form-actions">
        <button
          type="button"
          class="task-card__action task-card__action--cancel task-card__form-btn"
          aria-label="Отмена"
          @click="onCancel"
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
        <button
          type="submit"
          class="task-card__action task-card__action--save task-card__form-btn"
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
            <path d="M5 12l5 5L20 7" />
          </svg>
        </button>
      </div>
    </form>

    <template v-else>
      <div class="task-card__header relative mb-1 flex items-center justify-between gap-2">
        <span class="text-xs uppercase tracking-wider" :class="IMPORTANCE_CLASS[task.importance]">
          {{ IMPORTANCE_LABELS[task.importance] }}
        </span>
        <span v-if="task.deadline" class="text-xs text-ink/50">
          до {{ formatDeadline(task.deadline) }}
        </span>
      </div>
      <p
        class="break-words font-serif text-[15px] leading-snug"
        :class="{
          'text-success line-through': task.is_done,
          'text-overdue': isOverdue,
        }"
      >
        {{ task.title }}
      </p>
      <p
        class="task-card__description mt-1 break-words text-sm leading-snug"
        :class="{
          'text-success line-through': task.is_done,
          'text-ink/70': !task.is_done && !isOverdue,
          'text-overdue': isOverdue && !task.is_done,
        }"
      >
        {{ task.description }}
      </p>

      <div class="task-card__actions task-card__actions--desktop">
        <button
          type="button"
          class="task-card__action task-card__action--delete"
          aria-label="Удалить"
          @pointerdown.stop
          @mousedown.stop.prevent
          @click.stop="onDelete"
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
            <path d="M3 6h18" />
            <path d="M8 6V4h8v2" />
            <path d="M19 6l-1 14H6L5 6" />
            <path d="M10 11v6" />
            <path d="M14 11v6" />
          </svg>
        </button>

        <button
          type="button"
          class="task-card__action task-card__action--toggle"
          :class="task.is_done ? 'task-card__action--undo' : 'task-card__action--ok'"
          :aria-label="task.is_done ? 'Вернуть' : 'Выполнено'"
          @pointerdown.stop
          @mousedown.stop.prevent
          @click.stop="onToggle"
        >
          <svg
            v-if="task.is_done"
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
            <path d="M5 12l5 5L20 7" />
            <path d="M4 4l16 16" />
          </svg>
          <svg
            v-else
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
            <path d="M5 12l5 5L20 7" />
          </svg>
        </button>
      </div>

      <div class="task-card__actions task-card__actions--mobile">
        <button
          type="button"
          class="task-card__action task-card__action--delete"
          aria-label="Удалить"
          @click="onDelete"
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
            <path d="M3 6h18" />
            <path d="M8 6V4h8v2" />
            <path d="M19 6l-1 14H6L5 6" />
            <path d="M10 11v6" />
            <path d="M14 11v6" />
          </svg>
        </button>
        <button
          type="button"
          class="task-card__action task-card__action--toggle"
          :class="task.is_done ? 'task-card__action--undo' : 'task-card__action--ok'"
          :aria-label="task.is_done ? 'Вернуть' : 'Выполнено'"
          @mousedown.prevent
          @click="onToggle"
        >
          <svg
            v-if="task.is_done"
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
            <path d="M5 12l5 5L20 7" />
            <path d="M4 4l16 16" />
          </svg>
          <svg
            v-else
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
            <path d="M5 12l5 5L20 7" />
          </svg>
        </button>
      </div>
    </template>
  </article>
</template>

<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, reactive, ref, useTemplateRef } from 'vue'

import UIDatePicker from '@/components/UI/UIDatePicker/UIDatePicker.vue'
import UISelect from '@/components/UI/UISelect/UISelect.vue'
import { DateLib } from '@/libs/classes/date-lib'
import { spawnSuccessBurst } from '@/libs/classes/success-burst-lib'
import { spawnTrashFly } from '@/libs/classes/trash-fly-lib'
import {
  IMPORTANCE_CLASS,
  IMPORTANCE_LABELS,
  IMPORTANCE_OPTIONS,
} from '@/libs/constants/importance.constant'
import {
  TASK_DESCRIPTION_MAX_LENGTH,
  TASK_TITLE_MAX_LENGTH,
} from '@/libs/constants/limits.constant'
import type { TImportance, TTask } from '@/libs/types/task.type'

type TTaskFormPayload = {
  title: string
  description: string
  importance: TImportance
  deadline: string | null
}

const props = withDefaults(
  defineProps<{
    task: TTask
    canDrag?: boolean
    mode?: 'view' | 'create'
  }>(),
  {
    canDrag: false,
    mode: 'view',
  },
)

const emit = defineEmits<{
  toggle: [TTask]
  delete: [TTask]
  save: [TTask, TTaskFormPayload]
  create: [TTaskFormPayload]
  cancel: []
  editing: [boolean]
}>()

const isEditing = ref(false)
const rootRef = useTemplateRef('rootRef')
const titleInputRef = useTemplateRef('titleInputRef')

const draft = reactive({
  title: '',
  description: '',
  importance: 'medium' as TImportance,
  deadline: '',
})

const isFormMode = computed(() => props.mode === 'create' || isEditing.value)
const isOverdue = computed(() => DateLib.isOverdue(props.task.task_date, props.task.is_done))

const formatDeadline = (value: string) => {
  return DateLib.parseIso(value).toLocaleDateString('ru-RU')
}

const fillDraftFromTask = () => {
  draft.title = props.task.title
  draft.description = props.task.description
  draft.importance = props.task.importance
  draft.deadline = props.task.deadline ?? ''
}

const fillEmptyDraft = () => {
  draft.title = ''
  draft.description = ''
  draft.importance = 'medium'
  draft.deadline = props.task.task_date
}

const focusTitle = async () => {
  await nextTick()
  titleInputRef.value?.focus()
}

const SIDE_ZONE_PX = 8

const isInsideFloatingOverlay = (node: Node | null) => {
  if (!(node instanceof Element)) return false
  if (node.closest('[role="listbox"]')) return true
  let current: Element | null = node
  while (current) {
    if (current.classList.contains('z-[70]')) return true
    current = current.parentElement
  }
  return false
}

const isInsideCardOrOverlay = (node: EventTarget | null) => {
  if (!(node instanceof Node)) return false
  if (rootRef.value?.contains(node)) return true
  return isInsideFloatingOverlay(node)
}

const isInExpandedCardZone = (event: Pick<PointerEvent, 'clientX' | 'clientY' | 'target'>) => {
  if (isInsideCardOrOverlay(event.target)) return true
  const root = rootRef.value
  if (!root) return false
  const rect = root.getBoundingClientRect()
  return (
    event.clientX >= rect.left - SIDE_ZONE_PX &&
    event.clientX <= rect.right + SIDE_ZONE_PX &&
    event.clientY >= rect.top - 8 &&
    event.clientY <= rect.bottom + 8
  )
}

const hasOpenFloatingOverlay = () => {
  return Boolean(document.querySelector('.z-\\[70\\]'))
}

let outsidePointerId: number | null = null

const stopOutsideListeners = () => {
  document.removeEventListener('pointerdown', onDocPointerDown, true)
  document.removeEventListener('pointerup', onDocPointerUp, true)
  document.removeEventListener('pointercancel', onDocPointerCancel, true)
  outsidePointerId = null
}

const startOutsideListeners = () => {
  stopOutsideListeners()
  document.addEventListener('pointerdown', onDocPointerDown, true)
  document.addEventListener('pointerup', onDocPointerUp, true)
  document.addEventListener('pointercancel', onDocPointerCancel, true)
}

const onDocPointerDown = (event: PointerEvent) => {
  if (!isEditing.value) return
  if (isInExpandedCardZone(event)) {
    outsidePointerId = null
    return
  }
  outsidePointerId = event.pointerId
  event.stopPropagation()
}

const onDocPointerUp = (event: PointerEvent) => {
  if (!isEditing.value) return
  if (outsidePointerId !== event.pointerId) return
  outsidePointerId = null
  if (isInExpandedCardZone(event)) return
  onCancel()
}

const onDocPointerCancel = (event: PointerEvent) => {
  if (outsidePointerId !== event.pointerId) return
  outsidePointerId = null
}

const onFocusOut = (event: FocusEvent) => {
  if (!isEditing.value) return
  if (isInsideCardOrOverlay(event.relatedTarget)) return
  if (event.relatedTarget === null) return
  window.setTimeout(() => {
    if (!isEditing.value) return
    const active = document.activeElement
    if (isInsideCardOrOverlay(active)) return
    if (hasOpenFloatingOverlay()) return
    onCancel()
  }, 0)
}

const onDoubleClick = (event: MouseEvent) => {
  if (isFormMode.value) return
  if (event.target instanceof Element && event.target.closest('.task-card__action')) return
  void onStartEdit()
}

const onStartEdit = async () => {
  fillDraftFromTask()
  isEditing.value = true
  emit('editing', true)
  startOutsideListeners()
  await focusTitle()
}

const onCancel = () => {
  if (props.mode === 'create') {
    emit('cancel')
    return
  }
  if (!isEditing.value) return
  isEditing.value = false
  emit('editing', false)
  stopOutsideListeners()
}

const onSave = () => {
  const title = draft.title.trim()
  const description = draft.description.trim()
  if (!title || !description) return

  const payload: TTaskFormPayload = {
    title,
    description,
    importance: draft.importance,
    deadline: draft.deadline || null,
  }

  if (props.mode === 'create') {
    emit('create', payload)
    return
  }

  emit('save', props.task, payload)
  isEditing.value = false
  emit('editing', false)
  stopOutsideListeners()
}

const onToggle = (event: MouseEvent) => {
  if (!props.task.is_done) {
    spawnSuccessBurst(event.clientX, event.clientY)
  }
  emit('toggle', props.task)
}

const onDelete = (event: MouseEvent) => {
  if (event.currentTarget instanceof HTMLElement) {
    spawnTrashFly(event.currentTarget)
  }
  emit('delete', props.task)
}

onMounted(async () => {
  if (props.mode !== 'create') return
  fillEmptyDraft()
  const root = rootRef.value
  if (root && typeof root.scrollIntoView === 'function') {
    root.scrollIntoView({ block: 'nearest', behavior: 'smooth' })
  }
  await focusTitle()
})

onBeforeUnmount(() => {
  stopOutsideListeners()
  if (isEditing.value) {
    emit('editing', false)
  }
})
</script>

<style scoped>
.task-card {
  position: relative;
  z-index: 0;
  overflow: visible;
}

.task-card:hover,
.task-card:focus-within {
  z-index: 30;
}

.task-card--form {
  z-index: 60;
}

.task-card--form:hover,
.task-card--form:focus-within {
  z-index: 60;
}

.task-card__actions--desktop {
  z-index: 2;
}

.task-card--draggable {
  cursor: grab;
  user-select: none;
  -webkit-user-select: none;
  touch-action: none;
}

.task-card--draggable:active {
  cursor: grabbing;
}

.task-card--draggable .task-card__description {
  -webkit-user-select: none;
  user-select: none;
}

.task-card__header {
  overflow: visible;
}

.task-card__description {
  display: -webkit-box;
  overflow: hidden;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 6;
  line-clamp: 6;
}

.task-card__form {
  display: flex;
  flex-direction: column;
}

.task-card__field {
  width: 100%;
  margin: 0;
  border: 0;
  border-radius: 0;
  background: transparent;
  color: var(--color-ink);
  outline: none;
  box-shadow: none;
}

.task-card__field::placeholder {
  color: color-mix(in srgb, var(--color-ink) 35%, transparent);
}

.task-card__field--title {
  font-family: var(--font-serif);
  font-size: 15px;
  line-height: 1.375;
}

.task-card__field--description {
  margin-top: 0.25rem;
  field-sizing: content;
  max-height: calc(1.375em * 6);
  min-height: 1.375em;
  resize: none;
  overflow: hidden;
  text-overflow: ellipsis;
  font-size: 0.875rem;
  line-height: 1.375;
  color: color-mix(in srgb, var(--color-ink) 70%, transparent);
}

.task-card__field:focus {
  box-shadow: inset 0 -1px 0 var(--color-hairline);
}

.task-card__form-actions {
  position: static;
  z-index: 3;
}

.task-card__form-actions .task-card__form-btn {
  position: absolute;
  z-index: 4;
  display: inline-flex;
  height: 1.75rem;
  width: 1.75rem;
  align-items: center;
  justify-content: center;
  border: 1px solid var(--color-hairline);
  border-radius: 9999px;
  background: var(--color-paper);
  color: var(--color-ink);
  cursor: pointer;
  opacity: 1;
  pointer-events: auto;
  transition: color 150ms ease, background-color 150ms ease, border-color 150ms ease;
}

.task-card__form-actions .task-card__action--cancel {
  top: auto;
  bottom: 0;
  left: 0;
  transform: translateY(50%);
}

.task-card__form-actions .task-card__action--save {
  top: auto;
  bottom: 0;
  right: 0;
  transform: translateY(50%);
}

.task-card__actions--mobile {
  display: none;
}

.task-card__actions--desktop .task-card__action {
  position: absolute;
  z-index: 2;
  display: inline-flex;
  height: 1.75rem;
  width: 1.75rem;
  align-items: center;
  justify-content: center;
  border: 1px solid var(--color-hairline);
  border-radius: 9999px;
  background: var(--color-paper);
  color: var(--color-ink);
  cursor: pointer;
  opacity: 0;
  pointer-events: none;
  transition:
    opacity 120ms ease,
    color 150ms ease,
    background-color 150ms ease,
    border-color 150ms ease;
}

.task-card__actions--desktop .task-card__action--delete {
  top: auto;
  bottom: 0;
  left: 0;
  transform: translateY(50%);
}

.task-card__actions--desktop .task-card__action--toggle {
  top: auto;
  bottom: 0;
  right: 0;
  transform: translateY(50%);
}

.task-card__action--delete:hover,
.task-card__action--cancel:hover {
  color: var(--color-accent);
}

.task-card__action--ok:hover,
.task-card__action--save:hover {
  color: var(--color-success);
}

.task-card__action--undo:hover {
  color: var(--color-accent);
}

.task-card:hover .task-card__actions--desktop .task-card__action,
.task-card:focus-within .task-card__actions--desktop .task-card__action {
  opacity: 1;
  pointer-events: auto;
}

@media (max-width: 767px) {
  .task-card__actions--desktop {
    display: none;
  }

  .task-card__actions--mobile {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin-top: 0.75rem;
  }

  .task-card__actions--mobile .task-card__action {
    display: inline-flex;
    height: 1.75rem;
    width: 1.75rem;
    align-items: center;
    justify-content: center;
    border: 1px solid var(--color-hairline);
    border-radius: 9999px;
    background: var(--color-paper);
    color: var(--color-ink);
    cursor: pointer;
    transition: color 150ms ease;
  }

  .task-card__form-actions {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    gap: 0.5rem;
    margin-top: 0.5rem;
  }

  .task-card__form-actions .task-card__form-btn {
    position: static;
    transform: none;
  }
}
</style>
