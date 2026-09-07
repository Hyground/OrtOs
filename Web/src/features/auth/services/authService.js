import { httpClient } from '@/lib/http/httpClient'

function toAuthUser(dto) {
  return {
    id: dto.id,
    email: dto.email,
    displayName: dto.displayName ?? dto.email,
  }
}

export const authService = {
  async login({ email, password }) {
    const data = await httpClient.post('/api/auth/login', { email, password }, { auth: false })
    return { token: data.token, user: toAuthUser(data.user) }
  },

  async me() {
    const data = await httpClient.get('/api/auth/me')
    return toAuthUser(data)
  },

  async requestPasswordReset({ email }) {
    await httpClient.post('/api/auth/password-reset', { email }, { auth: false })
  },
}
