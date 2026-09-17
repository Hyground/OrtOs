import { useEffect, useId, useState } from 'react'
import styles from './Calendar.module.css'

function to12h(value) {
  if (!/^([01]\d|2[0-3]):([0-5]\d)$/.test(value ?? '')) return { hour: '', minute: '', period: 'AM' }
  const [h, m] = value.split(':').map(Number)
  const period = h >= 12 ? 'PM' : 'AM'
  const hour12 = h % 12 || 12
  return { hour: String(hour12).padStart(2, '0'), minute: String(m).padStart(2, '0'), period }
}

function to24h(hour, minute, period) {
  const h = Number(hour)
  const m = Number(minute)
  if (!Number.isInteger(h) || h < 1 || h > 12) return null
  if (!Number.isInteger(m) || m < 0 || m > 59) return null
  const hour24 = (h % 12) + (period === 'PM' ? 12 : 0)
  return String(hour24).padStart(2, '0') + ':' + String(m).padStart(2, '0')
}

export function TimeField12h({ label, value, onChange, error }) {
  const id = useId()
  const errorId = `${id}-error`
  const [hour, setHour] = useState(() => to12h(value).hour)
  const [minute, setMinute] = useState(() => to12h(value).minute)
  const [period, setPeriod] = useState(() => to12h(value).period)

  useEffect(() => {
    const parsed = to12h(value)
    setHour(parsed.hour)
    setMinute(parsed.minute)
    setPeriod(parsed.period)
  }, [value])

  const emit = (nextHour, nextMinute, nextPeriod) => {
    const next = to24h(nextHour, nextMinute, nextPeriod)
    if (next) onChange(next)
  }

  const handleHour = (e) => {
    const raw = e.target.value.replace(/\D/g, '').slice(0, 2)
    setHour(raw)
    emit(raw, minute, period)
  }
  const handleMinute = (e) => {
    const raw = e.target.value.replace(/\D/g, '').slice(0, 2)
    setMinute(raw)
    emit(hour, raw, period)
  }
  const handlePeriod = (e) => {
    setPeriod(e.target.value)
    emit(hour, minute, e.target.value)
  }

  return (
    <div className={styles.timeField}>
      <label className={styles.timeFieldLabel} htmlFor={id}>
        {label}
      </label>
      <div className={styles.timeFieldRow}>
        <input
          id={id}
          type="text"
          inputMode="numeric"
          autoComplete="off"
          placeholder="HH"
          maxLength={2}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? errorId : undefined}
          className={[styles.timeFieldInput, error && styles.timeFieldInputError]
            .filter(Boolean)
            .join(' ')}
          value={hour}
          onChange={handleHour}
        />
        <span className={styles.timeFieldColon} aria-hidden="true">
          :
        </span>
        <input
          type="text"
          inputMode="numeric"
          autoComplete="off"
          placeholder="MM"
          maxLength={2}
          aria-label="Minutos"
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? errorId : undefined}
          className={[styles.timeFieldInput, error && styles.timeFieldInputError]
            .filter(Boolean)
            .join(' ')}
          value={minute}
          onChange={handleMinute}
        />
        <select
          aria-label="AM o PM"
          className={styles.timeFieldPeriod}
          value={period}
          onChange={handlePeriod}
        >
          <option value="AM">AM</option>
          <option value="PM">PM</option>
        </select>
      </div>
      {error ? (
        <p id={errorId} className={styles.timeFieldError} role="alert">
          {error}
        </p>
      ) : null}
    </div>
  )
}
