import { useSyncExternalStore } from 'react'
import { patientSeed } from '@/features/patients/mockData/patients'
import { appointmentSeed } from '@/features/appointments/mockData/appointments'
import { paymentSeed } from '@/features/payments/mockData/payments'
let state = { patients: patientSeed, appointments: appointmentSeed, payments: paymentSeed, charges: [], paymentPlans: [] }
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
export async function addCharge(data) {
  if (!state.patients.some((p) => p.id === data.patientId)) throw new Error('Selecciona un paciente válido.')
  const quantity = Number(data.quantity)
  const unitPrice = Number(data.unitPrice)
  if (!data.description?.trim() || quantity <= 0 || unitPrice < 0) throw new Error('Completa un cargo válido.')
  const charge = { ...data, id: 'charge-' + crypto.randomUUID(), quantity, unitPrice, subtotal: quantity * unitPrice, date: localDate(), status: 'Pendiente', allocations: [] }
  state = { ...state, charges: [charge, ...state.charges] }; listeners.forEach((fn) => fn()); return charge
}
export async function registerAccountPayment(data) {
  const pending = state.charges.filter((c) => c.patientId === data.patientId && c.status !== 'Anulado' && c.subtotal > (c.allocations || []).reduce((s, n) => s + n, 0))
  let remaining = Number(data.amount)
  if (!(remaining > 0)) throw new Error('Ingresa un monto válido.')
  const targets = data.chargeIds?.length ? pending.filter((c) => data.chargeIds.includes(c.id)) : pending.filter((c) => !data.appointmentId || c.appointmentId === data.appointmentId)
  const updated = state.charges.map((charge) => {
    if (!targets.some((c) => c.id === charge.id) || remaining <= 0) return charge
    const paid = (charge.allocations || []).reduce((s, n) => s + n, 0); const applied = Math.min(remaining, charge.subtotal - paid); remaining -= applied
    const allocations = [...(charge.allocations || []), applied]; const total = paid + applied
    return { ...charge, allocations, status: total === charge.subtotal ? 'Pagado' : 'Parcial' }
  })
  if (remaining > 0) throw new Error('El abono supera los cargos seleccionados.')
  const payment = await saveRecord('payments', { ...data, id: undefined, concept: 'Abono a cuenta', treatment: '', date: localDate(), currency: 'GTQ', receipt: true, status: 'Completado' })
  state = { ...state, charges: updated }; listeners.forEach((fn) => fn()); return payment
}
export const accountFor = (patientId, appointmentId = '') => {
  const charges = state.charges.filter((c) => c.patientId === patientId && (!appointmentId || c.appointmentId === appointmentId))
  const total = charges.filter((c) => c.status !== 'Anulado').reduce((s, c) => s + c.subtotal, 0)
  const paid = charges.reduce((s, c) => s + (c.allocations || []).reduce((a, n) => a + n, 0), 0)
  return { charges, total, paid, balance: total - paid }
}
export async function createPaymentPlan({ patientId, financedAmount, installmentCount }) {
  const amount = Number(financedAmount); const count = Number(installmentCount)
  const account = accountFor(patientId)
  if (!(amount > 0) || count < 1 || amount > account.balance) throw new Error('El plan debe cubrir un saldo pendiente válido.')
  const base = Math.floor((amount / count) * 100) / 100
  const installments = Array.from({ length: count }, (_, index) => ({ number: index + 1, amount: index === count - 1 ? Number((amount - base * (count - 1)).toFixed(2)) : base, dueDate: new Date(new Date().getFullYear(), new Date().getMonth() + index + 1, 1).toISOString().slice(0, 10), paidAmount: 0, status: 'Pendiente' }))
  const plan = { id: 'plan-' + crypto.randomUUID(), patientId, financedAmount: amount, installmentCount: count, status: 'Activo', installments }
  state = { ...state, paymentPlans: [plan, ...state.paymentPlans] }; listeners.forEach((fn) => fn()); return plan
}
export function nextReceipt() {
  const latest = Math.max(
    0,
    ...state.payments.map((p) => Number(p.receiptNumber?.split('-').at(-1)) || 0),
  )
  return 'CP-' + new Date().getFullYear() + '-' + String(latest + 1).padStart(6, '0')
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
