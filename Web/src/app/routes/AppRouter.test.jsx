import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { AuthProvider } from '@/features/auth/context/AuthProvider'
import { AuthDialogProvider } from '@/features/auth/context/AuthDialogProvider'
import { LoginModal } from '@/features/auth/components/LoginModal'
import { AppRouter } from './AppRouter'

function renderAt(route) {
  return render(
    <MemoryRouter
      initialEntries={[route]}
      future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
    >
      <AuthProvider>
        <AuthDialogProvider>
          <AppRouter />
          <LoginModal />
        </AuthDialogProvider>
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

  it('sin sesión, /panel redirige al inicio y abre el modal de login', async () => {
    renderAt('/panel')
    expect(
      await screen.findByRole('heading', { name: /la sonrisa fresca y sana que mereces/i }),
    ).toBeInTheDocument()
    expect(await screen.findByRole('dialog', { name: 'Iniciar sesión' })).toBeInTheDocument()
  })

  it('muestra 404 en rutas desconocidas', async () => {
    renderAt('/ruta-inexistente')
    expect(await screen.findByRole('heading', { name: '404' })).toBeInTheDocument()
  })
})
