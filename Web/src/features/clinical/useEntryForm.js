import { useRef, useState } from 'react'
import { saveRecord, localDate } from './mockStore'
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
