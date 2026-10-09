import { apiClient } from '@/api/api.client'
import { AuthApi } from '@/api/apis/auth.api'

vi.mock('@/api/api.client', () => ({
  apiClient: {
    post: vi.fn(),
    get: vi.fn(),
  },
}))

describe('AuthApi', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('login posts credentials', async () => {
    vi.mocked(apiClient.post).mockResolvedValue({ data: { id: 1, email: 'a@b.c' } })
    const res = await AuthApi.login('a@b.c', 'secret12')
    expect(apiClient.post).toHaveBeenCalledWith('/auth/login', {
      email: 'a@b.c',
      password: 'secret12',
    })
    expect(res.email).toBe('a@b.c')
  })

  it('me gets current user', async () => {
    vi.mocked(apiClient.get).mockResolvedValue({ data: { id: 1, email: 'a@b.c' } })
    const res = await AuthApi.me()
    expect(apiClient.get).toHaveBeenCalledWith('/auth/me')
    expect(res.id).toBe(1)
  })
})
