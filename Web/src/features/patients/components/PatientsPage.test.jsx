import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { PatientsPage } from './PatientsPage'

it('mantiene el estado del paciente al cancelar la confirmación', async () => {
  const user = userEvent.setup()
  render(<MemoryRouter><PatientsPage /></MemoryRouter>)
  const toggle = screen.getAllByRole('button', { name: /Cambiar estado de .* a (Activo|Inactivo)/ })[0]
  const pressed = toggle.getAttribute('aria-pressed')
  await user.click(toggle)
  const dialog = screen.getByRole('dialog', { name: pressed === 'true' ? 'Desactivar paciente' : 'Activar paciente' })
  expect(toggle).toHaveAttribute('aria-pressed', pressed)
  await user.click(within(dialog).getByRole('button', { name: 'Cancelar' }))
  expect(toggle).toHaveAttribute('aria-pressed', pressed)
  await user.click(toggle)
  await user.click(within(screen.getByRole('dialog')).getByRole('button', {
    name: pressed === 'true' ? 'Desactivar' : 'Activar',
  }))
  await waitFor(() => expect(toggle).toHaveAttribute('aria-pressed', pressed === 'true' ? 'false' : 'true'))
})
