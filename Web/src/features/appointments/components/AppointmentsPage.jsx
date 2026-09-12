import { useState } from 'react'
import { IconCalendar, IconChevronLeft, IconChevronRight } from '@/components/icons/icons'
import { Button } from '@/components/ui/Button/Button'
import { SelectField } from '@/components/ui/SelectField/SelectField'
import { Badge } from '@/components/ui/Badge/Badge'
import { Banner, Avatar } from '@/features/clinical/components'
import { useModuleDialogs } from '@/features/clinical/useModuleDialogs'
import { localDate, displayDate } from '@/features/clinical/mockStore'
import { usePatients } from '@/features/patients/hooks/usePatients'
import { PatientForm } from '@/features/patients/components/PatientForm'
import { RecordModal } from '@/features/records/components/RecordModal'
import { AppointmentForm } from './AppointmentForm'
import { useAppointments } from '../hooks/useAppointments'
import { dentists } from '../mockData/appointments'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import styles from '@/features/clinical/Clinical.module.css'
import calendar from './Calendar.module.css'
const dateKey = (d) =>
  d.getFullYear() +
  '-' +
  String(d.getMonth() + 1).padStart(2, '0') +
  '-' +
  String(d.getDate()).padStart(2, '0')
const DAY_START_HOUR = 7
const DAY_END_HOUR = 21
const HOUR_HEIGHT = 64
const timeToMinutes = (t) => {
  const [h, m] = t.split(':').map(Number)
  return h * 60 + m
}
const minutesToTime = (mins) =>
  String(Math.floor(mins / 60)).padStart(2, '0') + ':' + String(mins % 60).padStart(2, '0')
function layoutDay(items) {
  const sorted = [...items].sort((a, b) => a.start - b.start || a.end - b.end)
  let cluster = []
  let active = []
  const result = []
  const flush = () => {
    const total = cluster.reduce((m, it) => Math.max(m, it.col + 1), 1)
    cluster.forEach((it) => result.push({ ...it, totalCols: total }))
    cluster = []
  }
  for (const item of sorted) {
    active = active.filter((end) => end > item.start)
    if (!active.length && cluster.length) flush()
    let col = 0
    while (cluster.some((it) => it.col === col && it.end > item.start)) col++
    cluster.push({ ...item, col })
    active.push(item.end)
  }
  flush()
  return result
}
const dentistColors = [
  'var(--color-primary)',
  'var(--color-teal)',
  'var(--color-action)',
  'var(--color-users)',
]
const dentistColor = (name) => dentistColors[Math.max(dentists.indexOf(name), 0) % dentistColors.length]
const dentistInitial = (name) =>
  (name ?? '')
    .replace(/^(Dr\.|Dra\.)\s*/, '')
    .trim()
    .charAt(0)
    .toUpperCase() || '?'
export function AppointmentsPage() {
  useDocumentTitle('Citas')
  const appointments = useAppointments()
  const patients = usePatients()
  const dialog = useModuleDialogs()
  const [cursor, setCursor] = useState('2026-08-31')
  const [view, setView] = useState('Mes')
  const [filters, setFilters] = useState(false)
  const [dentist, setDentist] = useState('')
  const [priority, setPriority] = useState('')
  const [all, setAll] = useState(false)
  const date = new Date(cursor + 'T12:00:00')
  const month = cursor.slice(0, 7)
  const monthLabel = date
    .toLocaleDateString('es-GT', { month: 'long', year: 'numeric' })
    .toUpperCase()
  const monthly = appointments.filter((a) => a.date.startsWith(month))
  const daily = appointments
    .filter((a) => a.date === cursor)
    .sort((a, b) => a.time.localeCompare(b.time))
  const filtered = appointments.filter(
    (a) => (!dentist || a.dentist === dentist) && (!priority || a.priority === priority),
  )
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
  const upcoming = filtered
    .filter((a) => a.date >= cursor && a.status === 'Pendiente')
    .sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time))
  const dayItems = layoutDay(
    filtered
      .filter((a) => a.date === cursor)
      .map((a) => ({ ...a, start: timeToMinutes(a.time), durationMin: Number(a.duration) || 60 }))
      .map((a) => ({ ...a, end: a.start + a.durationMin })),
  )
  const trackHeight = (DAY_END_HOUR - DAY_START_HOUR) * HOUR_HEIGHT
  const dayHours = Array.from(
    { length: DAY_END_HOUR - DAY_START_HOUR + 1 },
    (_, i) => DAY_START_HOUR + i,
  )
  const move = (step) => {
    const d = new Date(date)
    if (view === 'Mes') {
      d.setDate(1)
      d.setMonth(d.getMonth() + step)
    } else d.setDate(d.getDate() + step * (view === 'Semana' ? 7 : 1))
    setCursor(dateKey(d))
  }
  const patient = (id) => patients.find((p) => p.id === id)
  const chip = (a) => (
    <button
      className={calendar.chip + ' ' + calendar[a.priority]}
      key={a.id}
      onClick={() => dialog.setEditing(a)}
      title={a.time + ' · ' + patient(a.patientId)?.name + ' · ' + a.treatment + ' · ' + a.dentist}
    >
      <i className={calendar.chipDot} style={{ background: dentistColor(a.dentist) }}>
        {dentistInitial(a.dentist)}
      </i>
      <span className={calendar.chipBody}>
        <strong>{a.time}</strong> {patient(a.patientId)?.names}
      </span>
    </button>
  )
  return (
    <div className={styles.page}>
      <Banner
        title="MÓDULO DE CITAS"
        description="Organiza la agenda de la clínica, coordina tratamientos y da seguimiento a cada paciente."
        Icon={IconCalendar}
        metrics={[
          [monthly.length, 'Citas este mes'],
          [daily.length, 'Citas el ' + displayDate(cursor)],
        ]}
        onNew={dialog.create}
        newLabel="NUEVA CITA"
      />
      {dialog.notice && (
        <p role="status" className={styles.success}>
          {dialog.notice}
        </p>
      )}
      <div className={styles.split}>
        <div className={styles.stack}>
          <section className={styles.card}>
            <div className={calendar.toolbar}>
              <Button
                size="sm"
                variant="ghost"
                aria-label="Período anterior"
                onClick={() => move(-1)}
              >
                <IconChevronLeft />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                aria-label="Período siguiente"
                onClick={() => move(1)}
              >
                <IconChevronRight />
              </Button>
              <Button size="sm" variant="ghost" onClick={() => setCursor(localDate())}>
                Hoy
              </Button>
              <input
                type="month"
                aria-label="Mes del calendario"
                value={month}
                onChange={(e) => {
                  if (e.target.value) setCursor(e.target.value + '-01')
                }}
              />
              <strong>{view !== 'Mes' ? displayDate(cursor) : ''}</strong>
              {['Mes', 'Semana', 'Día'].map((v) => (
                <Button
                  key={v}
                  size="sm"
                  variant={view === v ? 'primary' : 'ghost'}
                  aria-pressed={view === v}
                  onClick={() => setView(v)}
                >
                  {v}
                </Button>
              ))}
              <Button
                size="sm"
                variant="ghost"
                aria-expanded={filters}
                onClick={() => setFilters((v) => !v)}
              >
                Filtros
              </Button>
            </div>
            {filters && (
              <div className={styles.filters}>
                <SelectField
                  label="Odontólogo"
                  placeholder="Todos los odontólogos"
                  options={dentists}
                  value={dentist}
                  onChange={(e) => setDentist(e.target.value)}
                />
                <SelectField
                  label="Prioridad"
                  placeholder="Todas las prioridades"
                  options={['Alta', 'Media', 'Baja']}
                  value={priority}
                  onChange={(e) => setPriority(e.target.value)}
                />
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    setDentist('')
                    setPriority('')
                  }}
                >
                  Limpiar
                </Button>
              </div>
            )}
            {view === 'Día' ? (
              <div className={calendar.dayView}>
                <div className={calendar.dayViewHeader}>
                  <strong>Agenda del {displayDate(cursor)}</strong>
                  <Button size="sm" onClick={dialog.create}>
                    + Agendar cita
                  </Button>
                </div>
                {dayItems.length ? (
                  <div className={calendar.timeline}>
                    <div className={calendar.timelineHours} style={{ height: trackHeight }}>
                      {dayHours.map((h) => (
                        <span key={h} style={{ top: (h - DAY_START_HOUR) * HOUR_HEIGHT }}>
                          {String(h).padStart(2, '0')}:00
                        </span>
                      ))}
                    </div>
                    <div className={calendar.timelineTrack} style={{ height: trackHeight }}>
                      {dayHours.map((h) => (
                        <i
                          key={h}
                          className={calendar.timelineLine}
                          style={{ top: (h - DAY_START_HOUR) * HOUR_HEIGHT }}
                        />
                      ))}
                      {dayItems.map((a) => (
                        <button
                          key={a.id}
                          className={calendar.timelineCard + ' ' + calendar[a.priority]}
                          style={{
                            top: (a.start - DAY_START_HOUR * 60) * (HOUR_HEIGHT / 60),
                            height: Math.max(a.durationMin * (HOUR_HEIGHT / 60) - 4, 44),
                            left: (a.col / a.totalCols) * 100 + '%',
                            width: 100 / a.totalCols + '%',
                          }}
                          onClick={() => dialog.setEditing(a)}
                        >
                          <span className={calendar.cardTime}>
                            {a.time} – {minutesToTime(a.end)}
                          </span>
                          <strong>{patient(a.patientId)?.names}</strong>
                          <span>{a.treatment}</span>
                          <small>
                            <i
                              className={calendar.chipDot}
                              style={{ background: dentistColor(a.dentist) }}
                            >
                              {dentistInitial(a.dentist)}
                            </i>
                            {a.dentist} · {a.chair}
                          </small>
                        </button>
                      ))}
                    </div>
                  </div>
                ) : (
                  <p className={styles.empty}>Sin citas para este día.</p>
                )}
              </div>
            ) : (
              <div className={styles.tableScroll}>
                <div className={calendar.calendar}>
                  {['DOM', 'LUN', 'MAR', 'MIÉ', 'JUE', 'VIE', 'SÁB'].map((d) => (
                    <div key={d} className={calendar.weekday}>
                      {d}
                    </div>
                  ))}
                  {days.map((day) => (
                    <div
                      key={day}
                      className={
                        calendar.day + ' ' + (!day.startsWith(month) ? calendar.outside : '')
                      }
                    >
                      <button
                        className={
                          calendar.dayNumber + ' ' + (day === cursor ? calendar.selected : '')
                        }
                        aria-label={'Ver agenda del ' + displayDate(day)}
                        onClick={() => {
                          setCursor(day)
                          setView('Día')
                        }}
                      >
                        {Number(day.slice(-2))}
                      </button>
                      {filtered
                        .filter((a) => a.date === day)
                        .slice(0, 3)
                        .map(chip)}
                      {filtered.filter((a) => a.date === day).length > 3 && (
                        <button
                          className={calendar.chip}
                          onClick={() => {
                            setCursor(day)
                            setView('Día')
                          }}
                        >
                          + {filtered.filter((a) => a.date === day).length - 3} más
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
            <div className={calendar.legend}>
              <span className={calendar.legendGroup}>
                {[
                  ['#ef4444', 'Alta prioridad'],
                  ['#eab308', 'Media prioridad'],
                  ['#22c55e', 'Baja prioridad'],
                ].map(([color, label]) => (
                  <span key={label}>
                    <i className={calendar.dot} style={{ background: color }} />
                    {label}
                  </span>
                ))}
              </span>
              <span className={calendar.legendGroup}>
                {dentists.map((name) => (
                  <span key={name}>
                    <i className={calendar.chipDot} style={{ background: dentistColor(name) }}>
                      {dentistInitial(name)}
                    </i>
                    {name}
                  </span>
                ))}
              </span>
            </div>
          </section>
          <section className={styles.card}>
            <h2 className={styles.cardTitle}>RESUMEN DEL MES - {monthLabel}</h2>
            <div className={calendar.summary}>
              {[
                [monthly.length, 'Total citas'],
                [monthly.filter((a) => a.status === 'Completada').length, 'Completadas'],
                [monthly.filter((a) => a.status === 'Pendiente').length, 'Pendientes'],
                [monthly.filter((a) => a.status === 'Cancelada').length, 'Canceladas'],
                [new Set(monthly.map((a) => a.patientId)).size, 'Pacientes'],
                [new Set(monthly.map((a) => a.treatment)).size, 'Procedimientos'],
              ].map(([value, label]) => (
                <div key={label}>
                  <strong>{value}</strong>
                  <small>{label}</small>
                </div>
              ))}
            </div>
          </section>
        </div>
        <aside className={styles.stack}>
          <section className={styles.card}>
            <h2 className={styles.cardTitle}>{all ? 'PRÓXIMAS CITAS' : 'PRÓXIMAS 5 CITAS'}</h2>
            {upcoming.slice(0, all ? upcoming.length : 5).map((a) => (
              <div key={a.id} className={calendar.upcoming}>
                <Avatar patient={patient(a.patientId)} />
                <div>
                  <button onClick={() => dialog.setEditing(a)}>
                    {a.time} · {displayDate(a.date)}
                  </button>
                  <strong>{patient(a.patientId)?.name}</strong>
                  <small>{a.treatment}</small>
                  <Badge
                    tone={
                      a.priority === 'Alta' ? 'red' : a.priority === 'Media' ? 'amber' : 'green'
                    }
                  >
                    Prioridad {a.priority}
                  </Badge>
                </div>
              </div>
            ))}
            {!upcoming.length && <p className={styles.empty}>No hay próximas citas.</p>}
            <Button variant="ghost" size="sm" onClick={() => setAll((v) => !v)}>
              {all ? 'Mostrar solo cinco' : 'Ver todas las citas →'}
            </Button>
          </section>
          <section className={styles.card}>
            <h2 className={styles.cardTitle}>
              RESUMEN DEL DÍA -{' '}
              {date
                .toLocaleDateString('es-GT', { weekday: 'long', day: 'numeric', month: 'long' })
                .toUpperCase()}
            </h2>
            <div className={styles.cardBody}>
              {[
                [daily.length, 'Citas'],
                [daily[0]?.time ?? '—', 'Primera cita'],
                [daily.at(-1)?.time ?? '—', 'Última cita'],
                [new Set(daily.map((a) => a.patientId)).size, 'Pacientes'],
                [daily.filter((a) => a.status === 'Completada').length, 'Completadas'],
              ].map(([value, label]) => (
                <div className={styles.metricRow} key={label}>
                  <span>{label}</span>
                  <strong>{value}</strong>
                </div>
              ))}
            </div>
          </section>
        </aside>
      </div>
      {dialog.open && (
        <AppointmentForm
          appointment={dialog.editing}
          date={cursor}
          onClose={dialog.close}
          onSaved={(appointment) => {
            dialog.onSaved()
            setCursor(appointment.date)
          }}
          onAdd={(form) => dialog.setAdding({ form })}
          onRecord={dialog.setRecord}
        />
      )}
      {dialog.adding && (
        <PatientForm
          onClose={() => dialog.setAdding(null)}
          onSaved={(p) => {
            dialog.adding.form.set('patientId', p.id)
            dialog.setAdding(null)
          }}
        />
      )}
      {dialog.record && (
        <RecordModal patient={dialog.record} onClose={() => dialog.setRecord(null)} />
      )}
    </div>
  )
}
