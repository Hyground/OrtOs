import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { AuthProvider } from '@/features/auth/context/AuthProvider'
import { AppRouter } from './AppRouter'

function renderAt(route) {
  return render(
    <MemoryRouter
      initialEntries={[route]}
      future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
    >
      <AuthProvider>
        <AppRouter />
      </AuthProvider>
    </MemoryRouter>,
  )
}

describe('AppRouter', () => {
  it('muestra la landing pública en la raíz', async () => {
    renderAt('/')
    expect(
      await screen.findByRole('heading', { name: /la sonrisa fresca y sana que mereces/i }),
    ).toBeInTheDocument()
  })

  it('redirige al login cuando se entra al panel sin sesión', async () => {
    renderAt('/panel')
    expect(await screen.findByRole('heading', { name: 'Iniciar sesión' })).toBeInTheDocument()
  })

  it('muestra 404 en rutas desconocidas', async () => {
    renderAt('/ruta-inexistente')
    expect(await screen.findByRole('heading', { name: '404' })).toBeInTheDocument()
  })
})
