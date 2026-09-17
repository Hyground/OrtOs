import { useSyncExternalStore } from 'react'
import { getClinic, localDate, saveRecord } from './mockStore'

function dateAfter(days) {
  return localDate(new Date(Date.now() + days * 24 * 60 * 60 * 1000))
}

const seed = {
  appointmentRequests: [{
    id: 'demo-request-1',
    patientId: 'patient-1',
    date: dateAfter(3),
    time: '08:00',
    duration: '60',
    dentist: 'Dra. Ana Morales',
    treatment: 'Limpieza dental',
    status: 'Por aprobar',
    source: 'App (demostración)',
  }],
  paymentReports: [{
    id: 'demo-report-1',
    paymentId: 'payment-9',
    patientId: 'patient-9',
    amount: 250,
    method: 'Transferencia bancaria',
    reference: 'TRX-DEMO-250',
    status: 'Por verificar',
    source: 'App (demostración)',
  }],
}

let state = seed
const listeners = new Set()
const subscribe = (listener) => {
  listeners.add(listener)
  return () => listeners.delete(listener)
}
const emit = () => listeners.forEach((listener) => listener())
const update = (key, id, patch) => {
  state = {
    ...state,
    [key]: state[key].map((item) => item.id === id ? { ...item, ...patch } : item),
  }
  emit()
}

export const getReviewInbox = () => state
export function useReviewInbox() {
  return useSyncExternalStore(subscribe, getReviewInbox)
}

function minutes(time) {
  const [hour, minute] = time.split(':').map(Number)
  return hour * 60 + minute
}

export async function approveAppointmentRequest(id) {
  const request = state.appointmentRequests.find((item) => item.id === id)
  if (!request || request.status !== 'Por aprobar') throw new Error('Esta solicitud ya fue atendida.')
  if (request.date < localDate()) throw new Error('La fecha solicitada ya pasó.')
  if (!getClinic().patients.some((patient) => patient.id === request.patientId)) {
    throw new Error('No se encontró el paciente de la solicitud.')
  }
  const start = minutes(request.time)
  const end = start + Number(request.duration)
  const occupied = getClinic().appointments.some((appointment) => {
    if (appointment.status === 'Cancelada' || appointment.date !== request.date || appointment.dentist !== request.dentist) return false
    const otherStart = minutes(appointment.time)
    return start < otherStart + Number(appointment.duration || 60) && otherStart < end
  })
  if (occupied) throw new Error('Ese horario ya está ocupado. Revisa la agenda antes de aprobar.')

  const appointment = await saveRecord('appointments', {
    patientId: request.patientId,
    date: request.date,
    time: request.time,
    duration: request.duration,
    dentist: request.dentist,
    chair: 'Sillón 1',
    treatment: request.treatment,
    type: 'Tratamiento',
    priority: 'Media',
    reminder: '24',
    reason: 'Solicitud enviada desde la app',
    notes: '',
    status: 'Pendiente',
    requestId: request.id,
  })
  update('appointmentRequests', id, { status: 'Aprobada', appointmentId: appointment.id })
  return appointment
}

export function rejectAppointmentRequest(id, reason) {
  const request = state.appointmentRequests.find((item) => item.id === id)
  if (!request || request.status !== 'Por aprobar') throw new Error('Esta solicitud ya fue atendida.')
  if (!reason.trim()) throw new Error('Indica el motivo del rechazo.')
  update('appointmentRequests', id, { status: 'Rechazada', reason: reason.trim() })
}

export async function approvePaymentReport(id) {
  const report = state.paymentReports.find((item) => item.id === id)
  if (!report || report.status !== 'Por verificar') throw new Error('Este reporte ya fue atendido.')
  const payment = getClinic().payments.find((item) => item.id === report.paymentId)
  if (!payment || payment.status !== 'Pendiente' || payment.patientId !== report.patientId) {
    throw new Error('El pago vinculado ya no está pendiente.')
  }
  if (Number(report.amount) !== Number(payment.amount)) {
    throw new Error('El monto no coincide con el pago pendiente. Revisa el reporte.')
  }
  if (!report.reference.trim()) throw new Error('El reporte necesita una referencia.')

  await saveRecord('payments', {
    ...payment,
    date: localDate(),
    status: 'Completado',
    method: report.method,
    reference: report.reference,
    receipt: true,
  })
  update('paymentReports', id, { status: 'Verificado' })
}

export function rejectPaymentReport(id, reason) {
  const report = state.paymentReports.find((item) => item.id === id)
  if (!report || report.status !== 'Por verificar') throw new Error('Este reporte ya fue atendido.')
  if (!reason.trim()) throw new Error('Indica el motivo del rechazo.')
  update('paymentReports', id, { status: 'Rechazado', reason: reason.trim() })
}