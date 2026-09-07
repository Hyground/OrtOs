import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
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

function setup() {
  return render(
    <AuthProvider>
      <AuthDialogProvider>
        <Opener />
        <LoginModal />
      </AuthDialogProvider>
    </AuthProvider>,
  )
}

describe('LoginModal', () => {
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
})
