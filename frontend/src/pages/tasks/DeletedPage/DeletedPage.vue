<template>
  <div class="space-y-6">
    <section class="border-b border-hairline pb-4">
      <div class="flex flex-wrap items-center justify-between gap-3">
        <UIButton
          size="icon"
          variant="danger"
          aria-label="Очистить раздел"
          :disabled="!tasks.length"
          @click="purgeConfirm = 'all'"
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
        </UIButton>
        <div class="flex items-center justify-end gap-2">
          <UIButton
            v-if="Boolean(searchDraft.trim()) || Boolean(activeSearch)"
            size="icon"
            aria-label="Сбросить"
            @click="onClearSearch"
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
          </UIButton>
          <UIInput
            v-model="searchDraft"
            class="sm:w-80"
            size="sm"
            placeholder="Поиск по названию и описанию"
            @enter="onSearch"
          />
          <UIButton size="icon" variant="primary" aria-label="Найти" @click="onSearch">
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
              <circle cx="11" cy="11" r="7" />
              <path d="m20 20-3.5-3.5" />
            </svg>
          </UIButton>
        </div>
      </div>
    </section>

    <ul
      v-if="tasks.length"
      class="grid grid-cols-1 gap-x-10 sm:grid-cols-2 lg:grid-cols-3"
    >
      <li
        v-for="task in tasks"
        :key="task.id"
        class="deleted-card flex h-full flex-col border-b border-hairline py-3"
      >
        <div class="mb-1 flex items-center justify-between gap-2">
          <span
            class="text-xs uppercase tracking-wider"
            :class="IMPORTANCE_CLASS[task.importance]"
          >
            {{ IMPORTANCE_LABELS[task.importance] }}
          </span>
          <span class="shrink-0 text-xs text-ink/50">
            <template v-if="task.deadline">до {{ formatDate(task.deadline) }}</template>
            <template v-else>{{ formatDate(task.task_date) }}</template>
          </span>
        </div>
        <p class="break-words font-serif text-[15px] leading-snug">{{ task.title }}</p>
        <p class="deleted-card__description mt-1 break-words text-sm leading-snug text-ink/70">
          {{ task.description }}
        </p>

        <div class="deleted-card__actions">
          <button
            type="button"
            class="deleted-card__action deleted-card__action--delete"
            aria-label="Удалить навсегда"
            @click="purgeConfirm = task"
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
            class="deleted-card__action deleted-card__action--restore"
            aria-label="Восстановить"
            @click="onRestoreOther(task)"
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
              <path d="M3 7v6h6" />
              <path d="M21 17a9 9 0 0 0-9-9 9 9 0 0 0-6.7 2.9L3 13" />
            </svg>
          </button>
        </div>
      </li>
    </ul>
    <p v-else class="border border-hairline p-6 text-center text-sm text-ink/60">
      Удалённых задач нет.
    </p>

    <MoveTaskModal
      v-if="restoreTask"
      title="Восстановить задачу"
      confirm-label="Восстановить"
      :task="restoreTask"
      @close="restoreTask = null"
      @confirm="onRestoreConfirm"
    />

    <UIModal
      v-if="purgeConfirm"
      :title="purgeModalTitle"
      :is-show="true"
      @close="purgeConfirm = null"
    >
      <p class="text-sm text-ink/70">{{ purgeModalText }}</p>
      <div class="mt-4 flex justify-end gap-2">
        <UIButton @click="purgeConfirm = null">Отмена</UIButton>
        <UIButton variant="danger" @click="onPurgeConfirm">Удалить навсегда</UIButton>
      </div>
    </UIModal>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'

import MoveTaskModal from '@/components/tasks/MoveTaskModal/MoveTaskModal.vue'
import UIButton from '@/components/UI/UIButton/UIButton.vue'
import UIInput from '@/components/UI/UIInput/UIInput.vue'
import UIModal from '@/components/UI/UIModal/UIModal.vue'
import { TasksApi } from '@/api/apis/tasks.api'
import { IMPORTANCE_CLASS, IMPORTANCE_LABELS } from '@/libs/constants/importance.constant'
import { DateLib } from '@/libs/classes/date-lib'
import type { TTask } from '@/libs/types/task.type'

const tasks = ref<TTask[]>([])
const searchDraft = ref('')
const activeSearch = ref('')
const restoreTask = ref<TTask | null>(null)
const purgeConfirm = ref<'all' | TTask | null>(null)

const formatDate = (value: string) => DateLib.parseIso(value).toLocaleDateString('ru-RU')

const purgeModalTitle = computed(() =>
  purgeConfirm.value === 'all' ? 'Очистить раздел' : 'Удалить навсегда',
)

const purgeModalText = computed(() => {
  if (purgeConfirm.value === 'all') {
    return 'Все удалённые задачи будут стёрты без возможности восстановления.'
  }
  if (purgeConfirm.value) {
    return `Задача «${purgeConfirm.value.title}» будет стёрта без возможности восстановления.`
  }
  return ''
})

const load = async () => {
  const res = await TasksApi.listDeleted(activeSearch.value.trim() || undefined)
  tasks.value = res
}

const onSearch = async () => {
  activeSearch.value = searchDraft.value.trim()
  await load()
}

const onClearSearch = async () => {
  searchDraft.value = ''
  activeSearch.value = ''
  await load()
}

const onRestoreOther = (task: TTask) => {
  restoreTask.value = task
}

const onRestoreConfirm = async (taskDate: string) => {
  if (!restoreTask.value) return
  await TasksApi.restore(restoreTask.value.id, taskDate)
  restoreTask.value = null
  await load()
}

const onPurgeConfirm = async () => {
  if (purgeConfirm.value === 'all') {
    await TasksApi.purgeAll()
  } else if (purgeConfirm.value) {
    await TasksApi.purge(purgeConfirm.value.id)
  }
  purgeConfirm.value = null
  await load()
}

onMounted(load)
</script>

<style scoped>
.deleted-card__description {
  display: -webkit-box;
  overflow: hidden;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 6;
  line-clamp: 6;
}

.deleted-card__actions {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: auto;
  padding-top: 0.75rem;
}

.deleted-card__action {
  display: inline-flex;
  height: 1.75rem;
  width: 1.75rem;
  align-items: center;
  justify-content: center;
  border: 1px solid var(--color-hairline);
  border-radius: 0;
  background: var(--color-paper);
  color: var(--color-ink);
  cursor: pointer;
  transition: color 150ms ease;
}

.deleted-card__action--delete:hover {
  color: var(--color-accent);
}

.deleted-card__action--restore:hover {
  color: var(--color-success);
}
</style>
