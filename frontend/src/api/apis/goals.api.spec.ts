import { apiClient } from '@/api/api.client'
import { GoalsApi } from '@/api/apis/goals.api'

vi.mock('@/api/api.client', () => ({
  apiClient: {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
  },
}))

describe('GoalsApi', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('create posts week_start and text', async () => {
    vi.mocked(apiClient.post).mockResolvedValue({
      data: {
        id: 1,
        week_start: '2026-10-05',
        text: 'Goal',
        is_done: false,
        created_at: '2026-10-05T10:00:00Z',
      },
    })
    await GoalsApi.create('2026-10-05', 'Goal')
    expect(apiClient.post).toHaveBeenCalledWith('/goals', {
      week_start: '2026-10-05',
      text: 'Goal',
    })
  })
})
