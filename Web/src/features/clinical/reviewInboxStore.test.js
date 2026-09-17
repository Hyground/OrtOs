import { expect, it } from 'vitest'
import { getClinic } from './mockStore'
import {
  getReviewInbox,
  approveAppointmentRequest,
  approvePaymentReport,
  rejectPaymentReport,
} from './reviewInboxStore'

it('aprueba una solicitud creando una única cita agendada', async () => {
  const count = getClinic().appointments.length
  const request = getReviewInbox().appointmentRequests[0]
  const appointment = await approveAppointmentRequest(request.id)

  expect(getClinic().appointments).toHaveLength(count + 1)
  expect(appointment.status).toBe('Pendiente')
  expect(appointment.requestId).toBe(request.id)
  expect(getReviewInbox().appointmentRequests[0].status).toBe('Aprobada')
  await expect(approveAppointmentRequest(request.id)).rejects.toThrow('ya fue atendida')
})

it('verifica un reporte actualizando el pago existente sin duplicarlo', async () => {
  const count = getClinic().payments.length
  const report = getReviewInbox().paymentReports[0]
  await approvePaymentReport(report.id)

  expect(getClinic().payments).toHaveLength(count)
  expect(getClinic().payments.find((payment) => payment.id === report.paymentId)).toMatchObject({
    status: 'Completado',
    reference: report.reference,
  })
  expect(getReviewInbox().paymentReports[0].status).toBe('Verificado')
  expect(() => rejectPaymentReport(report.id, 'No coincide')).toThrow('ya fue atendido')
})