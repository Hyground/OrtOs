import { useEffect, useId, useLayoutEffect, useRef, useState } from 'react'
import { IconCalendar, IconChevronLeft, IconChevronRight } from '@/components/icons/icons'
import { localDate } from '@/features/clinical/mockStore'
import fieldStyles from '@/components/ui/TextField/TextField.module.css'
import css from './AppointmentHistoryPage.module.css'

const display = (value) => (value ? value.split('-').reverse().join('/') : '')
const formatDateInput = (value) => {
  const digits = value.replace(/\D/g, '').slice(0, 8)
  return [digits.slice(0, 2), digits.slice(2, 4), digits.slice(4, 8)].filter(Boolean).join('/')
}
const parse = (value) => {
  const match = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(value)
  if (!match) return ''
  const [, day, month, year] = match
  const date = new Date(Number(year), Number(month) - 1, Number(day))
  return date.getFullYear() === Number(year) &&
    date.getMonth() === Number(month) - 1 &&
    date.getDate() === Number(day)
    ? `${year}-${month}-${day}`
    : ''
}
const monthStart = (value) => new Date(`${value || localDate()}T12:00:00`).setDate(1)

export function HistoryDateField({ label, value, min, max, onChange }) {
  const id = useId()
  const inputRef = useRef(null)
  const caretRef = useRef(null)
  const [draft, setDraft] = useState(null)
  const [open, setOpen] = useState(false)
  const [month, setMonth] = useState(() => monthStart(value))
  useEffect(() => setDraft(null), [value])
  const text = draft ?? display(value)
  useLayoutEffect(() => {
    if (caretRef.current === null) return
    inputRef.current.setSelectionRange(caretRef.current, caretRef.current)
    caretRef.current = null
  }, [text])
  const invalid = draft !== null && draft !== '' && !parse(draft)
  const openCalendar = () => {
    setMonth(monthStart(value))
    setOpen(true)
    inputRef.current.focus()
    inputRef.current.select()
  }
  const choose = (date) => {
    onChange({ target: { value: date } })
    setDraft(null)
    setOpen(false)
    inputRef.current.focus()
    inputRef.current.select()
  }
  const currentMonth = new Date(month)
  const year = currentMonth.getFullYear()
  const monthIndex = currentMonth.getMonth()
  const firstDay = new Date(year, monthIndex, 1).getDay()
  const days = new Date(year, monthIndex + 1, 0).getDate()
  return (
    <div
      className={`${fieldStyles.field} ${css.dateField}`}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) {
          setOpen(false)
          setDraft(null)
        }
      }}
    >
      <label htmlFor={id} className={fieldStyles.label}>
        {label}
      </label>
      <div className={css.dateControl}>
        <button
          type="button"
          className={css.dateLeadingIcon}
          aria-label={`Abrir calendario de ${label}`}
          onClick={openCalendar}
        >
          <IconCalendar />
        </button>
        <input
          ref={inputRef}
          id={id}
          type="text"
          inputMode="numeric"
          autoComplete="off"
          placeholder="dd/mm/aaaa"
          maxLength={10}
          className={css.dateInput}
          value={text}
          aria-invalid={invalid || undefined}
          aria-expanded={open}
          aria-controls={open ? `${id}-calendar` : undefined}
          onChange={(event) => {
            const input = event.target
            const next = formatDateInput(input.value)
            const digitsBeforeCaret = input.value
              .slice(0, input.selectionStart)
              .replace(/\D/g, '').length
            caretRef.current = Math.min(
              next.length,
              digitsBeforeCaret + (digitsBeforeCaret > 2 ? 1 : 0) + (digitsBeforeCaret > 4 ? 1 : 0),
            )
            setDraft(next)
            const parsed = parse(next)
            if (!next || parsed) {
              onChange({ target: { value: parsed } })
              if (parsed) setMonth(monthStart(parsed))
            }
          }}
          onKeyDown={(event) => {
            if (event.key === 'Enter') {
              event.preventDefault()
              const parsed = parse(text)
              if (!text || (parsed && (!min || parsed >= min) && (!max || parsed <= max))) {
                choose(parsed)
              }
            }
            if (event.key === 'Escape') {
              event.stopPropagation()
              setOpen(false)
            }
            if (event.key === 'ArrowDown') {
              event.preventDefault()
              openCalendar()
            }
          }}
        />
        <button
          type="button"
          className={css.dateCalendarArea}
          aria-label={`Seleccionar fecha de ${label}`}
          onClick={openCalendar}
        >
          <IconCalendar />
        </button>
      </div>
      {open && (
        <div
          id={`${id}-calendar`}
          role="group"
          aria-label={`Calendario de ${label}`}
          className={css.calendar}
        >
          <div className={css.calendarHeader}>
            <button
              type="button"
              aria-label={`Mes anterior de ${label}`}
              onClick={() => setMonth(new Date(year, monthIndex - 1, 1).getTime())}
            >
              <IconChevronLeft />
            </button>
            <strong>
              {currentMonth.toLocaleDateString('es-GT', { month: 'long', year: 'numeric' })}
            </strong>
            <button
              type="button"
              aria-label={`Mes siguiente de ${label}`}
              onClick={() => setMonth(new Date(year, monthIndex + 1, 1).getTime())}
            >
              <IconChevronRight />
            </button>
          </div>
          <div className={css.calendarDays}>
            {['Do', 'Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sá'].map((day) => (
              <span key={day}>{day}</span>
            ))}
            {Array.from({ length: firstDay }, (_, i) => (
              <span key={`blank-${i}`} />
            ))}
            {Array.from({ length: days }, (_, i) => {
              const date = `${year}-${String(monthIndex + 1).padStart(2, '0')}-${String(i + 1).padStart(2, '0')}`
              return (
                <button
                  type="button"
                  key={date}
                  aria-label={display(date)}
                  aria-pressed={value === date}
                  disabled={(min && date < min) || (max && date > max)}
                  onClick={() => choose(date)}
                >
                  {i + 1}
                </button>
              )
            })}
          </div>
          <div className={css.calendarFooter}>
            <button type="button" onClick={() => choose('')}>
              Borrar fecha
            </button>
            <button
              type="button"
              disabled={(min && localDate() < min) || (max && localDate() > max)}
              onClick={() => choose(localDate())}
            >
              Hoy
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
