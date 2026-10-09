import { defineStore } from 'pinia'
import { computed, ref } from 'vue'

import { GoalsApi } from '@/api/apis/goals.api'
import { StatsApi } from '@/api/apis/stats.api'
import { TasksApi } from '@/api/apis/tasks.api'
import { DateLib } from '@/libs/classes/date-lib'
import type { TImportance, TTask, TWeekGoal, TWeekStats } from '@/libs/types/task.type'

export const useBoardStore = defineStore('board', () => {
  const weekStart = ref(DateLib.toIsoDate(DateLib.mondayOf(new Date())))
  const tasks = ref<TTask[]>([])
  const goals = ref<TWeekGoal[]>([])
  const stats = ref<TWeekStats>({ total: 0, done: 0, not_done: 0, completion_percent: 0 })
  const searchQuery = ref('')
  const isLoading = ref(false)
  const toggleDoneChains = new Map<number, Promise<void>>()
  const toggleGoalChains = new Map<number, Promise<void>>()

  const weekStartDate = computed(() => DateLib.parseIso(weekStart.value))
  const workdays = computed(() => DateLib.workdaysOfWeek(weekStartDate.value))

  const tasksByDate = computed(() => {
    const map: Record<string, TTask[]> = {}
    for (const day of workdays.value) {
      map[DateLib.toIsoDate(day)] = []
    }
    for (const task of tasks.value) {
      if (!map[task.task_date]) map[task.task_date] = []
      map[task.task_date].push(task)
    }
    for (const key of Object.keys(map)) {
      map[key].sort((left, right) => left.position - right.position || left.id - right.id)
    }
    return map
  })

  const goalsDoneCount = computed(() => goals.value.filter((item) => item.is_done).length)

  const refreshStats = async () => {
    stats.value = await StatsApi.week(weekStart.value)
  }

  const patchTask = (taskId: number, patch: Partial<TTask>) => {
    tasks.value = tasks.value.map((item) =>
      item.id === taskId ? { ...item, ...patch } : item,
    )
  }

  const replaceDayTasks = (taskDate: string, dayTasks: TTask[]) => {
    tasks.value = [
      ...tasks.value.filter((item) => item.task_date !== taskDate),
      ...dayTasks,
    ]
  }

  const loadWeek = async (args?: { silent?: boolean }) => {
    const silent = Boolean(args?.silent)
    if (!silent) isLoading.value = true
    try {
      const [tasksRes, goalsRes, statsRes] = await Promise.all([
        TasksApi.listWeek(weekStart.value, searchQuery.value || undefined),
        GoalsApi.list(weekStart.value),
        StatsApi.week(weekStart.value),
      ])
      tasks.value = tasksRes
      goals.value = goalsRes
      stats.value = statsRes
    } finally {
      if (!silent) isLoading.value = false
    }
  }

  const refreshWeek = async () => {
    await loadWeek({ silent: true })
  }

  const shiftWeek = async (weeks: number) => {
    weekStart.value = DateLib.toIsoDate(DateLib.addDays(weekStartDate.value, weeks * 7))
    await loadWeek()
  }

  const goToCurrentWeek = async () => {
    weekStart.value = DateLib.toIsoDate(DateLib.mondayOf(new Date()))
    await loadWeek()
  }

  const setSearch = async (value: string) => {
    searchQuery.value = value
    await loadWeek()
  }

  const createTask = async (payload: {
    title: string
    description: string
    importance: TImportance
    task_date: string
    deadline?: string | null
    place?: 'top' | 'bottom'
  }) => {
    const place = payload.place ?? 'top'
    const created = await TasksApi.create(payload)
    if (place === 'bottom') {
      tasks.value = [...tasks.value, created]
    } else {
      tasks.value = [
        ...tasks.value.map((item) =>
          item.task_date === created.task_date
            ? { ...item, position: item.position + 1 }
            : item,
        ),
        created,
      ]
    }
    await refreshStats()
  }

  const updateTask = async (
    taskId: number,
    payload: {
      title: string
      description: string
      importance: TImportance
      deadline?: string | null
    },
  ) => {
    const updated = await TasksApi.update(taskId, payload)
    patchTask(taskId, updated)
  }

  const toggleDone = async (task: TTask) => {
    const current = tasks.value.find((item) => item.id === task.id)
    if (!current) return
    const nextDone = !current.is_done
    patchTask(task.id, { is_done: nextDone })

    const previousChain = toggleDoneChains.get(task.id) ?? Promise.resolve()
    const run = previousChain.catch(() => undefined).then(async () => {
      const latest = tasks.value.find((item) => item.id === task.id)
      if (!latest) return
      const desired = latest.is_done
      try {
        const updated = await TasksApi.update(task.id, { is_done: desired })
        const after = tasks.value.find((item) => item.id === task.id)
        if (after && after.is_done === desired) {
          patchTask(task.id, { ...updated, is_done: desired })
          await refreshStats()
        }
      } catch (error) {
        const after = tasks.value.find((item) => item.id === task.id)
        if (after && after.is_done === desired) {
          patchTask(task.id, { is_done: !desired })
        }
        throw error
      }
    })
    toggleDoneChains.set(
      task.id,
      run.then(
        () => undefined,
        () => undefined,
      ),
    )
    await run
  }

  const softDelete = async (taskId: number) => {
    const previous = tasks.value
    tasks.value = tasks.value.filter((item) => item.id !== taskId)
    try {
      await TasksApi.softDelete(taskId)
      await refreshStats()
    } catch (error) {
      tasks.value = previous
      throw error
    }
  }

  const moveTask = async (taskId: number, taskDate: string, position?: number) => {
    const previous = tasks.value
    const current = previous.find((item) => item.id === taskId)
    if (current) {
      patchTask(taskId, {
        task_date: taskDate,
        position: position ?? current.position,
      })
    }
    try {
      const updated = await TasksApi.move(taskId, taskDate, position)
      patchTask(taskId, updated)
    } catch (error) {
      tasks.value = previous
      throw error
    }
  }

  const reorderDay = async (taskDate: string, orderedIds: number[]) => {
    const previous = tasks.value
    const byId = new Map(tasks.value.map((item) => [item.id, item]))
    const reordered = orderedIds.flatMap((id, index) => {
      const item = byId.get(id)
      if (!item) return []
      return [{ ...item, task_date: taskDate, position: index }]
    })
    replaceDayTasks(taskDate, reordered)
    try {
      await TasksApi.reorder(taskDate, orderedIds)
    } catch (error) {
      tasks.value = previous
      throw error
    }
  }

  const addGoal = async (text: string) => {
    const created = await GoalsApi.create(weekStart.value, text)
    goals.value = [...goals.value, created]
  }

  const toggleGoal = async (goal: TWeekGoal) => {
    const current = goals.value.find((item) => item.id === goal.id)
    if (!current) return
    const nextDone = !current.is_done
    goals.value = goals.value.map((item) =>
      item.id === goal.id ? { ...item, is_done: nextDone } : item,
    )

    const previousChain = toggleGoalChains.get(goal.id) ?? Promise.resolve()
    const run = previousChain.catch(() => undefined).then(async () => {
      const latest = goals.value.find((item) => item.id === goal.id)
      if (!latest) return
      const desired = latest.is_done
      try {
        const updated = await GoalsApi.update(goal.id, { is_done: desired })
        const after = goals.value.find((item) => item.id === goal.id)
        if (after && after.is_done === desired) {
          goals.value = goals.value.map((item) =>
            item.id === goal.id ? { ...updated, is_done: desired } : item,
          )
        }
      } catch (error) {
        const after = goals.value.find((item) => item.id === goal.id)
        if (after && after.is_done === desired) {
          goals.value = goals.value.map((item) =>
            item.id === goal.id ? { ...item, is_done: !desired } : item,
          )
        }
        throw error
      }
    })
    toggleGoalChains.set(
      goal.id,
      run.then(
        () => undefined,
        () => undefined,
      ),
    )
    await run
  }

  const updateGoal = async (goalId: number, text: string) => {
    const updated = await GoalsApi.update(goalId, { text })
    goals.value = goals.value.map((item) => (item.id === goalId ? updated : item))
  }

  const removeGoal = async (goalId: number) => {
    const previous = goals.value
    goals.value = goals.value.filter((item) => item.id !== goalId)
    try {
      await GoalsApi.remove(goalId)
    } catch (error) {
      goals.value = previous
      throw error
    }
  }

  return {
    weekStart,
    weekStartDate,
    workdays,
    tasks,
    tasksByDate,
    goals,
    goalsDoneCount,
    stats,
    searchQuery,
    isLoading,
    loadWeek,
    refreshWeek,
    shiftWeek,
    goToCurrentWeek,
    setSearch,
    createTask,
    updateTask,
    toggleDone,
    softDelete,
    moveTask,
    reorderDay,
    addGoal,
    toggleGoal,
    updateGoal,
    removeGoal,
  }
})
