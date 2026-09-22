import { useSyncExternalStore } from 'react'
import { patientSeed } from '@/features/patients/mockData/patients'
import { appointmentSeed } from '@/features/appointments/mockData/appointments'
import { paymentSeed } from '@/features/payments/mockData/payments'
const mariaCharge = {
  id: 'charge-maria-consulta',
  patientId: 'patient-1',
  appointmentId: 'appointment-1',
  description: 'Consulta general',
  quantity: 1,
  unitPrice: 150,
  subtotal: 150,
  date: '2026-09-21',
  status: 'Parcial',
  allocations: [{ paymentId: 'payment-1', amount: 100 }],
}
const mariaPlan = {
  id: 'plan-maria-ortodoncia',
  patientId: 'patient-1',
  name: 'Ortodoncia',
  totalAmount: 2400,
  downPayment: 600,
  financedAmount: 1800,
  installmentCount: 6,
  status: 'Activo',
  installments: [1, 2, 3, 4, 5, 6].map((number) => ({
    number,
    amount: 300,
    dueDate: `2026-${String(6 + number).padStart(2, '0')}-15`,
    paidAmount: number <= 2 ? 300 : 0,
    status: number <= 2 ? 'Pagada' : 'Pendiente',
  })),
}
let state = {
  patients: patientSeed,
  appointments: appointmentSeed,
  payments: paymentSeed.map((payment) =>
    payment.id === 'payment-1'
      ? {
          ...payment,
          patientId: 'patient-1',
          concept: 'Anticipo',
          treatment: 'Consulta general',
          date: '2026-09-21',
          amount: 100,
          method: 'Efectivo',
          reference: 'REC-001',
          allocations: [{ chargeId: mariaCharge.id, amount: 100 }],
        }
      : payment,
  ),
  charges: [mariaCharge],
  paymentPlans: [mariaPlan],
}
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
  if (!state.patients.some((p) => p.id === data.patientId))
    throw new Error('Selecciona un paciente válido.')
  const quantity = Number(data.quantity)
  const unitPrice = Number(data.unitPrice)
  if (!data.description?.trim() || quantity <= 0 || unitPrice < 0)
    throw new Error('Completa un cargo válido.')
  const charge = {
    ...data,
    id: 'charge-' + crypto.randomUUID(),
    quantity,
    unitPrice,
    subtotal: Number((quantity * unitPrice).toFixed(2)),
    date: localDate(),
    status: 'Pendiente',
    allocations: [],
  }
  state = { ...state, charges: [charge, ...state.charges] }
  listeners.forEach((fn) => fn())
  return charge
}
export async function registerAccountPayment(data) {
  const paidFor = (charge) =>
    (charge.allocations || []).reduce(
      (sum, allocation) => sum + Number(allocation.amount ?? allocation),
      0,
    )
  const pending = state.charges.filter(
    (c) => c.patientId === data.patientId && c.status !== 'Anulado' && c.subtotal > paidFor(c),
  )
  let remaining = Number(data.amount)
  if (!(remaining > 0)) throw new Error('Ingresa un monto válido.')
  const targets = data.chargeIds?.length
    ? pending.filter((c) => data.chargeIds.includes(c.id))
    : pending.filter((c) => !data.appointmentId || c.appointmentId === data.appointmentId)
  const paymentId = 'payment-' + crypto.randomUUID()
  const allocations = []
  const updated = state.charges.map((charge) => {
    if (!targets.some((c) => c.id === charge.id) || remaining <= 0) return charge
    const paid = paidFor(charge)
    const applied = Math.min(remaining, charge.subtotal - paid)
    remaining -= applied
    const chargeAllocations = [...(charge.allocations || []), { paymentId, amount: applied }]
    const total = paid + applied
    allocations.push({ chargeId: charge.id, amount: applied })
    return {
      ...charge,
      allocations: chargeAllocations,
      status: total === charge.subtotal ? 'Pagado' : 'Parcial',
    }
  })
  if (remaining > 0) throw new Error('El abono supera los cargos seleccionados.')
  const payment = {
    ...data,
    id: paymentId,
    concept: 'Abono a cuenta',
    treatment: '',
    date: localDate(),
    currency: 'GTQ',
    receipt: true,
    receiptNumber: nextReceipt(),
    status: 'Completado',
    allocations,
  }
  state = { ...state, charges: updated, payments: [payment, ...state.payments] }
  listeners.forEach((fn) => fn())
  return payment
}
export const accountFor = (patientId, appointmentId = '') => {
  const charges = state.charges.filter(
    (c) => c.patientId === patientId && (!appointmentId || c.appointmentId === appointmentId),
  )
  const total = charges.filter((c) => c.status !== 'Anulado').reduce((s, c) => s + c.subtotal, 0)
  const paid = charges.reduce(
    (s, c) => s + (c.allocations || []).reduce((a, n) => a + Number(n.amount ?? n), 0),
    0,
  )
  const paymentIds = new Set(
    charges.flatMap((c) => (c.allocations || []).map((a) => a.paymentId)).filter(Boolean),
  )
  return {
    charges,
    payments: state.payments.filter((p) => paymentIds.has(p.id)),
    total,
    paid,
    balance: Math.max(0, total - paid),
  }
}
export async function createPaymentPlan({
  patientId,
  totalAmount,
  downPayment = 0,
  financedAmount,
  installmentCount,
  firstDueDate,
  dueDates = [],
  name = 'Plan de pago',
}) {
  const amount = Number(financedAmount)
  const count = Number(installmentCount)
  const account = accountFor(patientId)
  if (!(amount > 0) || count < 1 || amount > account.balance)
    throw new Error('El plan debe cubrir un saldo pendiente válido.')
  const base = Math.floor((amount / count) * 100) / 100
  const start =
    firstDueDate ||
    new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1).toISOString().slice(0, 10)
  const installments = Array.from({ length: count }, (_, index) => ({
    number: index + 1,
    amount: index === count - 1 ? Number((amount - base * (count - 1)).toFixed(2)) : base,
    dueDate:
      dueDates[index] ||
      new Date(
        new Date(start + 'T12:00:00').getFullYear(),
        new Date(start + 'T12:00:00').getMonth() + index,
        new Date(start + 'T12:00:00').getDate(),
      )
        .toISOString()
        .slice(0, 10),
    paidAmount: 0,
    status: 'Pendiente',
  }))
  const plan = {
    id: 'plan-' + crypto.randomUUID(),
    patientId,
    name,
    totalAmount: Number(totalAmount || amount),
    downPayment: Number(downPayment),
    financedAmount: amount,
    installmentCount: count,
    status: 'Activo',
    installments,
  }
  state = { ...state, paymentPlans: [plan, ...state.paymentPlans] }
  listeners.forEach((fn) => fn())
  return plan
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
export const moneyRounded = (amount, currency = 'GTQ') =>
  new Intl.NumberFormat('es-GT', { style: 'currency', currency, maximumFractionDigits: 0 }).format(
    Math.round(Number(amount || 0) / 5) * 5,
  )
export const normalize = (text) =>
  String(text ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
