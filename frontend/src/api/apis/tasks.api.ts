import { apiClient } from '@/api/api.client'
import type { TImportance, TTask, TTaskCreate } from '@/libs/types/task.type'

export class TasksApi {
  public static async listWeek(weekStart: string, search?: string): Promise<TTask[]> {
    const res = await apiClient.get<TTask[]>('/tasks', {
      params: { week_start: weekStart, search: search || undefined },
    })
    return res.data
  }

  public static async listDeleted(search?: string): Promise<TTask[]> {
    const res = await apiClient.get<TTask[]>('/tasks/deleted', {
      params: { search: search || undefined },
    })
    return res.data
  }

  public static async create(payload: TTaskCreate): Promise<TTask> {
    const res = await apiClient.post<TTask>('/tasks', payload)
    return res.data
  }

  public static async update(
    taskId: number,
    payload: Partial<{
      title: string
      description: string
      importance: TImportance
      task_date: string
      deadline: string | null
      is_done: boolean
      position: number
    }>,
  ): Promise<TTask> {
    const res = await apiClient.patch<TTask>(`/tasks/${taskId}`, payload)
    return res.data
  }

  public static async move(taskId: number, taskDate: string, position?: number): Promise<TTask> {
    const res = await apiClient.post<TTask>(`/tasks/${taskId}/move`, {
      task_date: taskDate,
      position,
    })
    return res.data
  }

  public static async reorder(taskDate: string, orderedIds: number[]): Promise<TTask[]> {
    const res = await apiClient.post<TTask[]>('/tasks/reorder', { ordered_ids: orderedIds }, {
      params: { task_date: taskDate },
    })
    return res.data
  }

  public static async softDelete(taskId: number): Promise<TTask> {
    const res = await apiClient.delete<TTask>(`/tasks/${taskId}`)
    return res.data
  }

  public static async restore(taskId: number, taskDate?: string): Promise<TTask> {
    const res = await apiClient.post<TTask>(`/tasks/${taskId}/restore`, {
      task_date: taskDate ?? null,
    })
    return res.data
  }

  public static async purge(taskId: number): Promise<void> {
    await apiClient.delete(`/tasks/${taskId}/permanent`)
  }

  public static async purgeAll(): Promise<number> {
    const res = await apiClient.delete<{ deleted: number }>('/tasks/deleted/purge')
    return res.data.deleted
  }
}
