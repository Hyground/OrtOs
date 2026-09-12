import { useState } from 'react'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { IconCalendar, IconChevronLeft, IconChevronRight } from '@/components/icons/icons'
import { Button } from '@/components/ui/Button/Button'
import { SelectField } from '@/components/ui/SelectField/SelectField'
import { localDate, displayDate } from '@/features/clinical/mockStore'
import { useAppointments } from '@/features/appointments/hooks/useAppointments'
import { usePatients } from '@/features/patients/hooks/usePatients'
import { dentists } from '@/features/appointments/mockData/appointments'
import styles from './CalendarPage.module.css'

const dateKey = (d) =>
  d.getFullYear() +
  '-' +
  String(d.getMonth() + 1).padStart(2, '0') +
  '-' +
  String(d.getDate()).padStart(2, '0')

function loadClass(count) {
  if (!count) return styles.loadNone
  if (count <= 2) return styles.loadLow
  if (count <= 4) return styles.loadMedium
  return styles.loadHigh
}

export function CalendarPage() {
  useDocumentTitle('Calendario')
  const appointments = useAppointments()
  const patients = usePatients()
  const today = localDate()
  const [cursor, setCursor] = useState(today)
  const [view, setView] = useState('Mes')
  const [dentist, setDentist] = useState('')
  const date = new Date(cursor + 'T12:00:00')
  const month = cursor.slice(0, 7)
  const monthLabel = date
    .toLocaleDateString('es-GT', { month: 'long', year: 'numeric' })
    .toUpperCase()
  const patient = (id) => patients.find((p) => p.id === id)
  const visible = appointments.filter((a) => !dentist || a.dentist === dentist)
  const first = new Date(date.getFullYear(), date.getMonth(), 1, 12)
  const start = new Date(first)
  start.setDate(1 - first.getDay())
  if (view === 'Semana') {
    start.setTime(date.getTime())
    start.setDate(date.getDate() - date.getDay())
  }
  const days = Array.from({ length: view === 'Mes' ? 42 : 7 }, (_, i) => {
    const d = new Date(start)
    d.setDate(start.getDate() + i)
    return dateKey(d)
  })
  const byDay = (day) =>
    visible.filter((a) => a.date === day).sort((a, b) => a.time.localeCompare(b.time))
  const monthTotal = visible.filter((a) => a.date.startsWith(month)).length
  const todayTotal = byDay(today).length
  const selectedDay = byDay(cursor)
  const patientsThisMonth = new Set(
    visible.filter((a) => a.date.startsWith(month)).map((a) => a.patientId),
  ).size
  const move = (step) => {
    const d = new Date(date)
    if (view === 'Mes') {
      d.setDate(1)
      d.setMonth(d.getMonth() + step)
    } else d.setDate(d.getDate() + step * (view === 'Semana' ? 7 : 1))
    setCursor(dateKey(d))
  }

  return (
    <section className={styles.page}>
      <header className={styles.hero}>
        <span className={styles.heroIcon}>
          <IconCalendar />
        </span>
        <div className={styles.heroCopy}>
          <h1>Calendario de la clínica</h1>
          <p>
            Vista ejecutiva de la agenda: consulta de un vistazo cómo está la semana o el mes, sin
            entrar a editar citas.
          </p>
        </div>
        <div className={styles.heroStats}>
          <div className={styles.statTile}>
            <strong>{monthTotal}</strong>
            <small>Citas del mes</small>
          </div>
          <div className={styles.statTile}>
            <strong>{todayTotal}</strong>
            <small>Citas hoy</small>
          </div>
          <div className={styles.statTile}>
            <strong>{patientsThisMonth}</strong>
            <small>Pacientes este mes</small>
          </div>
        </div>
      </header>

      <div className={styles.layout}>
        <div className={styles.panel}>
          <div className={styles.nav}>
            <Button size="sm" variant="ghost" aria-label="Período anterior" onClick={() => move(-1)}>
              <IconChevronLeft />
            </Button>
            <Button size="sm" variant="ghost" aria-label="Período siguiente" onClick={() => move(1)}>
              <IconChevronRight />
            </Button>
            <Button size="sm" variant="ghost" onClick={() => setCursor(today)}>
              Hoy
            </Button>
            <span className={styles.navLabel}>{view === 'Mes' ? monthLabel : displayDate(cursor)}</span>
            <div className={styles.pillGroup}>
              {['Mes', 'Semana'].map((v) => (
                <button
                  key={v}
                  type="button"
                  className={view === v ? styles.pillActive : ''}
                  aria-pressed={view === v}
                  onClick={() => setView(v)}
                >
                  {v}
                </button>
              ))}
            </div>
            <div className={styles.filterField}>
              <SelectField
                label="Odontólogo"
                placeholder="Toda la clínica"
                options={dentists}
                value={dentist}
                onChange={(e) => setDentist(e.target.value)}
              />
            </div>
          </div>
          <div className={styles.gridWrap}>
            <div className={styles.grid}>
              {['DOM', 'LUN', 'MAR', 'MIÉ', 'JUE', 'VIE', 'SÁB'].map((d) => (
                <div key={d} className={styles.weekday}>
                  {d}
                </div>
              ))}
              {days.map((day) => {
                const dayAppointments = byDay(day)
                const classes = [styles.cell]
                if (!day.startsWith(month) && view === 'Mes') classes.push(styles.outside)
                if (day === today) classes.push(styles.today)
                if (day === cursor) classes.push(styles.selected)
                return (
                  <button
                    key={day}
                    type="button"
                    className={classes.join(' ')}
                    onClick={() => setCursor(day)}
                    aria-pressed={day === cursor}
                    aria-label={'Ver agenda del ' + displayDate(day)}
                  >
                    <span className={styles.cellHead}>
                      <span className={styles.dayNumber}>{Number(day.slice(-2))}</span>
                      <span className={styles.load + ' ' + loadClass(dayAppointments.length)}>
                        {dayAppointments.length || ''}
                      </span>
                    </span>
                    <span className={styles.preview}>
                      {dayAppointments.slice(0, 2).map((a) => (
                        <span key={a.id}>
                          <time>{a.time}</time> {patient(a.patientId)?.names}
                        </span>
                      ))}
                      {dayAppointments.length > 2 && (
                        <span className={styles.more}>+{dayAppointments.length - 2} más</span>
                      )}
                    </span>
                  </button>
                )
              })}
            </div>
          </div>
        </div>
        <aside className={styles.agenda}>
          <h2 className={styles.agendaTitle}>
            Agenda del día
            <small>{displayDate(cursor)}</small>
          </h2>
          {selectedDay.length ? (
            selectedDay.map((a) => (
              <article key={a.id} className={styles.agendaCard}>
                <span className={styles.agendaTime}>
                  {a.time} · {a.duration} min
                </span>
                <span className={styles.agendaPatient}>{patient(a.patientId)?.name}</span>
                <span className={styles.agendaMeta}>
                  <span>{a.treatment}</span>
                  <span>{a.dentist}</span>
                  <span>{a.chair}</span>
                </span>
              </article>
            ))
          ) : (
            <p className={styles.agendaEmpty}>Sin citas para este día.</p>
          )}
        </aside>
      </div>
    </section>
  )
}
