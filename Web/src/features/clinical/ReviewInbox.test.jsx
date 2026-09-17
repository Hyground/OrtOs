import { expect, it } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { ReviewInbox } from './ReviewInbox'
import { getClinic } from './mockStore'

it('abre la bandeja al llegar desde una tarea o notificación', async () => {
  render(
    <MemoryRouter initialEntries={['/panel/citas#solicitudes']}>
      <ReviewInbox kind="appointments" />
    </MemoryRouter>,
  )

  expect(await screen.findByRole('dialog', { name: 'Solicitudes de cita' })).toBeInTheDocument()
})
it('exige un motivo al rechazar una solicitud y no crea una cita', async () => {
  const count = getClinic().appointments.length
  const user = userEvent.setup()
  render(<MemoryRouter><ReviewInbox kind="appointments" /></MemoryRouter>)

  await user.click(screen.getByRole('button', { name: 'Solicitudes de cita, 1 pendientes' }))
  const panel = screen.getByRole('region', { name: 'Solicitudes de cita' })
  await user.click(within(panel).getByRole('button', { name: 'Rechazar' }))
  await user.click(within(panel).getByRole('button', { name: 'Confirmar rechazo' }))
  expect(within(panel).getByRole('alert')).toHaveTextContent('Indica el motivo')
  await user.type(within(panel).getByLabelText('Motivo del rechazo'), 'Horario no disponible')
  await user.click(within(panel).getByRole('button', { name: 'Confirmar rechazo' }))

  expect(within(panel).getByText('No hay solicitudes de cita por revisar.')).toBeInTheDocument()
  expect(getClinic().appointments).toHaveLength(count)
})

it('rechaza un reporte sin convertir el pago pendiente en ingreso', async () => {
  const user = userEvent.setup()
  render(<MemoryRouter><ReviewInbox kind="payments" /></MemoryRouter>)

  await user.click(screen.getByRole('button', { name: 'Pagos por verificar, 1 pendientes' }))
  const panel = screen.getByRole('region', { name: 'Pagos por verificar' })
  await user.click(within(panel).getByRole('button', { name: 'Rechazar' }))
  await user.type(within(panel).getByLabelText('Motivo del rechazo'), 'Referencia no encontrada')
  await user.click(within(panel).getByRole('button', { name: 'Confirmar rechazo' }))

  expect(within(panel).getByText('No hay reportes de pago por revisar.')).toBeInTheDocument()
  expect(getClinic().payments.find((payment) => payment.id === 'payment-9').status).toBe('Pendiente')
})