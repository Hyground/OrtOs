import { useState } from 'react'
import { usePatients } from '@/features/patients/hooks/usePatients'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { SearchSelect } from '@/components/ui/SearchSelect/SearchSelect'
import { Button } from '@/components/ui/Button/Button'
import { IconTooth, IconDownload } from '@/components/icons/icons'
import {
  quadrants,
  dentitionNumbers,
  dentitionStates,
  stateById,
  summarize,
  patientFields,
  detailRows,
} from './odontogramModel'
import { readOdontogram, saveOdontogram } from './odontogramStorage'
import { createOdontogramPDF } from './odontogramPdf'
import { ToothDiagram } from './ToothDiagram'
import { ToothEditor } from './ToothEditor'
import styles from './OdontogramPage.module.css'

export function OdontogramPage() {
  useDocumentTitle('Odontograma')
  const patients = usePatients()
  const [patientId, setPatientId] = useState('')
  const patient = patients.find(({ id }) => id === patientId)
  const [storedChart, setChart] = useState({})
  const chart = patient ? storedChart : {}
  const [loadError, setLoadError] = useState('')
  const [editing, setEditing] = useState(null)
  const [dentition, setDentition] = useState('permanent')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const numbers = dentitionNumbers(dentition)
  const visibleStates = dentitionStates(dentition)
  const counts = summarize(chart, patient && !loadError ? numbers : [])
  const rows = detailRows(chart, numbers)
  const enabled = !!patient && !loadError

  function onPatientChange(id) {
    setPatientId(id)
    setEditing(null)
    setError('')
    setLoadError('')
    try {
      setChart(id ? readOdontogram(id) : {})
    } catch {
      setChart({})
      setLoadError(
        'No se pudo cargar el odontograma de este paciente. Vuelve a seleccionarlo para reintentar.',
      )
    }
  }

  async function download() {
    setBusy(true)
    setError('')
    try {
      const pdf = await createOdontogramPDF(patient, chart, undefined, dentition)
      const filename = `Odontograma-${patient.folio || patient.id}`.replace(/[^\w-]/g, '_')
      pdf.save(`${filename}.pdf`)
    } catch {
      setError('No se pudo generar el PDF. Intenta nuevamente.')
    } finally {
      setBusy(false)
    }
  }

  function toothRow(numbers) {
    return (
      <div className={styles.teethRow}>
        {numbers.map((number) => {
          const tooth = chart[number]
          const labels = [...new Set(Object.values(tooth?.faces ?? {}))].map(
            (id) => stateById[id].label,
          )
          return (
            <button
              key={number}
              type="button"
              className={styles.tooth}
              disabled={!enabled}
              aria-label={`Diente ${number}`}
              title={`Diente ${number}: ${labels.join(', ') || 'Sano'}`}
              onClick={() => setEditing(number)}
            >
              <span>{number}</span>
              <ToothDiagram tooth={tooth} />
              <span className={styles.noteMarker} aria-hidden="true">
                {tooth?.notes ? '•' : '\u00a0'}
              </span>
            </button>
          )
        })}
      </div>
    )
  }

  return (
    <section className={styles.page}>
      <header className={styles.banner}>
        <span className={styles.moduleIcon}>
          <IconTooth />
        </span>
        <div>
          <h1>Odontograma</h1>
          <p>Registro dental y seguimiento por pieza.</p>
        </div>
      </header>
      <div className={styles.toolbar}>
        <SearchSelect
          label="Paciente"
          options={patients}
          value={patient?.id ?? ''}
          onChange={onPatientChange}
        />
        <button
          type="button"
          role="switch"
          aria-label="Dentadura infantil"
          aria-checked={dentition === 'temporary'}
          className={styles.dentitionSwitch}
          onClick={() => {
            setDentition(dentition === 'permanent' ? 'temporary' : 'permanent')
            setEditing(null)
          }}
        >
          <span className={dentition === 'permanent' ? styles.activeDentition : undefined}>
            Adulto
          </span>
          <span className={styles.switchTrack} aria-hidden="true">
            <span />
          </span>
          <span className={dentition === 'temporary' ? styles.activeDentition : undefined}>
            Infantil
          </span>
        </button>
        <Button variant="ghost" onClick={() => onPatientChange('')}>
          Limpiar
        </Button>
        <Button disabled={!enabled || busy} onClick={download}>
          <IconDownload />
          {busy ? 'Generando…' : 'PDF'}
        </Button>
      </div>
      {(loadError || error) && (
        <p role="alert" className={styles.error}>
          {loadError || error}
        </p>
      )}
      {patient && (
        <section className={styles.card} aria-label="Información del paciente">
          <h2 className={styles.sectionTitle}>Datos del paciente e información médica</h2>
          <dl className={styles.patientInfo}>
            {patientFields(patient).map(([label, value]) => (
              <div key={label}>
                <dt>{label}</dt>
                <dd>{value}</dd>
              </div>
            ))}
          </dl>
        </section>
      )}
      <div className={styles.chartLayout}>
        <div className={styles.card}>
          <div className={styles.chartScroll}>
            <div className={styles.quadrants}>
              {quadrants.map((quadrant) => (
                <section key={quadrant.id} className={styles.quadrant}>
                  <h2>
                    Cuadrante {quadrant.id} <span>({quadrant.label})</span>
                  </h2>
                  {toothRow(quadrant[dentition])}
                </section>
              ))}
            </div>
          </div>
        </div>
        <aside className={`${styles.card} ${styles.legend}`} aria-label="Estados dentales">
          <h2>Estados</h2>
          {visibleStates.map((state) => (
            <div key={state.id}>
              <span className={styles.dot} style={{ background: state.color }} />
              {state.label}
            </div>
          ))}
        </aside>
      </div>
      <dl className={styles.summary} aria-label="Resumen de dientes">
        {visibleStates.map((state) => (
          <div key={state.id}>
            <dt>
              {state.label}
              <small>Dientes</small>
            </dt>
            <dd aria-label={`${state.label}: ${counts[state.id]} dientes`}>{counts[state.id]}</dd>
          </div>
        ))}
      </dl>
      {patient && rows.length > 0 && (
        <section className={styles.card}>
          <h2 className={styles.sectionTitle}>Registro detallado por pieza</h2>
          <div className={styles.tableScroll}>
            <table className={styles.table}>
              <thead>
                <tr>
                  {[
                    'Pieza',
                    'Cuadrante / Zona',
                    'Estado',
                    'Tratamiento indicado',
                    'Observaciones / Superficie',
                  ].map((label) => (
                    <th key={label} scope="col">
                      {label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={`${row.number}-${row.state}`}>
                    <td>
                      <button
                        className={styles.pieceLink}
                        onClick={() => setEditing(row.number)}
                        aria-label={`Editar diente ${row.number}, ${stateById[row.state]?.label ?? 'Observación'}`}
                      >
                        {row.number}
                      </button>
                    </td>
                    <td>{row.zone}</td>
                    <td>
                      <span className={styles.stateLabel}>
                        <span
                          className={styles.dot}
                          style={{ background: stateById[row.state]?.color ?? '#ffffff' }}
                        />
                        {stateById[row.state]?.label ?? 'Observación'}
                      </span>
                    </td>
                    <td>{row.treatment || '—'}</td>
                    <td>
                      {row.surfaces && <strong>{row.surfaces}</strong>}
                      {row.notes && <p>{row.notes}</p>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
      {editing !== null && (
        <ToothEditor
          key={editing}
          number={editing}
          dentition={dentition}
          tooth={chart[editing]}
          onClose={() => setEditing(null)}
          onSave={(tooth) => {
            const next = { ...chart, [editing]: tooth }
            saveOdontogram(patient.id, next)
            setChart(next)
          }}
        />
      )}
    </section>
  )
}
