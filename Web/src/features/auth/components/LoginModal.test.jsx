import { beforeEach, describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, useLocation } from 'react-router-dom'
import { AuthProvider } from '../context/AuthProvider'
import { AuthDialogProvider } from '../context/AuthDialogProvider'
import { useAuthDialog } from '../hooks/useAuthDialog'
import { LoginModal } from './LoginModal'

function Opener() {
  const { open } = useAuthDialog()
  return (
    <button type="button" onClick={open}>
      abrir
    </button>
  )
}

function LocationProbe() {
  const location = useLocation()
  return <div data-testid="location">{location.pathname}</div>
}

function setup() {
  return render(
    <MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <AuthProvider>
        <AuthDialogProvider>
          <Opener />
          <LoginModal />
          <LocationProbe />
        </AuthDialogProvider>
      </AuthProvider>
    </MemoryRouter>,
  )
}

describe('LoginModal', () => {
  beforeEach(() => {
    window.localStorage.clear()
  })

  it('valida los campos vacíos al enviar', async () => {
    const user = userEvent.setup()
    setup()
    await user.click(screen.getByRole('button', { name: 'abrir' }))
    await user.click(screen.getByRole('button', { name: 'Iniciar sesión' }))

    expect(screen.getByText('Ingresá tu correo.')).toBeInTheDocument()
    expect(screen.getByText('Ingresá tu contraseña.')).toBeInTheDocument()
  })

  it('cambia a recuperar contraseña y vuelve', async () => {
    const user = userEvent.setup()
    setup()
    await user.click(screen.getByRole('button', { name: 'abrir' }))

    await user.click(screen.getByRole('button', { name: '¿Olvidaste tu contraseña?' }))
    expect(screen.getByRole('heading', { name: 'Recuperar contraseña' })).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Volver a iniciar sesión' }))
    expect(screen.getByRole('heading', { name: 'Iniciar sesión' })).toBeInTheDocument()
  })

  it('redirige al panel cuando el login es exitoso', async () => {
    const user = userEvent.setup()
    setup()
    await user.click(screen.getByRole('button', { name: 'abrir' }))

    await user.type(screen.getByLabelText('Correo'), 'admin@ortos.test')
    await user.type(screen.getByLabelText('Contraseña'), 'Admin123')
    await user.click(screen.getByRole('button', { name: 'Iniciar sesión' }))

    expect(await screen.findByTestId('location')).toHaveTextContent('/panel')
  })
})
