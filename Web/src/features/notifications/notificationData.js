import { paths } from '@/app/routes/paths'
import { localDate, displayDate, money } from '@/features/clinical/mockStore'

export function notificationsFor(clinic, user, reviewInbox = { appointmentRequests: [], paymentReports: [] }) {
  if (!user || !['admin', 'odontologo', 'asistente', 'paciente'].includes(user.role)) return []
  const personal = user.role === 'paciente'
  if (personal && !user.patientId) return []

  if (!personal) {
    const requests = reviewInbox.appointmentRequests
      .filter((item) => item.status === 'Por aprobar')
      .map((item) => ({
        id: 'review-appointment-' + item.id,
        title: 'Solicitud de cita por aprobar',
        detail: (clinic.patients.find((patient) => patient.id === item.patientId)?.name ?? 'Paciente') + ' · ' + displayDate(item.date) + ' ' + item.time,
        href: paths.appointments + '#solicitudes',
        kind: 'citas',
      }))
    const reports = reviewInbox.paymentReports
      .filter((item) => item.status === 'Por verificar')
      .map((item) => ({
        id: 'review-payment-' + item.id,
        title: 'Transferencia por verificar',
        detail: (clinic.patients.find((patient) => patient.id === item.patientId)?.name ?? 'Paciente') + ' · ' + money(item.amount),
        href: paths.payments + '#verificaciones',
        kind: 'pagos',
      }))
    return [...requests, ...reports]
  }

  const appointments = clinic.appointments
    .filter((item) => item.patientId === user.patientId && item.status === 'Pendiente')
    .sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time))
  const payments = clinic.payments.filter((item) => item.patientId === user.patientId)
  const items = []
  for (const appointment of appointments) {
    items.push({
      id: 'appointment-' + appointment.id + '-' + appointment.date + '-' + appointment.time,
      title: appointment.date >= localDate() ? 'Cita programada' : 'Cita pendiente de actualizar',
      detail: displayDate(appointment.date) + ' ' + appointment.time + ' · ' + appointment.treatment,
      href: paths.myAppointments,
      kind: 'citas',
    })
  }
  for (const payment of payments.filter((item) => item.status === 'Pendiente')) {
    items.push({
      id: 'pending-' + payment.id + '-' + payment.amount,
      title: 'Pago pendiente',
      detail: payment.concept + ' · ' + money(payment.amount, payment.currency),
      href: paths.myPayments,
      kind: 'pagos',
    })
  }
  return items
}