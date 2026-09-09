import { env } from '@/config/env'
import { httpClient } from '@/lib/http/httpClient'
import { tokenStorage } from '@/lib/storage/tokenStorage'
import { HttpError } from '@/lib/http/HttpError'

const DEV_TOKEN_PREFIX = 'ortos-dev-token:'

const devUsers = [
  {
    id: 'dev-admin',
    email: 'admin@ortos.test',
    password: 'Admin123',
    displayName: 'Administrador OrtOs',
  },
  {
    id: 'dev-paciente',
    email: 'paciente@ortos.test',
    password: 'Paciente123',
    displayName: 'Paciente Demo',
  },
]

function toAuthUser(dto) {
  return {
    id: dto.id,
    email: dto.email,
    displayName: dto.displayName ?? dto.email,
  }
}

function findDevUserByEmail(email) {
  return devUsers.find((user) => user.email.toLowerCase() === String(email).trim().toLowerCase())
}

function createDevSession(user) {
  return {
    token: `${DEV_TOKEN_PREFIX}${user.id}`,
    user: toAuthUser(user),
  }
}

function getDevUserFromToken(token) {
  if (!token?.startsWith(DEV_TOKEN_PREFIX)) return null
  const id = token.slice(DEV_TOKEN_PREFIX.length)
  return devUsers.find((user) => user.id === id) ?? null
}

function loginWithDevUser({ email, password }) {
  const user = findDevUserByEmail(email)
  if (!user || user.password !== password) {
    throw new HttpError('Correo o contrasena incorrectos.', {
      status: 401,
      code: 'DEV_AUTH_FAILED',
    })
  }
  return createDevSession(user)
}

export const authService = {
  async login({ email, password }) {
    if (env.isDev) {
      const devUser = findDevUserByEmail(email)
      if (devUser || !env.apiUrl) return loginWithDevUser({ email, password })
    }

    const data = await httpClient.post('/api/auth/login', { email, password }, { auth: false })
    return { token: data.token, user: toAuthUser(data.user) }
  },

  async loginWithGoogle({ idToken }) {
    const data = await httpClient.post('/api/auth/login/google', { idToken }, { auth: false })
    return { token: data.token, user: toAuthUser(data.user) }
  },

  async me() {
    if (env.isDev) {
      const devUser = getDevUserFromToken(tokenStorage.get())
      if (devUser) return toAuthUser(devUser)
    }

    const data = await httpClient.get('/api/auth/me')
    return toAuthUser(data)
  },

  async requestPasswordReset({ email }) {
    if (env.isDev && findDevUserByEmail(email)) return
    await httpClient.post('/api/auth/password-reset', { email }, { auth: false })
  },
}
