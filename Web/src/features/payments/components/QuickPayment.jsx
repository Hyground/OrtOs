import { useState } from 'react'
import { Button } from '@/components/ui/Button/Button'
import { Field } from '@/features/clinical/components'
import { useEntryForm } from '@/features/clinical/useEntryForm'
import { usePatients } from '@/features/patients/hooks/usePatients'
import { treatments } from '@/features/appointments/mockData/appointments'
import { concepts, paymentMethods } from '../mockData/payments'
import { initialPayment } from '../mockData/initialPayment'
import styles from '@/features/clinical/Clinical.module.css'
import css from './Payments.module.css'
export function QuickPayment({ onComplete, onExpand }) {
  const patients = usePatients()
  const [message, setMessage] = useState('')
  const form = useEntryForm('payments', initialPayment(), (record) => {
    setMessage('Pago registrado correctamente.')
    form.setValues(initialPayment())
    onComplete(record)
  })
  const f = (name, label, options) => (
    <Field
      form={form}
      name={name}
      label={label}
      options={options}
      {...(name === 'amount' ? { type: 'number', min: '0.01', step: '0.01', prefix: 'Q' } : {})}
    />
  )
  return (
    <section className={css.quick}>
      <h2>REGISTRO RÁPIDO DE PAGO</h2>
      <form
        onSubmit={(e) => {
          if (/Tarjeta|Transferencia/.test(form.values.method)) {
            e.preventDefault()
            onExpand(form.values)
          } else form.submit(e)
        }}
        noValidate
      >
        <fieldset
          disabled={form.saving}
          style={{ border: 0, padding: 0, margin: 0, minWidth: 0 }}
          className={css.quickForm}
        >
          {f(
            'patientId',
            'Paciente *',
            patients.map((p) => ({ value: p.id, label: p.name })),
          )}
          {f('concept', 'Concepto *', concepts)}
          {f('treatment', 'Tratamiento / Cita', treatments)}
          {f('amount', 'Monto * (Q)')}
          {f('method', 'Método de pago *', paymentMethods)}
          <Button type="submit" disabled={form.saving}>
            {form.saving ? 'Guardando…' : 'Guardar pago'}
          </Button>
        </fieldset>
        {form.error && (
          <p role="alert" className={styles.error}>
            {form.error}
          </p>
        )}
        {message && (
          <p role="status" className={styles.success}>
            {message}
          </p>
        )}
      </form>
    </section>
  )
}
