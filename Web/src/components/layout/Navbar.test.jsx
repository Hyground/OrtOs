import { describe, expect, it } from 'vitest'
import { render } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { Navbar } from './Navbar'

function renderNavbar() {
  return render(
    <MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <Navbar />
    </MemoryRouter>,
  )
}

describe('Navbar', () => {
  it('abre y cierra el menú lateral', async () => {
    const user = userEvent.setup()
    renderNavbar()

    const menu = document.getElementById('menu-movil')
    const openButton = document.querySelector('[aria-label="Abrir menú"]')
    const closeButton = document.querySelector('[aria-label="Cerrar menú"]')

    expect(menu).toHaveAttribute('aria-hidden', 'true')

    await user.click(openButton)
    expect(menu).toHaveAttribute('aria-hidden', 'false')
    expect(document.body.style.overflow).toBe('hidden')

    await user.click(closeButton)
    expect(menu).toHaveAttribute('aria-hidden', 'true')
    expect(document.body.style.overflow).toBe('')
  })
})
