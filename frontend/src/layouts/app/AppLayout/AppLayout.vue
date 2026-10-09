<template>
  <div class="flex min-h-screen flex-col">
    <header class="border-b border-hairline">
      <div
        class="mx-auto flex max-w-7xl flex-col gap-2 px-2 py-4 sm:flex-row sm:items-center sm:justify-between sm:gap-3 sm:px-4"
      >
        <RouterLink
          :to="{ name: PAGES.BOARD }"
          class="shrink-0 font-serif text-2xl tracking-tight sm:text-3xl"
        >
          Трекер задач
        </RouterLink>
        <nav class="flex min-w-0 items-center gap-2 text-sm sm:gap-3">
          <RouterLink
            class="shrink-0 hover:underline"
            exact-active-class="underline"
            :to="{ name: PAGES.BOARD }"
          >
            Доска недели
          </RouterLink>
          <RouterLink
            ref="deletedNavRef"
            data-trash-fly-target
            class="shrink-0 hover:underline"
            exact-active-class="underline"
            :to="{ name: PAGES.DELETED }"
          >
            Удалённые
          </RouterLink>
          <span
            class="min-w-0 flex-1 truncate text-ink/60 sm:max-w-[12rem] md:max-w-[16rem]"
            :title="authStore.user?.email"
          >
            {{ authStore.user?.email }}
          </span>
          <UIButton size="icon" class="ml-auto shrink-0 sm:ml-0" aria-label="Выйти" @click="onLogout">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="1.75"
              stroke-linecap="round"
              stroke-linejoin="round"
              class="h-3.5 w-3.5"
              aria-hidden="true"
            >
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <path d="M16 17l5-5-5-5" />
              <path d="M21 12H9" />
            </svg>
          </UIButton>
        </nav>
      </div>
    </header>
    <main class="mx-auto flex w-full max-w-7xl flex-1 flex-col px-2 py-6 sm:px-4">
      <RouterView />
    </main>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, useTemplateRef } from 'vue'
import { RouterLink, RouterView, useRouter } from 'vue-router'

import UIButton from '@/components/UI/UIButton/UIButton.vue'
import { registerTrashFlyTarget } from '@/libs/classes/trash-fly-lib'
import { PAGES } from '@/libs/constants/pages.constant'
import { useAuthStore } from '@/libs/stores/modules/auth.store'

const authStore = useAuthStore()
const router = useRouter()
const deletedNavRef = useTemplateRef('deletedNavRef')

const resolveDeletedNavEl = () => {
  const value = deletedNavRef.value
  if (!value) return null
  if (value instanceof HTMLElement) return value
  const el = (value as { $el?: unknown }).$el
  return el instanceof HTMLElement ? el : null
}

onMounted(() => {
  registerTrashFlyTarget(resolveDeletedNavEl())
})

onUnmounted(() => {
  registerTrashFlyTarget(null)
})

const onLogout = async () => {
  await authStore.logout()
  await router.push({ name: PAGES.LOGIN })
}
</script>
