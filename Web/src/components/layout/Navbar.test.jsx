import { describe, expect, it } from 'vitest'
import { render } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { AuthDialogProvider } from '@/features/auth/context/AuthDialogProvider'
import { LoginModal } from '@/features/auth/components/LoginModal'
import { Navbar } from './Navbar'

function renderNavbar() {
  return render(
    <MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <AuthDialogProvider>
        <Navbar />
        <LoginModal />
      </AuthDialogProvider>
    </MemoryRouter>,
  )
}

describe('Navbar', () => {
  it('abre y cierra el menú lateral', async () => {
    const user = userEvent.setup()
    renderNavbar()

    const menu = document.getElementById('menu-movil')
    expect(menu).toHaveAttribute('aria-hidden', 'true')

    await user.click(document.querySelector('[aria-label="Abrir menú"]'))
    expect(menu).toHaveAttribute('aria-hidden', 'false')
    expect(document.body.style.overflow).toBe('hidden')

    await user.click(document.querySelector('[aria-label="Cerrar menú"]'))
    expect(menu).toHaveAttribute('aria-hidden', 'true')
    expect(document.body.style.overflow).toBe('')
  })

  it('el botón de iniciar sesión abre el modal', async () => {
    const user = userEvent.setup()
    renderNavbar()

    expect(document.querySelector('[role="dialog"]')).toBeNull()
    await user.click(document.querySelector('[class*="desktopLogin"]'))
    expect(document.querySelector('[role="dialog"]')).not.toBeNull()
  })
})
