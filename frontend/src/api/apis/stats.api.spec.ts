import { apiClient } from '@/api/api.client'
import { StatsApi } from '@/api/apis/stats.api'

vi.mock('@/api/api.client', () => ({
  apiClient: {
    get: vi.fn(),
  },
}))

describe('StatsApi', () => {
  it('week requests stats for week_start', async () => {
    vi.mocked(apiClient.get).mockResolvedValue({
      data: { total: 1, done: 0, not_done: 1, completion_percent: 0 },
    })
    const res = await StatsApi.week('2026-10-05')
    expect(apiClient.get).toHaveBeenCalledWith('/stats/week', {
      params: { week_start: '2026-10-05' },
    })
    expect(res.total).toBe(1)
  })
})
