import { apiClient } from '@/api/api.client'
import type { TWeekStats } from '@/libs/types/task.type'

export class StatsApi {
  public static async week(weekStart: string): Promise<TWeekStats> {
    const res = await apiClient.get<TWeekStats>('/stats/week', {
      params: { week_start: weekStart },
    })
    return res.data
  }
}
