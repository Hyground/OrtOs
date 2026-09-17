import { useMemo, useState } from 'react'
import { IconClock } from '@/components/icons/icons'
import { Button } from '@/components/ui/Button/Button'
import { SelectField } from '@/components/ui/SelectField/SelectField'
import { Badge } from '@/components/ui/Badge/Badge'
import { Avatar, Banner, Pagination } from '@/features/clinical/components'
import { displayDate } from '@/features/clinical/mockStore'
import { usePagination } from '@/features/clinical/tableHelpers'
import { QuickPatientSelect } from '@/features/payments/components/QuickPatientSelect'
import { useAppointments } from '@/features/appointments/hooks/useAppointments'
import { usePatients } from '@/features/patients/hooks/usePatients'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import styles from '@/features/clinical/Clinical.module.css'
import css from './AppointmentHistoryPage.module.css'
import { HistoryDateField } from './HistoryDateField'

function statusTone(status) {
  if (status === 'Completada') return 'green'
  if (status === 'Pendiente') return 'amber'
  return 'red'
}

export function AppointmentHistoryPage() {
  useDocumentTitle('Historial de citas')
  const appointments = useAppointments()
  const patients = usePatients()
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')
  const [status, setStatus] = useState('')
  const [patientId, setPatientId] = useState('')

  const patientMap = useMemo(
    () => new Map(patients.map((patient) => [patient.id, patient])),
    [patients],
  )
  const history = [...appointments]
    .sort((a, b) => b.date.localeCompare(a.date) || b.time.localeCompare(a.time))
    .map((appointment, index) => {
      const patient = patientMap.get(appointment.patientId)
      return {
        ...appointment,
        index: index + 1,
        patient,
      }
    })
  const rows = history.filter(
    (appointment) =>
      (!from
        ? !to || appointment.date <= to
        : !to
          ? appointment.date === from
          : appointment.date >= from && appointment.date <= to) &&
      (!status || appointment.status === status) &&
      (!patientId || appointment.patientId === patientId),
  )
  const { page, setPage, visible } = usePagination(rows, 25)
  const invalidRange = from && to && from > to

  return (
    <div className={styles.page}>
      <Banner
        title="HISTORIAL DE CITAS"
        description="Consulta el registro de tratamientos, médicos, pacientes y estados de atención."
        Icon={IconClock}
        metrics={[
          [history.length, 'Total de citas'],
          [
            history.filter((appointment) => appointment.status === 'Completada').length,
            'Completadas',
          ],
          [
            history.filter((appointment) => appointment.status === 'Pendiente').length,
            'Pendientes',
          ],
        ]}
      />
      <section className={styles.card + ' ' + css.card}>
        <form
          className={styles.filters}
          onSubmit={(event) => {
            event.preventDefault()
          }}
        >
          <HistoryDateField
            label="Desde"
            value={from}
            max={to || undefined}
            onChange={(event) => {
              setFrom(event.target.value)
              setPage(1)
            }}
          />
          <HistoryDateField
            label="Hasta (opcional)"
            value={to}
            min={from || undefined}
            onChange={(event) => {
              setTo(event.target.value)
              setPage(1)
            }}
          />
          <SelectField
            label="Por estado"
            placeholder="Todos los estados"
            options={['Completada', 'Pendiente', 'Cancelada']}
            value={status}
            onChange={(event) => {
              setStatus(event.target.value)
              setPage(1)
            }}
          />
          <QuickPatientSelect
            label="Por paciente"
            options={patients}
            value={patientId}
            openOnFocus={false}
            onChange={(value) => {
              setPatientId(value)
              setPage(1)
            }}
          />
          <Button
            type="button"
            size="sm"
            variant="ghost"
            onClick={() => {
              setFrom('')
              setTo('')
              setStatus('')
              setPatientId('')
              setPage(1)
            }}
          >
            Limpiar
          </Button>
        </form>
        {invalidRange && (
          <p role="alert" className={styles.error}>
            La fecha inicial debe ser anterior o igual a la fecha final.
          </p>
        )}
        <div
          className={styles.tableScroll + ' ' + css.tableScroll}
          key={`${page}-${from}-${to}-${status}-${patientId}`}
        >
          <table className={styles.table + ' ' + css.historyTable}>
            <colgroup>
              {[5, 20, 19, 28, 11, 7, 10].map((width, index) => (
                <col key={index} style={{ width: `${width}%` }} />
              ))}
            </colgroup>
            <thead>
              <tr>
                {['#', 'TRATAMIENTO', 'MÉDICO', 'PACIENTE', 'FECHA', 'HORA', 'ESTADO'].map(
                  (heading) => (
                    <th key={heading} scope="col">
                      {heading}
                    </th>
                  ),
                )}
              </tr>
            </thead>
            <tbody>
              {visible.map((appointment) => (
                <tr key={appointment.id}>
                  <td>{appointment.index}</td>
                  <td>{appointment.treatment}</td>
                  <td>{appointment.dentist}</td>
                  <td>
                    <div className={styles.person}>
                      <Avatar patient={appointment.patient} />
                      <strong>{appointment.patient?.name ?? 'Paciente no disponible'}</strong>
                    </div>
                  </td>
                  <td>{displayDate(appointment.date)}</td>
                  <td>{appointment.time}</td>
                  <td>
                    <Badge tone={statusTone(appointment.status)}>{appointment.status}</Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!rows.length && (
            <p className={styles.empty}>No se encontraron citas con estos filtros.</p>
          )}
        </div>
        <Pagination total={rows.length} page={page} onChange={setPage} size={25} noun="citas" />
      </section>
    </div>
  )
}
