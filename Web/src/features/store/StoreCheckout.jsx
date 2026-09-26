import { useMemo, useState } from 'react'
import { Button } from '@/components/ui/Button/Button'
import { SelectField } from '@/components/ui/SelectField/SelectField'
import { TextField } from '@/components/ui/TextField/TextField'
import {
  addCharge,
  createPaymentPlan,
  moneyRounded,
  registerAccountPayment,
  saveRecord,
} from '@/features/clinical/mockStore'
import styles from './StoreCheckout.module.css'

const dentists = ['Dra. Ana Morales', 'Dr. Carlos Pérez', 'Dra. Sofía Ramírez']
const chairs = ['Sillón 1', 'Sillón 2', 'Sillón 3']
const iso = (date) => {
  const copy = new Date(date)
  copy.setMinutes(copy.getMinutes() - copy.getTimezoneOffset())
  return copy.toISOString().slice(0, 10)
}
const addDays = (value, days) => {
  const date = new Date(`${value}T12:00:00`)
  date.setDate(date.getDate() + days)
  return iso(date)
}
const defaultCount = (name) =>
  /fase|ortodoncia/i.test(name) ? 6 : /endodoncia/i.test(name) ? 2 : 1

function initialSchedule(cart) {
  const start = addDays(iso(new Date()), 1)
  return cart.map((item) => ({
    ...item,
    sessions: Array.from({ length: defaultCount(item.name) }, (_, index) => ({
      number: index + 1,
      date: addDays(start, index * 30),
      time: '10:00',
      dentist: dentists[0],
      chair: chairs[0],
    })),
  }))
}

export function StoreCheckout({ patient, cart, total, onBack, onComplete }) {
  const [items, setItems] = useState(() => initialSchedule(cart))
  const [selected, setSelected] = useState(0)
  const [paymentMode, setPaymentMode] = useState('regular')
  const [amount, setAmount] = useState('')
  const [installments, setInstallments] = useState(() =>
    String(cart.reduce((sum, item) => sum + defaultCount(item.name), 0)),
  )
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const current = items[selected]
  const paymentAmount = Number(amount || 0)
  const balance = Math.max(0, total - paymentAmount)
  const paymentType =
    paymentMode === 'plan'
      ? 'installments'
      : paymentAmount <= 0
        ? 'none'
        : paymentAmount >= total
          ? 'full'
          : 'partial'
  const scheduledCount = useMemo(
    () => items.reduce((sum, item) => sum + item.sessions.length, 0),
    [items],
  )
  const installmentAmount =
    paymentMode === 'plan' ? balance / Math.max(1, Number(installments || 1)) : 0

  const updateSession = (index, key, value) =>
    setItems((all) =>
      all.map((item, itemIndex) =>
        itemIndex !== selected
          ? item
          : {
              ...item,
              sessions: item.sessions.map((session, sessionIndex) =>
                sessionIndex === index ? { ...session, [key]: value } : session,
              ),
            },
      ),
    )
  const changeCount = (value) => {
    const count = Math.max(1, Math.min(24, Number(value || 1)))
    setItems((all) =>
      all.map((item, index) =>
        index !== selected
          ? item
          : {
              ...item,
              sessions: Array.from(
                { length: count },
                (_, position) =>
                  item.sessions[position] || {
                    number: position + 1,
                    date: addDays(
                      item.sessions[0]?.date || addDays(iso(new Date()), 1),
                      position * 30,
                    ),
                    time: '10:00',
                    dentist: dentists[0],
                    chair: chairs[0],
                  },
              ),
            },
      ),
    )
  }
  const confirm = async () => {
    setError('')
    setSaving(true)
    try {
      const chargeIds = []
      for (const item of items) {
        const charge = await addCharge({
          patientId: patient.id,
          treatmentId: item.id,
          description: item.name,
          quantity: 1,
          unitPrice: item.price,
        })
        chargeIds.push(charge.id)
        for (const session of item.sessions)
          await saveRecord('appointments', {
            patientId: patient.id,
            treatmentPlanId: charge.id,
            sessionNumber: session.number,
            date: session.date,
            time: session.time,
            duration: String(item.durationMin),
            dentist: session.dentist,
            chair: session.chair,
            treatment: item.name,
            type: 'Tratamiento programado',
            priority: 'Media',
            reminder: '24',
            reason: item.name,
            notes: '',
            status: 'Pendiente',
          })
      }
      if (paymentAmount > 0)
        await registerAccountPayment({
          patientId: patient.id,
          amount: paymentAmount,
          method: 'Efectivo',
          notes: 'Pago registrado desde Store',
          chargeIds,
        })
      if (paymentMode === 'plan' && balance > 0)
        await createPaymentPlan({
          patientId: patient.id,
          totalAmount: total,
          downPayment: paymentAmount,
          financedAmount: balance,
          installmentCount: Number(installments),
          dueDates: items.flatMap((item) => item.sessions.map((session) => session.date)).sort(),
          name: 'Plan de tratamiento',
        })
      onComplete({ scheduledCount, paymentType })
    } catch (cause) {
      setError(cause.message || 'No se pudo registrar la venta.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <section className={styles.checkout}>
      <header className={styles.top}>
        <div className={styles.topLead}>
          <button type="button" onClick={onBack}>
            ← Volver
          </button>
          <span>
            {patient.name} · {moneyRounded(total)}
          </span>
        </div>
        <div className={styles.treatmentPicker}>
          <SelectField
            label=""
            aria-label="Tratamiento a configurar"
            options={items.map((item, index) => ({
              value: String(index),
              label: `${item.name} · ${item.sessions.length} sesiones`,
            }))}
            value={String(selected)}
            onChange={(event) => setSelected(Number(event.target.value))}
          />
        </div>
        <div className={styles.appointmentCount}>
          <strong>{scheduledCount}</strong>
          <small>citas</small>
        </div>
      </header>
      <div className={styles.layout}>
        <main className={styles.schedule}>
          <header className={styles.scheduleToolbar}>
            <strong>Programación de citas</strong>
            <label className={styles.sessionCount}>
              <span>Sesiones</span>
              <input
                aria-label="Número de sesiones"
                type="number"
                min="1"
                max="24"
                value={current.sessions.length}
                onChange={(event) => changeCount(event.target.value)}
              />
            </label>
          </header>
          <div className={styles.sessionColumns}>
            <span>Sesión</span>
            <span>Fecha</span>
            <span>Hora</span>
            <span>Odontólogo</span>
            <span>Sillón</span>
          </div>
          <div className={styles.sessions}>
            {current.sessions.map((session, index) => (
              <article key={session.number}>
                <b>Sesión {session.number}</b>
                <TextField
                  label=""
                  aria-label="Fecha de sesión"
                  type="date"
                  value={session.date}
                  onChange={(event) => updateSession(index, 'date', event.target.value)}
                />
                <TextField
                  label=""
                  aria-label="Hora de sesión"
                  type="time"
                  value={session.time}
                  onChange={(event) => updateSession(index, 'time', event.target.value)}
                />
                <SelectField
                  label=""
                  aria-label="Odontólogo de sesión"
                  options={dentists}
                  value={session.dentist}
                  onChange={(event) => updateSession(index, 'dentist', event.target.value)}
                />
                <SelectField
                  label=""
                  aria-label="Sillón de sesión"
                  options={chairs}
                  value={session.chair}
                  onChange={(event) => updateSession(index, 'chair', event.target.value)}
                />
              </article>
            ))}
          </div>
        </main>
        <aside className={styles.payment}>
          <header>
            <h2>Cobro</h2>
            <strong>{moneyRounded(total)}</strong>
          </header>
          <SelectField
            label="Modalidad"
            options={[
              { value: 'regular', label: 'Pago normal' },
              { value: 'plan', label: 'Plan de pagos' },
            ]}
            value={paymentMode}
            onChange={(event) => setPaymentMode(event.target.value)}
          />
          <TextField
            label={paymentMode === 'plan' ? 'Anticipo' : 'Paga ahora'}
            type="number"
            min="0"
            max={total}
            value={amount}
            onChange={(event) => setAmount(event.target.value)}
          />
          {paymentMode === 'plan' && (
            <div className={styles.planFields}>
              <TextField
                label="Número de cuotas"
                type="number"
                min="1"
                max="24"
                value={installments}
                onChange={(event) => setInstallments(event.target.value)}
              />
              <div className={styles.installmentValue}>
                <span>Pago por cita</span>
                <strong>{moneyRounded(installmentAmount)}</strong>
              </div>
            </div>
          )}
          <div className={styles.balance}>
            <span>{paymentMode === 'plan' ? 'A financiar' : 'Saldo pendiente'}</span>
            <strong>{moneyRounded(balance)}</strong>
          </div>
          {error && <p className={styles.error}>{error}</p>}
          <Button
            type="button"
            disabled={
              saving ||
              paymentAmount < 0 ||
              paymentAmount > total ||
              (paymentMode === 'plan' && (Number(installments) < 1 || balance <= 0))
            }
            onClick={confirm}
          >
            {saving ? 'Guardando...' : 'Confirmar venta'}
          </Button>
        </aside>
      </div>
    </section>
  )
}
