import { env } from '@/config/env'
import { httpClient } from '@/lib/http/httpClient'
import { tokenStorage } from '@/lib/storage/tokenStorage'
import { HttpError } from '@/lib/http/HttpError'
import {
  findDevAccountByEmail,
  findDevAccountById,
} from '@/features/users/services/usersMockService'

const DEV_TOKEN_PREFIX = 'ortos-dev-token:'

function toAuthUser(dto) {
  return {
    id: dto.id,
    email: dto.email,
    displayName: dto.displayName ?? dto.email,
    role: dto.role ?? 'paciente',
    patientId: dto.patientId,
  }
}

function findDevUserByEmail(email) {
  return findDevAccountByEmail(email)
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
  return findDevAccountById(id) ?? null
}

function loginWithDevUser({ email, password }) {
  const user = findDevUserByEmail(email)
  if (!user || !user.active || user.password !== password) {
    throw new HttpError('Correo o contraseña incorrectos.', {
      status: 401,
      code: 'DEV_AUTH_FAILED',
    })
  }
  return createDevSession(user)
}

export const authService = {
  async login({ email, password }) {
    // Las cuentas demo deben seguir funcionando en Vercel mientras no exista API.
    const devUser = findDevUserByEmail(email)
    if (!env.apiUrl || devUser) return loginWithDevUser({ email, password })

    const data = await httpClient.post('/api/auth/login', { email, password }, { auth: false })
    return { token: data.token, user: toAuthUser(data.user) }
  },

  async loginWithGoogle({ idToken }) {
    const data = await httpClient.post('/api/auth/login/google', { idToken }, { auth: false })
    return { token: data.token, user: toAuthUser(data.user) }
  },

  async me() {
    {
      const devUser = getDevUserFromToken(tokenStorage.get())
      if (devUser?.active) return toAuthUser(devUser)
      if (tokenStorage.get()?.startsWith(DEV_TOKEN_PREFIX))
        throw new Error('La cuenta no está activa.')
    }

    const data = await httpClient.get('/api/auth/me')
    return toAuthUser(data)
  },

  async requestPasswordReset({ email }) {
    if ((!env.apiUrl || env.isDev) && findDevUserByEmail(email)) return
    await httpClient.post('/api/auth/password-reset', { email }, { auth: false })
  },
}
