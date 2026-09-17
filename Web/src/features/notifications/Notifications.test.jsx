import { beforeEach, expect, it, vi } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { Notifications } from './Notifications'

vi.mock('@/features/auth/hooks/useAuth', () => ({
  useAuth: () => ({ user: { id: 'admin-test', role: 'admin' } }),
}))

vi.mock('@/features/clinical/mockStore', () => ({
  localDate: () => '2026-09-17',
  displayDate: (date) => date,
  money: (amount) => String(amount),
  useClinic: () => ({
    patients: [{ id: 'patient-1', name: 'Paciente Uno' }],
    appointments: [],
    payments: [],
  }),
}))

beforeEach(() => localStorage.clear())

it('mantiene las tareas en la campana hasta que se atienden', async () => {
  const user = userEvent.setup()
  render(<MemoryRouter><Notifications /></MemoryRouter>)

  await user.click(screen.getByRole('button', { name: 'Notificaciones, 2 pendientes' }))
  const dialog = screen.getByRole('dialog', { name: 'Notificaciones' })
  expect(within(dialog).getByText('2 tareas pendientes')).toBeInTheDocument()
  expect(within(dialog).getByText('Solicitud de cita por aprobar')).toBeInTheDocument()
  expect(within(dialog).getByText('Transferencia por verificar')).toBeInTheDocument()
  expect(within(dialog).queryByRole('button', { name: 'Marcar todas como leídas' })).not.toBeInTheDocument()
  expect(within(dialog).getByRole('link', { name: 'Ver cita' })).toHaveAttribute('href', '/panel/citas#solicitudes')
  expect(within(dialog).getByRole('link', { name: 'Ver pago' })).toHaveAttribute('href', '/panel/pagos#verificaciones')

  await user.click(within(dialog).getByRole('link', { name: 'Ver cita' }))
  expect(screen.getByRole('button', { name: 'Notificaciones, 2 pendientes' })).toBeInTheDocument()
})