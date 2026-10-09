import { apiClient } from '@/api/api.client'
import type { TUser } from '@/libs/types/task.type'

export class AuthApi {
  public static async register(email: string, password: string): Promise<TUser> {
    const res = await apiClient.post<TUser>('/auth/register', { email, password })
    return res.data
  }

  public static async login(email: string, password: string): Promise<TUser> {
    const res = await apiClient.post<TUser>('/auth/login', { email, password })
    return res.data
  }

  public static async logout(): Promise<void> {
    await apiClient.post('/auth/logout')
  }

  public static async me(): Promise<TUser> {
    const res = await apiClient.get<TUser>('/auth/me')
    return res.data
  }
}
