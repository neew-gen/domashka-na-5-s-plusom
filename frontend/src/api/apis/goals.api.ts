import { apiClient } from '@/api/api.client'
import type { TWeekGoal } from '@/libs/types/task.type'

export class GoalsApi {
  public static async list(weekStart: string): Promise<TWeekGoal[]> {
    const res = await apiClient.get<TWeekGoal[]>('/goals', { params: { week_start: weekStart } })
    return res.data
  }

  public static async create(weekStart: string, text: string): Promise<TWeekGoal> {
    const res = await apiClient.post<TWeekGoal>('/goals', { week_start: weekStart, text })
    return res.data
  }

  public static async update(
    goalId: number,
    payload: Partial<{ text: string; is_done: boolean }>,
  ): Promise<TWeekGoal> {
    const res = await apiClient.patch<TWeekGoal>(`/goals/${goalId}`, payload)
    return res.data
  }

  public static async remove(goalId: number): Promise<void> {
    await apiClient.delete(`/goals/${goalId}`)
  }
}
