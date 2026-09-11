import { httpClient } from '@/lib/http/httpClient'
import { env } from '@/config/env'
import { servicesFallback } from './servicesFallback'

const CACHE_KEY = 'ortos.services.cache'
const TTL_MS = 30 * 60 * 1000

function readCache() {
  try {
    const raw = window.sessionStorage.getItem(CACHE_KEY)
    if (!raw) return null
    const { at, data } = JSON.parse(raw)
    if (!Array.isArray(data) || Date.now() - at > TTL_MS) return null
    return data
  } catch {
    return null
  }
}

function writeCache(data) {
  try {
    window.sessionStorage.setItem(CACHE_KEY, JSON.stringify({ at: Date.now(), data }))
  } catch {
    /* sessionStorage unavailable */
  }
}

function normalize(dto) {
  return {
    id: String(dto.id),
    name: dto.name ?? '',
    description: dto.description ?? '',
    category: dto.category ?? null,
  }
}

export const servicesService = {
  async list() {
    const cached = readCache()
    if (cached) return { services: cached, fromFallback: false }

    if (!env.apiUrl) return { services: servicesFallback, fromFallback: true }

    try {
      const data = await httpClient.get('/api/services', { auth: false })
      const services = Array.isArray(data) ? data.map(normalize) : []
      writeCache(services)
      return { services, fromFallback: false }
    } catch {
      return { services: servicesFallback, fromFallback: true }
    }
  },

  clearCache() {
    try {
      window.sessionStorage.removeItem(CACHE_KEY)
    } catch {
      /* sessionStorage unavailable */
    }
  },
}
