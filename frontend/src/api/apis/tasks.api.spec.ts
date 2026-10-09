import { apiClient } from '@/api/api.client'
import { TasksApi } from '@/api/apis/tasks.api'

vi.mock('@/api/api.client', () => ({
  apiClient: {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
  },
}))

describe('TasksApi', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('listWeek passes week_start and search', async () => {
    vi.mocked(apiClient.get).mockResolvedValue({ data: [] })
    await TasksApi.listWeek('2026-10-05', 'q')
    expect(apiClient.get).toHaveBeenCalledWith('/tasks', {
      params: { week_start: '2026-10-05', search: 'q' },
    })
  })

  it('reorder posts ordered ids', async () => {
    vi.mocked(apiClient.post).mockResolvedValue({ data: [] })
    await TasksApi.reorder('2026-10-06', [2, 1])
    expect(apiClient.post).toHaveBeenCalledWith(
      '/tasks/reorder',
      { ordered_ids: [2, 1] },
      { params: { task_date: '2026-10-06' } },
    )
  })
})
