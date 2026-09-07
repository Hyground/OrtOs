import { beforeEach, describe, expect, it, vi } from 'vitest'
import { httpClient } from '@/lib/http/httpClient'
import { servicesService } from './servicesService'
import { servicesFallback } from './servicesFallback'

vi.mock('@/lib/http/httpClient', () => ({
  httpClient: { get: vi.fn() },
}))

describe('servicesService', () => {
  beforeEach(() => {
    window.sessionStorage.clear()
    vi.clearAllMocks()
  })

  it('normaliza la respuesta y la cachea', async () => {
    httpClient.get.mockResolvedValueOnce([{ id: 1, name: 'Ortodoncia', description: 'd' }])

    const first = await servicesService.list()
    expect(first.fromFallback).toBe(false)
    expect(first.services[0]).toEqual({
      id: '1',
      name: 'Ortodoncia',
      description: 'd',
      category: null,
    })

    await servicesService.list()
    expect(httpClient.get).toHaveBeenCalledTimes(1)
  })

  it('devuelve el fallback si la API falla', async () => {
    httpClient.get.mockRejectedValueOnce(new Error('sin conexión'))

    const result = await servicesService.list()
    expect(result.fromFallback).toBe(true)
    expect(result.services).toBe(servicesFallback)
  })
})
