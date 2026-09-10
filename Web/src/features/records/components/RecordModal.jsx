import { useMemo, useState } from 'react'
import qrcode from 'qrcode-generator'
import { Modal } from '@/components/ui/Modal/Modal'
import { Button } from '@/components/ui/Button/Button'
import { IconTooth, IconUser, IconDownload, IconPrint } from '@/components/icons/icons'
import { localDate, displayDate, useClinic } from '@/features/clinical/mockStore'
import { clinicalHistory } from '../mockData/records'
import { recordSections, createRecordPDF } from './recordDocument'
import styles from './RecordModal.module.css'
function Code({ value }) {
  const qr = useMemo(() => {
    const code = qrcode(0, 'M')
    code.addData(value)
    code.make()
    return code
  }, [value])
  const n = qr.getModuleCount()
  return (
    <svg
      className={styles.qr}
      viewBox={'-4 -4 ' + (n + 8) + ' ' + (n + 8)}
      role="img"
      aria-label={'Código QR del folio ' + value}
    >
      <rect x="-4" y="-4" width={n + 8} height={n + 8} fill="white" />
      {Array.from({ length: n * n }, (_, i) =>
        qr.isDark(Math.floor(i / n), i % n) ? (
          <rect key={i} x={i % n} y={Math.floor(i / n)} width="1" height="1" fill="black" />
        ) : null,
      )}
    </svg>
  )
}
export function RecordModal({ patient, onClose }) {
  const [page, setPage] = useState(1)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const clinic = useClinic()
  const p = clinic.patients.find((p) => p.id === patient.id) ?? patient
  const history = [
    ...clinicalHistory.filter((h) => h.patientId === p.id),
    ...clinic.appointments
      .filter(
        (a) =>
          a.patientId === p.id &&
          a.status === 'Completada' &&
          !clinicalHistory.some((h) => h.patientId === p.id && h.date === a.date),
      )
      .map((a) => ({ ...a, notes: a.notes || a.reason })),
  ].sort((a, b) => b.date.localeCompare(a.date))
  const header = (
    <header className={styles.header}>
      <div className={styles.brand}>
        <IconTooth />
        OrtOs<small>Clínica Odontológica</small>
      </div>
      <div className={styles.heading}>
        <h3>EXPEDIENTE DEL PACIENTE</h3>
        <p>Fecha de emisión: {displayDate(localDate())}</p>
        <p>
          Folio: <strong>{p.folio}</strong>
        </p>
      </div>
    </header>
  )
  const footer = (
    <p className={styles.confidential}>
      Este documento es confidencial y de uso exclusivo de la clínica y el paciente.
    </p>
  )
  return (
    <Modal
      open
      size="document"
      title="EXPEDIENTE DEL PACIENTE - PDF"
      onClose={onClose}
      toolbar={
        <div className={styles.toolbar}>
          <Button
            size="sm"
            disabled={busy}
            onClick={async () => {
              setBusy(true)
              setError('')
              try {
                const pdf = await createRecordPDF(p, history)
                pdf.save(p.folio + '.pdf')
              } catch {
                setError('No se pudo generar el PDF. Intenta nuevamente.')
              } finally {
                setBusy(false)
              }
            }}
          >
            <IconDownload />
            {busy ? 'Generando…' : 'Descargar'}
          </Button>
          <Button size="sm" variant="ghost" onClick={() => window.print()}>
            <IconPrint />
            Imprimir
          </Button>
          <Button
            size="sm"
            variant="ghost"
            disabled={page === 1}
            aria-label="Página anterior del expediente"
            onClick={() => setPage(1)}
          >
            ‹
          </Button>
          <span>Página {page} de 2</span>
          <Button
            size="sm"
            variant="ghost"
            disabled={page === 2}
            aria-label="Página siguiente del expediente"
            onClick={() => setPage(2)}
          >
            ›
          </Button>
        </div>
      }
    >
      {error && <p role="alert">{error}</p>}
      <div className={styles.printRoot}>
        <article className={styles.sheet + ' ' + (page !== 1 ? styles.hidden : '')}>
          {header}
          {recordSections(p).map((section, i) => (
            <section className={styles.section} key={section.title}>
              <h3>{section.title}</h3>
              <div className={i === 0 ? styles.personal : undefined}>
                {i === 0 &&
                  (p.photo ? (
                    <img className={styles.photo} src={p.photo} alt={'Foto de ' + p.name} />
                  ) : (
                    <span className={styles.photo}>
                      <IconUser />
                    </span>
                  ))}
                <dl className={styles.fields}>
                  {section.fields.map(([label, value]) => (
                    <div key={label}>
                      <dt>{label}</dt>
                      <dd>{value || 'No registrado'}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            </section>
          ))}
          <section className={styles.section}>
            <h3>TRATAMIENTO ACTIVO</h3>
            <p>{p.treatment}</p>
            <p>El historial clínico y la firma del odontólogo se encuentran en la página 2.</p>
          </section>
          {footer}
        </article>
        <article className={styles.sheet + ' ' + (page !== 2 ? styles.hidden : '')}>
          {header}
          <section className={styles.section}>
            <h3>HISTORIAL CLÍNICO RESUMIDO</h3>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Fecha</th>
                  <th>Tratamiento / Procedimiento</th>
                  <th>Odontólogo</th>
                </tr>
              </thead>
              <tbody>
                {history.slice(0, 10).map((h, i) => (
                  <tr key={i}>
                    <td>{displayDate(h.date)}</td>
                    <td>
                      {h.treatment}
                      <small>{h.notes || 'Sin notas adicionales.'}</small>
                    </td>
                    <td>{h.dentist}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {!history.length && <p>Sin atenciones clínicas registradas.</p>}
            {history.length > 10 && <p>Se muestran las 10 atenciones más recientes.</p>}
          </section>
          <div className={styles.signature}>
            <p>
              Firma del odontólogo tratante<small>Colegiado: __________________</small>
            </p>
            <Code value={p.folio} />
          </div>
          {footer}
        </article>
      </div>
    </Modal>
  )
}
