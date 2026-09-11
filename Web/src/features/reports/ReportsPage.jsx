import { useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { useClinic } from '@/features/clinical/mockStore'
import { useDoctors } from '@/features/doctors/hooks/useDoctors'
import { readOdontogram } from '@/features/odontogram/odontogramStorage'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { Button } from '@/components/ui/Button/Button'
import { TextField } from '@/components/ui/TextField/TextField'
import { SelectField } from '@/components/ui/SelectField/SelectField'
import {
  IconCalendar,
  IconChart,
  IconCreditCard,
  IconFileText,
  IconSpecialist,
  IconTooth,
  IconUsers,
} from '@/components/icons/icons'
import { buildReport, reportCatalog, scopeClinic, validateFilters } from './reportModel'
import { downloadReport, formatValue } from './reportExport'
import styles from './ReportsPage.module.css'

const icons = {
  money: IconCreditCard,
  calendar: IconCalendar,
  patients: IconUsers,
  doctor: IconSpecialist,
  tooth: IconTooth,
  chart: IconChart,
}
const colors = ['#0284c7', '#1fb59b', '#f59e0b', '#ef4444', '#8b5cf6', '#64748b']
const initialFilters = { from: '', to: '', patientId: '', dentist: '', dentition: 'permanent' }

function ReportChart({ chart }) {
  const total = chart.data.reduce((sum, item) => sum + item.value, 0)
  const maximum = Math.max(1, ...chart.data.map((item) => item.value))
  let offset = 0
  return (
    <figure className={styles.chart}>
      <figcaption>{chart.title}</figcaption>
      {!chart.data.length || !total ? (
        <p className={styles.empty}>Sin datos para graficar.</p>
      ) : (
        <div className={chart.kind === 'donut' ? styles.donutLayout : undefined}>
          {chart.kind === 'donut' && (
            <svg
              viewBox="0 0 120 120"
              className={styles.donut}
              role="img"
              aria-label={`${chart.title}: ${total} citas`}
            >
              {chart.data.map((item, index) => {
                const length = (item.value / total) * 100
                const start = offset
                offset += length
                return (
                  <circle
                    key={item.label}
                    cx="60"
                    cy="60"
                    r="44"
                    fill="none"
                    stroke={colors[index % colors.length]}
                    strokeWidth="16"
                    pathLength="100"
                    strokeDasharray={`${length} ${100 - length}`}
                    strokeDashoffset={-start}
                    transform="rotate(-90 60 60)"
                  />
                )
              })}
              <text x="60" y="64" textAnchor="middle">
                {total}
              </text>
            </svg>
          )}
          <ul className={styles.chartValues}>
            {chart.data.map((item, index) => (
              <li key={item.label}>
                <div>
                  <span>
                    <i style={{ background: colors[index % colors.length] }} />
                    {item.label}
                  </span>
                  <strong>
                    {formatValue(item.value)} {chart.unit || ''}
                  </strong>
                </div>
                {chart.kind !== 'donut' && (
                  <div className={styles.track} aria-hidden="true">
                    <span
                      style={{
                        width: `${(item.value / maximum) * 100}%`,
                        background: colors[index % colors.length],
                      }}
                    />
                  </div>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
    </figure>
  )
}

function ReportTable({ table }) {
  const [requestedPage, setPage] = useState(1)
  const pages = Math.max(1, Math.ceil(table.rows.length / 15))
  const page = Math.min(requestedPage, pages)
  return (
    <section className={styles.tableCard}>
      <h3>
        {table.title} <small>{table.rows.length} registros</small>
      </h3>
      <div className={styles.tableScroll}>
        <table>
          <thead>
            <tr>
              {table.columns.map(({ label }) => (
                <th scope="col" key={label}>
                  {label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {table.rows.slice((page - 1) * 15, page * 15).map((row, index) => (
              <tr key={index}>
                {table.columns.map((column, cell) => (
                  <td key={column.key}>{formatValue(row[cell]) || '—'}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {!table.rows.length && (
        <p className={styles.empty}>Sin registros para los filtros seleccionados.</p>
      )}
      {pages > 1 && (
        <div className={styles.pagination}>
          <Button variant="ghost" disabled={page <= 1} onClick={() => setPage(page - 1)}>
            Anterior
          </Button>
          <span>
            Página {page} de {pages}
          </span>
          <Button variant="ghost" disabled={page >= pages} onClick={() => setPage(page + 1)}>
            Siguiente
          </Button>
        </div>
      )}
    </section>
  )
}

export function ReportsPage() {
  useDocumentTitle('Reportes')
  const { user } = useAuth()
  const clinic = useClinic()
  const doctors = useDoctors()
  const scoped = useMemo(() => scopeClinic(clinic, user, doctors), [clinic, user, doctors])
  const [params, setParams] = useSearchParams()
  const selected = reportCatalog.find(({ id }) => id === params.get('reporte'))
  const [filters, setFilters] = useState(initialFilters)
  const [, setRevision] = useState(0)
  const [busy, setBusy] = useState('')
  const [exportError, setExportError] = useState('')
  const result = (() => {
    if (!selected) return {}
    try {
      const charts = {}
      if (selected.id === 'dental' && scoped.patients.some(({ id }) => id === filters.patientId)) {
        try {
          charts[filters.patientId] = readOdontogram(filters.patientId)
        } catch (error) {
          charts[filters.patientId] = error
        }
      }
      return { report: buildReport(selected.id, scoped, filters, charts) }
    } catch (error) {
      return { error: error.message }
    }
  })()
  const update = (key, value) => {
    setFilters((current) => ({
      ...current,
      [key]: value,
      ...(key === 'dentist' ? { patientId: '' } : {}),
    }))
    setExportError('')
  }
  const patients = scoped.patients.filter(
    (patient) =>
      !filters.dentist ||
      scoped.appointments.some(
        (appointment) =>
          appointment.dentist === filters.dentist && appointment.patientId === patient.id,
      ),
  )
  const dentists = [
    ...new Set(scoped.appointments.map(({ dentist }) => dentist).filter(Boolean)),
  ].sort()
  const canExport =
    !!result.report &&
    !scoped.warning &&
    (selected?.id !== 'dental' || patients.some(({ id }) => id === filters.patientId))
  async function exportFile(format) {
    if (!canExport || busy) return
    setBusy(format)
    setExportError('')
    try {
      await downloadReport(result.report, format)
    } catch {
      setExportError('No se pudo generar el archivo. Intenta nuevamente.')
    } finally {
      setBusy('')
    }
  }
  return (
    <section className={styles.page}>
      <header className={styles.hero}>
        <IconFileText />
        <div>
          <span>Módulo de gestión</span>
          <h1>Reporte</h1>
          <p>Consulta indicadores y descarga la información de tu área de trabajo.</p>
        </div>
      </header>
      {!selected ? (
        <section className={styles.catalog} aria-labelledby="report-areas">
          <header>
            <span>Módulo de gestión</span>
            <h2 id="report-areas">Áreas de trabajo · Reportes</h2>
          </header>
          <div className={styles.cards}>
            {reportCatalog.map((item) => {
              const Icon = icons[item.icon]
              return (
                <button
                  key={item.id}
                  className={styles.reportCard}
                  onClick={() => {
                    setParams({ reporte: item.id })
                    setFilters(initialFilters)
                    setExportError('')
                  }}
                >
                  <span className={styles.cardIcon}>
                    <Icon />
                  </span>
                  <span>
                    <strong>{item.title}</strong>
                    <small>{item.description}</small>
                  </span>
                  <span aria-hidden="true">›</span>
                </button>
              )
            })}
          </div>
        </section>
      ) : (
        <>
          <div className={styles.reportHeader}>
            <div>
              <Button variant="ghost" onClick={() => setParams({})}>
                Volver a reportes
              </Button>
              <h2>{selected.title}</h2>
              <p>{scoped.scope}</p>
            </div>
            <div className={styles.actions}>
              <Button disabled={!canExport || !!busy} onClick={() => exportFile('xlsx')}>
                {busy === 'xlsx' ? 'Generando…' : 'Excel'}
              </Button>
              <Button disabled={!canExport || !!busy} onClick={() => exportFile('pdf')}>
                {busy === 'pdf' ? 'Generando…' : 'PDF'}
              </Button>
            </div>
          </div>
          <div className={styles.filters}>
            {selected.id !== 'dental' && (
              <>
                <TextField
                  label="Desde"
                  type="date"
                  value={filters.from}
                  onChange={(event) => update('from', event.target.value)}
                />
                <TextField
                  label="Hasta"
                  type="date"
                  value={filters.to}
                  min={filters.from || undefined}
                  onChange={(event) => update('to', event.target.value)}
                />
              </>
            )}
            {user?.role === 'admin' && (
              <SelectField
                label="Odontólogo"
                placeholder="Todos"
                options={dentists}
                value={filters.dentist}
                onChange={(event) => update('dentist', event.target.value)}
              />
            )}
            <SelectField
              label="Paciente"
              placeholder={selected.id === 'dental' ? 'Selecciona un paciente' : 'Todos'}
              options={patients.map((patient) => ({
                value: patient.id,
                label: `${patient.name} · ${patient.folio}`,
              }))}
              value={filters.patientId}
              onChange={(event) => update('patientId', event.target.value)}
            />
            {selected.id === 'dental' && (
              <SelectField
                label="Dentadura"
                options={[
                  { value: 'permanent', label: 'Adulto' },
                  { value: 'temporary', label: 'Infantil' },
                ]}
                value={filters.dentition}
                onChange={(event) => update('dentition', event.target.value || 'permanent')}
              />
            )}
            <Button
              variant="ghost"
              onClick={() => {
                setFilters(initialFilters)
                setRevision((value) => value + 1)
                setExportError('')
              }}
            >
              Limpiar filtros
            </Button>
            {selected.id === 'dental' && (
              <Button variant="ghost" onClick={() => setRevision((value) => value + 1)}>
                Actualizar
              </Button>
            )}
          </div>
          {(result.error || exportError) && (
            <p className={styles.error} role="alert">
              {validateFilters(filters) || result.error || exportError}
            </p>
          )}
          {result.report && (
            <>
              <dl className={styles.metrics}>
                {result.report.metrics.map((item) => (
                  <div key={`${item.label}-${item.unit}`}>
                    <dt>{item.label}</dt>
                    <dd>
                      {formatValue(item.value)} <small>{item.unit}</small>
                    </dd>
                  </div>
                ))}
              </dl>
              {result.report.notes.length > 0 && (
                <div className={styles.notes}>
                  {result.report.notes.map((note) => (
                    <p key={note}>{note}</p>
                  ))}
                </div>
              )}
              <div className={styles.charts}>
                {result.report.charts.map((chart) => (
                  <ReportChart key={chart.title} chart={chart} />
                ))}
              </div>
              {result.report.tables.map((table) => (
                <ReportTable
                  key={`${selected.id}-${table.title}-${JSON.stringify(filters)}`}
                  table={table}
                />
              ))}
            </>
          )}
        </>
      )}
    </section>
  )
}
