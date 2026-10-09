import { createRouter, createWebHistory } from 'vue-router'

import { PAGES } from '@/libs/constants/pages.constant'
import { useAuthStore } from '@/libs/stores/modules/auth.store'

export const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/login',
      name: PAGES.LOGIN,
      component: () => import('@/pages/auth/LoginPage/LoginPage.vue'),
      meta: { guest: true },
    },
    {
      path: '/register',
      name: PAGES.REGISTER,
      component: () => import('@/pages/auth/RegisterPage/RegisterPage.vue'),
      meta: { guest: true },
    },
    {
      path: '/',
      component: () => import('@/layouts/app/AppLayout/AppLayout.vue'),
      meta: { requiresAuth: true },
      children: [
        {
          path: '',
          name: PAGES.BOARD,
          component: () => import('@/pages/tasks/WeekBoardPage/WeekBoardPage.vue'),
        },
        {
          path: 'deleted',
          name: PAGES.DELETED,
          component: () => import('@/pages/tasks/DeletedPage/DeletedPage.vue'),
        },
      ],
    },
  ],
})

router.beforeEach(async (to) => {
  const authStore = useAuthStore()
  if (!authStore.user && to.meta.requiresAuth) {
    const ok = await authStore.fetchMe()
    if (!ok) return { name: PAGES.LOGIN }
  }
  if (to.meta.guest && authStore.user) {
    return { name: PAGES.BOARD }
  }
  return true
})
