<template>
  <AuthLayout>
    <form class="flex flex-col gap-4" @submit.prevent="onSubmit">
      <h2 class="font-serif text-xl">Регистрация</h2>
      <UIInput v-model="email" label="Электронная почта" type="email" required />
      <UIInput v-model="password" label="Пароль" type="password" required />
      <p v-if="authStore.errorMessage" class="text-sm text-accent">{{ authStore.errorMessage }}</p>
      <UIButton variant="primary" type="submit" :disabled="authStore.isLoading">
        Зарегистрироваться
      </UIButton>
      <RouterLink class="text-sm underline" :to="{ name: PAGES.LOGIN }">Уже есть аккаунт</RouterLink>
    </form>
  </AuthLayout>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { RouterLink, useRouter } from 'vue-router'

import UIButton from '@/components/UI/UIButton/UIButton.vue'
import UIInput from '@/components/UI/UIInput/UIInput.vue'
import AuthLayout from '@/layouts/auth/AuthLayout/AuthLayout.vue'
import { PAGES } from '@/libs/constants/pages.constant'
import { useAuthStore } from '@/libs/stores/modules/auth.store'

const authStore = useAuthStore()
const router = useRouter()
const email = ref('')
const password = ref('')

const onSubmit = async () => {
  try {
    await authStore.register(email.value, password.value)
    await router.push({ name: PAGES.BOARD })
  } catch {
    return
  }
}
</script>
