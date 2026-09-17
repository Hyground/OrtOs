import { expect, it, vi } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { DashboardPage } from './DashboardPage'

vi.mock('@/features/auth/hooks/useAuth', () => ({
  useAuth: () => ({ user: { id: 'admin-test', role: 'admin', displayName: 'Administrador' } }),
}))

it('abre tareas individuales sin desplazar los módulos', async () => {
  render(<MemoryRouter><DashboardPage /></MemoryRouter>)

  expect(screen.getByRole('heading', { name: 'Areas de trabajo' })).toBeInTheDocument()
  await userEvent.setup().click(screen.getByRole('button', { name: 'Tareas pendientes, 52' }))
  expect(screen.getByRole('dialog', { name: 'Tareas pendientes' })).toBeInTheDocument()
  expect(screen.getByRole('link', { name: /Aprobar cita de/ })).toHaveAttribute('href', '/panel/citas#solicitudes')
  expect(screen.getByRole('link', { name: /Verificar transferencia de/ })).toHaveAttribute('href', '/panel/pagos#verificaciones')
})
it('muestra 50 tareas de ejemplo con aprobación simulada', async () => {
  const user = userEvent.setup()
  render(<MemoryRouter><DashboardPage /></MemoryRouter>)

  await user.click(screen.getByRole('button', { name: 'Tareas pendientes, 52' }))
  const list = screen.getByRole('list', { name: 'Tareas pendientes' })
  expect(list.children).toHaveLength(52)
  expect(screen.getByText('2 reales · 50 de ejemplo. Selecciona una tarea para aprobarla o verificarla.')).toBeInTheDocument()

  const firstExample = screen.getByText('Solicitud de cita #1').closest('li')
  await user.click(within(firstExample).getByRole('button', { name: 'Aprobar cita' }))
  expect(screen.getByRole('dialog', { name: 'Aprobar cita' })).toBeInTheDocument()
  await user.click(within(screen.getByRole('dialog', { name: 'Aprobar cita' })).getByRole('button', { name: 'Aprobar cita' }))

  expect(list.children).toHaveLength(51)
  expect(screen.queryByText('Solicitud de cita #1')).not.toBeInTheDocument()
  expect(screen.getByRole('link', { name: /Aprobar cita de/ })).toBeInTheDocument()
})