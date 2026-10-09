import { createPinia, setActivePinia } from 'pinia'

import { GoalsApi } from '@/api/apis/goals.api'
import { StatsApi } from '@/api/apis/stats.api'
import { TasksApi } from '@/api/apis/tasks.api'
import { useBoardStore } from '@/libs/stores/modules/board.store'
import type { TTask } from '@/libs/types/task.type'

vi.mock('@/api/apis/tasks.api', () => ({
  TasksApi: {
    listWeek: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    softDelete: vi.fn(),
    move: vi.fn(),
    reorder: vi.fn(),
  },
}))

vi.mock('@/api/apis/goals.api', () => ({
  GoalsApi: {
    list: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    remove: vi.fn(),
  },
}))

vi.mock('@/api/apis/stats.api', () => ({
  StatsApi: {
    week: vi.fn(),
  },
}))

const sampleTask = (overrides: Partial<TTask> = {}): TTask => ({
  id: 1,
  title: 'Task',
  description: 'Description',
  importance: 'medium',
  task_date: '2026-10-06',
  deadline: null,
  is_done: false,
  position: 0,
  deleted_at: null,
  created_at: '2026-10-06T10:00:00Z',
  ...overrides,
})

describe('useBoardStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
    vi.mocked(TasksApi.listWeek).mockResolvedValue([])
    vi.mocked(GoalsApi.list).mockResolvedValue([])
    vi.mocked(StatsApi.week).mockResolvedValue({
      total: 0,
      done: 0,
      not_done: 0,
      completion_percent: 0,
    })
  })

  it('loadWeek fills tasks and groups by date', async () => {
    vi.mocked(TasksApi.listWeek).mockResolvedValue([sampleTask()])
    const store = useBoardStore()
    store.weekStart = '2026-10-05'
    await store.loadWeek()
    expect(store.tasks).toHaveLength(1)
    expect(store.tasksByDate['2026-10-06']).toHaveLength(1)
  })

  it('toggleDone updates task optimistically', async () => {
    vi.mocked(TasksApi.update).mockResolvedValue(sampleTask({ is_done: true }))
    const store = useBoardStore()
    store.weekStart = '2026-10-05'
    store.tasks = [sampleTask()]
    await store.toggleDone(sampleTask())
    expect(TasksApi.update).toHaveBeenCalledWith(1, { is_done: true })
    expect(store.tasks[0]?.is_done).toBe(true)
  })

  it('toggleDone serializes rapid clicks to latest state', async () => {
    vi.mocked(TasksApi.update).mockImplementation(async (_id, payload) =>
      sampleTask({ is_done: Boolean(payload.is_done) }),
    )
    const store = useBoardStore()
    store.weekStart = '2026-10-05'
    store.tasks = [sampleTask({ is_done: false })]

    const firstToggle = store.toggleDone(store.tasks[0]!)
    expect(store.tasks[0]?.is_done).toBe(true)
    const secondToggle = store.toggleDone(store.tasks[0]!)
    expect(store.tasks[0]?.is_done).toBe(false)

    await Promise.all([firstToggle, secondToggle])

    expect(TasksApi.update).toHaveBeenLastCalledWith(1, { is_done: false })
    expect(store.tasks[0]?.is_done).toBe(false)
  })

  it('shiftWeek changes weekStart', async () => {
    const store = useBoardStore()
    store.weekStart = '2026-10-05'
    await store.shiftWeek(1)
    expect(store.weekStart).toBe('2026-10-12')
  })
})
