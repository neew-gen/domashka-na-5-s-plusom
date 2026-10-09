import { defineStore } from 'pinia'
import { ref } from 'vue'

import { AuthApi } from '@/api/apis/auth.api'
import type { TUser } from '@/libs/types/task.type'

export const useAuthStore = defineStore('auth', () => {
  const user = ref<TUser | null>(null)
  const isLoading = ref(false)
  const errorMessage = ref('')

  const clearError = () => {
    errorMessage.value = ''
  }

  const fetchMe = async () => {
    isLoading.value = true
    clearError()
    try {
      user.value = await AuthApi.me()
      return true
    } catch {
      user.value = null
      return false
    } finally {
      isLoading.value = false
    }
  }

  const login = async (email: string, password: string) => {
    isLoading.value = true
    clearError()
    try {
      user.value = await AuthApi.login(email, password)
    } catch {
      errorMessage.value = 'Неверный email или пароль'
      throw new Error(errorMessage.value)
    } finally {
      isLoading.value = false
    }
  }

  const register = async (email: string, password: string) => {
    isLoading.value = true
    clearError()
    try {
      user.value = await AuthApi.register(email, password)
    } catch {
      errorMessage.value = 'Не удалось зарегистрироваться. Возможно, email уже занят'
      throw new Error(errorMessage.value)
    } finally {
      isLoading.value = false
    }
  }

  const logout = async () => {
    await AuthApi.logout()
    user.value = null
  }

  return {
    user,
    isLoading,
    errorMessage,
    fetchMe,
    login,
    register,
    logout,
    clearError,
  }
})
