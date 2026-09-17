import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { DoctorsPage } from './DoctorsPage'

it('confirma el cambio de estado de un médico antes de aplicarlo', async () => {
  const user = userEvent.setup()
  render(<MemoryRouter><DoctorsPage /></MemoryRouter>)
  const toggle = screen.getByRole('button', { name: /Cambiar estado de Luis Cano Médico a Inactivo/ })
  expect(toggle).toHaveAttribute('aria-pressed', 'true')
  await user.click(toggle)
  const dialog = screen.getByRole('dialog', { name: 'Desactivar médico' })
  expect(toggle).toHaveAttribute('aria-pressed', 'true')
  await user.click(within(dialog).getByRole('button', { name: 'Cancelar' }))
  expect(toggle).toHaveAttribute('aria-pressed', 'true')
  await user.click(toggle)
  await user.click(within(screen.getByRole('dialog', { name: 'Desactivar médico' }))
    .getByRole('button', { name: 'Desactivar' }))
  expect(toggle).toHaveAttribute('aria-pressed', 'false')
})
