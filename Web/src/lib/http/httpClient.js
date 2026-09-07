import { env } from '@/config/env'
import { tokenStorage } from '@/lib/storage/tokenStorage'
import { HttpError } from './HttpError'

async function request(path, { method = 'GET', body, headers = {}, auth = true, signal } = {}) {
  const finalHeaders = { Accept: 'application/json', ...headers }
  let payload

  if (body !== undefined) {
    finalHeaders['Content-Type'] = 'application/json'
    payload = JSON.stringify(body)
  }

  if (auth) {
    const token = tokenStorage.get()
    if (token) finalHeaders.Authorization = `Bearer ${token}`
  }

  let response
  try {
    response = await fetch(`${env.apiUrl}${path}`, {
      method,
      headers: finalHeaders,
      body: payload,
      signal,
    })
  } catch (cause) {
    throw new HttpError('No fue posible conectar con el servidor', {
      status: 0,
      code: 'NETWORK',
      details: cause,
    })
  }

  const data = await parseBody(response)

  if (!response.ok) {
    throw new HttpError(data?.message ?? 'La solicitud falló', {
      status: response.status,
      code: data?.code ?? 'HTTP_ERROR',
      details: data,
    })
  }

  return data
}

async function parseBody(response) {
  if (response.status === 204) return null
  const text = await response.text()
  if (!text) return null
  try {
    return JSON.parse(text)
  } catch {
    return text
  }
}

export const httpClient = {
  get: (path, options) => request(path, { ...options, method: 'GET' }),
  post: (path, body, options) => request(path, { ...options, method: 'POST', body }),
  put: (path, body, options) => request(path, { ...options, method: 'PUT', body }),
  patch: (path, body, options) => request(path, { ...options, method: 'PATCH', body }),
  delete: (path, options) => request(path, { ...options, method: 'DELETE' }),
}
