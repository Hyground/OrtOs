import { useSyncExternalStore } from 'react'
import { patientSeed } from '@/features/patients/mockData/patients'
import { appointmentSeed } from '@/features/appointments/mockData/appointments'
import { paymentSeed } from '@/features/payments/mockData/payments'
let state = { patients: patientSeed, appointments: appointmentSeed, payments: paymentSeed }
const listeners = new Set()
const subscribe = (listener) => {
  listeners.add(listener)
  return () => listeners.delete(listener)
}
export function useClinic() {
  return useSyncExternalStore(subscribe, () => state)
}
export const getClinic = () => state
export async function saveRecord(collection, data, { fail = false } = {}) {
  await new Promise((resolve) => setTimeout(resolve, 450))
  if (fail) throw new Error('No se pudo guardar. Intenta nuevamente.')
  if (collection !== 'patients' && !state.patients.some((p) => p.id === data.patientId))
    throw new Error('Selecciona un paciente válido.')
  if (
    collection === 'patients' &&
    data.dpi &&
    state.patients.some((p) => p.dpi === data.dpi && p.id !== data.id)
  )
    throw new Error('Ya existe un paciente con ese DPI.')
  const record = { ...data, id: data.id ?? collection + '-' + crypto.randomUUID() }
  if (collection === 'patients') {
    record.name = record.names.trim() + ' ' + record.surnames.trim()
    record.folio =
      data.folio ??
      'EXP-' + new Date().getFullYear() + '-' + String(state.patients.length + 257).padStart(5, '0')
  }
  if (collection === 'payments') {
    record.amount = Number(data.amount)
    record.receiptNumber = data.receipt ? data.receiptNumber || nextReceipt() : ''
  }
  state = {
    ...state,
    [collection]: data.id
      ? state[collection].map((r) => (r.id === data.id ? record : r))
      : [record, ...state[collection]],
  }
  listeners.forEach((fn) => fn())
  return record
}
export function nextReceipt() {
  const latest = Math.max(
    0,
    ...state.payments.map((p) => Number(p.receiptNumber?.split('-').at(-1)) || 0),
  )
  return 'CP-' + new Date().getFullYear() + '-' + String(latest + 1).padStart(6, '0')
}
export async function deletePatient(id) {
  await new Promise((resolve) => setTimeout(resolve, 300))
  if (
    state.appointments.some((a) => a.patientId === id) ||
    state.payments.some((p) => p.patientId === id)
  )
    throw new Error(
      'Este paciente tiene citas o pagos asociados. Puedes cambiar su estado a Inactivo al editarlo.',
    )
  state = { ...state, patients: state.patients.filter((p) => p.id !== id) }
  listeners.forEach((fn) => fn())
}
export function localDate(date = new Date()) {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Guatemala',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date)
}
export const displayDate = (value) =>
  value ? new Date(value + 'T12:00:00').toLocaleDateString('es-GT') : '—'
export function age(value) {
  if (!value) return ''
  const now = new Date()
  const birth = new Date(value + 'T12:00:00')
  return (
    now.getFullYear() -
    birth.getFullYear() -
    (now.getMonth() < birth.getMonth() ||
    (now.getMonth() === birth.getMonth() && now.getDate() < birth.getDate())
      ? 1
      : 0)
  )
}
export const money = (amount, currency = 'GTQ') =>
  new Intl.NumberFormat('es-GT', { style: 'currency', currency }).format(amount)
export const normalize = (text) =>
  String(text ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
