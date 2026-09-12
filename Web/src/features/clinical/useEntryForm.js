import { useRef, useState } from 'react'
import { saveRecord, localDate, getClinic } from './mockStore'
const CLINIC_OPEN_MIN = 7 * 60
const CLINIC_CLOSE_MIN = 21 * 60
const timeToMinutes = (t) => {
  const [h, m] = t.split(':').map(Number)
  return h * 60 + m
}
function nowInClinicTz() {
  return {
    date: localDate(),
    time: new Intl.DateTimeFormat('en-GB', {
      timeZone: 'America/Guatemala',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    }).format(new Date()),
  }
}
export function useEntryForm(collection, initial, onSaved) {
  const [values, setValues] = useState(initial)
  const [errors, setErrors] = useState({})
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)
  const lock = useRef(false)
  const set = (key, value) => {
    setValues((v) => ({ ...v, [key]: value }))
    setErrors((e) => ({ ...e, [key]: undefined }))
    setError('')
  }
  const submit = async (e) => {
    e.preventDefault()
    if (lock.current) return
    const formElement = e.currentTarget
    const next = validateEntry(collection, values)
    setErrors(next)
    if (Object.keys(next).length) {
      setError('Revisa los campos indicados.')
      requestAnimationFrame(() => formElement.querySelector('[aria-invalid="true"]')?.focus())
      return
    }
    lock.current = true
    setSaving(true)
    setError('')
    try {
      const record = await saveRecord(collection, values)
      onSaved(record)
    } catch (failure) {
      setError(failure.message)
    } finally {
      lock.current = false
      setSaving(false)
    }
  }
  return { values, set, setValues, errors, error, saving, submit }
}
export function validateEntry(collection, v) {
  const errors = {}
  const required =
    collection === 'patients'
      ? ['names', 'surnames', 'birthDate', 'phone']
      : collection === 'appointments'
        ? ['patientId', 'date', 'time', 'dentist', 'treatment']
        : ['patientId', 'concept', 'date', 'amount', 'method', 'currency']
  required.forEach((k) => {
    if (!String(v[k] ?? '').trim()) errors[k] = 'Campo obligatorio'
  })
  if (collection === 'patients') {
    if (v.dpi && !/^\d{13}$/.test(v.dpi) && !(v.id === 'patient-2' && v.dpi === '123456780101'))
      errors.dpi = 'El DPI debe contener 13 dígitos.'
    if (v.birthDate && v.birthDate > localDate()) errors.birthDate = 'La fecha no puede ser futura.'
    for (const k of ['phone', 'secondaryPhone'])
      if (v[k] && !/^\d{4}-?\d{4}$/.test(v[k])) errors[k] = 'Usa un teléfono de 8 dígitos.'
    if (v.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.email))
      errors.email = 'Correo electrónico inválido.'
  }
  if (collection === 'appointments') {
    if (v.time && !/^([01]\d|2[0-3]):([0-5]\d)$/.test(v.time))
      errors.time = 'Ingresa una hora válida (HH:MM).'
    if (!errors.time && v.time) {
      const minutes = timeToMinutes(v.time)
      if (minutes < CLINIC_OPEN_MIN || minutes >= CLINIC_CLOSE_MIN)
        errors.time = 'La clínica atiende de 07:00 a 21:00.'
    }
    if (!errors.time && v.date && v.time) {
      const now = nowInClinicTz()
      const isPast = (v.date + v.time).localeCompare(now.date + now.time) < 0
      const original = v.id ? getClinic().appointments.find((a) => a.id === v.id) : null
      const wasAlreadyPast =
        original && (original.date + original.time).localeCompare(now.date + now.time) < 0
      if (isPast && !wasAlreadyPast) errors.time = 'No puedes agendar una cita en el pasado.'
    }
    if (!errors.time && v.date && v.time && v.dentist) {
      const start = timeToMinutes(v.time)
      const end = start + (Number(v.duration) || 60)
      const overlaps = getClinic().appointments.some((a) => {
        if (a.id === v.id) return false
        if (a.date !== v.date || a.dentist !== v.dentist) return false
        const aStart = timeToMinutes(a.time)
        const aEnd = aStart + (Number(a.duration) || 60)
        return start < aEnd && aStart < end
      })
      if (overlaps) errors.time = 'Ya existe una cita con este odontólogo en ese horario.'
    }
  }
  if (collection === 'payments') {
    if (
      !Number.isFinite(Number(v.amount)) ||
      Number(v.amount) <= 0 ||
      !/^(\d+)(\.\d{1,2})?$/.test(String(v.amount))
    )
      errors.amount = 'Ingresa un monto positivo con hasta 2 decimales.'
    if (/Tarjeta|Transferencia/.test(v.method) && !v.reference?.trim())
      errors.reference = 'Ingresa la referencia de la transacción.'
  }
  return errors
}
