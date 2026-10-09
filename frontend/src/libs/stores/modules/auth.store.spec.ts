import { createPinia, setActivePinia } from 'pinia'

import { AuthApi } from '@/api/apis/auth.api'
import { useAuthStore } from '@/libs/stores/modules/auth.store'

vi.mock('@/api/apis/auth.api', () => ({
  AuthApi: {
    me: vi.fn(),
    login: vi.fn(),
    register: vi.fn(),
    logout: vi.fn(),
  },
}))

describe('useAuthStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  it('fetchMe sets user on success', async () => {
    vi.mocked(AuthApi.me).mockResolvedValue({ id: 1, email: 'a@b.c' })
    const store = useAuthStore()
    const ok = await store.fetchMe()
    expect(ok).toBe(true)
    expect(store.user?.email).toBe('a@b.c')
  })

  it('login sets error on failure', async () => {
    vi.mocked(AuthApi.login).mockRejectedValue(new Error('fail'))
    const store = useAuthStore()
    await expect(store.login('a@b.c', 'x')).rejects.toThrow()
    expect(store.errorMessage).toContain('email')
  })

  it('logout clears user', async () => {
    vi.mocked(AuthApi.logout).mockResolvedValue(undefined)
    const store = useAuthStore()
    store.user = { id: 1, email: 'a@b.c' }
    await store.logout()
    expect(store.user).toBeNull()
  })
})
