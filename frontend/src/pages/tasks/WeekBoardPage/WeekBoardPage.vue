<template>
  <div class="flex min-w-0 flex-1 flex-col gap-6">
    <CollapsibleSection title="Итоги недели">
      <template #summary>
        <span class="inline-flex flex-wrap items-baseline gap-x-2">
          <span>
            Задачи:
            <span
              ref="summaryPercentRef"
              class="inline-block"
              :class="{ 'text-success': board.stats.completion_percent > 0 }"
            >
              {{ board.stats.completion_percent }}%
            </span>
          </span>
          <span aria-hidden="true">·</span>
          <span :class="areGoalsComplete ? 'text-success' : undefined">
            Цели {{ board.goalsDoneCount }}/{{ board.goals.length }}
          </span>
        </span>
      </template>
      <div class="grid min-w-0 gap-3 lg:grid-cols-2">
        <WeekDashboard :stats="board.stats" />
        <WeekGoals
          :goals="board.goals"
          :done-count="board.goalsDoneCount"
          @add="board.addGoal"
          @toggle="board.toggleGoal"
          @update="(payload) => board.updateGoal(payload.id, payload.text)"
          @remove="board.removeGoal"
        />
      </div>
    </CollapsibleSection>

    <section class="border-b border-hairline pb-4">
      <div class="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div class="flex min-w-0 flex-wrap items-center gap-2">
          <UIButton size="icon" aria-label="Предыдущая неделя" @click="onShiftWeek(-1)">
            ←
          </UIButton>
          <h1 class="font-serif text-2xl">{{ DateLib.formatWeekRange(board.weekStartDate) }}</h1>
          <UIButton size="icon" aria-label="Следующая неделя" @click="onShiftWeek(1)">
            →
          </UIButton>
          <UIButton v-if="!isCurrentWeek" size="sm" @click="onGoToCurrentWeek">
            Текущая неделя
          </UIButton>
        </div>
        <div class="flex items-center justify-end gap-2">
          <UIButton
            v-if="Boolean(searchDraft.trim()) || Boolean(board.searchQuery)"
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

    <div
      class="grid min-h-[220px] gap-4 md:grid-cols-5 md:gap-4"
      :class="{ 'opacity-60': board.isLoading }"
    >
      <div
        v-for="day in board.workdays"
        :key="dayColumnKey(day)"
        class="flex h-full min-h-[220px] flex-col border border-hairline p-2 sm:p-3"
        :class="{ hidden: isMobile && activeDayIso !== DateLib.toIsoDate(day) }"
      >
        <DayColumn
          :day="day"
          :tasks="board.tasksByDate[DateLib.toIsoDate(day)] || []"
          :can-drag="!isMobile"
          @toggle="board.toggleDone"
          @delete="onDelete"
          @move="openMove"
          @create="onCreate"
          @update="onUpdate"
          @reorder="onReorder"
          @moved-in="onMovedIn"
        />
      </div>
    </div>

    <div class="flex gap-2 md:hidden">
      <UIButton
        v-for="day in board.workdays"
        :key="DateLib.toIsoDate(day)"
        :variant="activeDayIso === DateLib.toIsoDate(day) ? 'primary' : 'ghost'"
        @click="selectDay(DateLib.toIsoDate(day))"
      >
        {{ weekdayLabel(day) }}
      </UIButton>
    </div>

    <MoveTaskModal
      v-if="movingTask"
      :task="movingTask"
      @close="movingTask = null"
      @confirm="onMoveConfirm"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, onBeforeUpdate, onMounted, ref, useTemplateRef } from 'vue'
import {
  onBeforeRouteUpdate,
  useRoute,
  useRouter,
  type LocationQuery,
} from 'vue-router'

import CollapsibleSection from '@/components/shared/CollapsibleSection/CollapsibleSection.vue'
import DayColumn from '@/components/tasks/DayColumn/DayColumn.vue'
import MoveTaskModal from '@/components/tasks/MoveTaskModal/MoveTaskModal.vue'
import WeekDashboard from '@/components/tasks/WeekDashboard/WeekDashboard.vue'
import WeekGoals from '@/components/tasks/WeekGoals/WeekGoals.vue'
import UIButton from '@/components/UI/UIButton/UIButton.vue'
import UIInput from '@/components/UI/UIInput/UIInput.vue'
import { WEEKDAY_SHORT } from '@/libs/constants/importance.constant'
import { PAGES } from '@/libs/constants/pages.constant'
import { DateLib } from '@/libs/classes/date-lib'
import { spawnSuccessBurst } from '@/libs/classes/success-burst-lib'
import { useBoardStore } from '@/libs/stores/modules/board.store'
import type { TImportance, TTask } from '@/libs/types/task.type'

const board = useBoardStore()
const route = useRoute()
const router = useRouter()
const searchDraft = ref('')
const movingTask = ref<TTask | null>(null)
const isMobile = ref(window.matchMedia('(max-width: 767px)').matches)
const selectedDayIso = ref<string | null>(null)
const summaryPercentRef = useTemplateRef('summaryPercentRef')
const allowSummaryBurst = ref(false)
let lastSummaryPercent = board.stats.completion_percent
let lastSummaryDone = board.stats.done
let lastSummaryTotal = board.stats.total

onBeforeUpdate(() => {
  const nextPercent = board.stats.completion_percent
  const nextDone = board.stats.done
  const nextTotal = board.stats.total

  if (!allowSummaryBurst.value) {
    lastSummaryPercent = nextPercent
    lastSummaryDone = nextDone
    lastSummaryTotal = nextTotal
    void nextTick(() => {
      allowSummaryBurst.value = true
    })
    return
  }

  const shouldFlash =
    nextPercent > lastSummaryPercent &&
    nextDone > lastSummaryDone &&
    nextTotal === lastSummaryTotal

  if (shouldFlash) {
    void nextTick(() => {
      const el = summaryPercentRef.value
      if (!el) return
      const rect = el.getBoundingClientRect()
      spawnSuccessBurst(rect.left + rect.width / 2, rect.top + rect.height / 2)
    })
  }

  lastSummaryPercent = nextPercent
  lastSummaryDone = nextDone
  lastSummaryTotal = nextTotal
})

const isCurrentWeek = computed(
  () => board.weekStart === DateLib.toIsoDate(DateLib.mondayOf(new Date())),
)

const areGoalsComplete = computed(
  () => board.goals.length > 0 && board.goalsDoneCount === board.goals.length,
)

const activeDayIso = computed(() => {
  const days = board.workdays.map((day) => DateLib.toIsoDate(day))
  if (!days.length) return ''
  if (selectedDayIso.value && days.includes(selectedDayIso.value)) {
    return selectedDayIso.value
  }
  const today = DateLib.toIsoDate(new Date())
  if (days.includes(today)) return today
  return days[0]
})

const dayColumnKey = (day: Date) => `${board.weekStart}-${DateLib.toIsoDate(day)}`

const weekdayLabel = (day: Date) => {
  const index = day.getDay() === 0 ? 6 : day.getDay() - 1
  return WEEKDAY_SHORT[index]
}

const selectDay = (iso: string) => {
  selectedDayIso.value = iso
}

const openMove = (task: TTask) => {
  movingTask.value = task
}

const onCreate = async (payload: {
  title: string
  description: string
  importance: TImportance
  deadline: string | null
  task_date: string
  place: 'top' | 'bottom'
}) => {
  if (!payload.title || !payload.description) return
  await board.createTask({
    title: payload.title,
    description: payload.description,
    importance: payload.importance,
    task_date: payload.task_date,
    deadline: payload.deadline,
    place: payload.place,
  })
}

const onUpdate = async (
  taskId: number,
  payload: {
    title: string
    description: string
    importance: TImportance
    deadline: string | null
  },
) => {
  if (!payload.title || !payload.description) return
  await board.updateTask(taskId, payload)
}

const onDelete = async (task: TTask) => {
  await board.softDelete(task.id)
}

const onReorder = async (taskDate: string, orderedIds: number[]) => {
  await board.reorderDay(taskDate, orderedIds)
}

const onMovedIn = async (taskId: number, taskDate: string, orderedIds: number[]) => {
  await board.moveTask(taskId, taskDate)
  await board.reorderDay(taskDate, orderedIds)
}

const onMoveConfirm = async (taskDate: string) => {
  if (!movingTask.value) return
  await board.moveTask(movingTask.value.id, taskDate)
  movingTask.value = null
}

const resolveWeekStartFromQuery = (value: unknown) => {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return DateLib.toIsoDate(DateLib.mondayOf(new Date()))
  }
  return DateLib.toIsoDate(DateLib.mondayOf(DateLib.parseIso(value)))
}

const resolveSearchFromQuery = (value: unknown) =>
  typeof value === 'string' ? value : ''

const buildBoardQuery = () => ({
  week_start: board.weekStart,
  ...(board.searchQuery ? { search: board.searchQuery } : {}),
})

const syncBoardQuery = async () => {
  await router.replace({
    name: PAGES.BOARD,
    query: buildBoardQuery(),
  })
}

const applyBoardQuery = async (query: LocationQuery) => {
  const nextWeekStart = resolveWeekStartFromQuery(query.week_start)
  const nextSearch = resolveSearchFromQuery(query.search)
  searchDraft.value = nextSearch
  const isSame =
    board.weekStart === nextWeekStart && board.searchQuery === nextSearch
  if (isSame) return false
  board.weekStart = nextWeekStart
  board.searchQuery = nextSearch
  await board.loadWeek()
  return true
}

const onShiftWeek = async (weeks: number) => {
  await board.shiftWeek(weeks)
  await syncBoardQuery()
}

const onGoToCurrentWeek = async () => {
  await board.goToCurrentWeek()
  await syncBoardQuery()
}

const onSearch = async () => {
  await board.setSearch(searchDraft.value.trim())
  await syncBoardQuery()
}

const onClearSearch = async () => {
  searchDraft.value = ''
  await board.setSearch('')
  await syncBoardQuery()
}

onBeforeRouteUpdate(async (to) => {
  await applyBoardQuery(to.query)
})

onMounted(async () => {
  window.matchMedia('(max-width: 767px)').addEventListener('change', (event) => {
    isMobile.value = event.matches
  })
  const didApply = await applyBoardQuery(route.query)
  if (!didApply) {
    await board.loadWeek()
  }
  await syncBoardQuery()
})
</script>
