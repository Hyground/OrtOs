import { useMemo, useState } from 'react'
import { IconCalendar, IconClock, IconSearch } from '@/components/icons/icons'
import { Button } from '@/components/ui/Button/Button'
import { TextField } from '@/components/ui/TextField/TextField'
import { SelectField } from '@/components/ui/SelectField/SelectField'
import { Badge } from '@/components/ui/Badge/Badge'
import { Avatar, Banner, Pagination } from '@/features/clinical/components'
import { displayDate, money, normalize } from '@/features/clinical/mockStore'
import { usePagination } from '@/features/clinical/tableHelpers'
import { useAppointments } from '@/features/appointments/hooks/useAppointments'
import { usePatients } from '@/features/patients/hooks/usePatients'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import styles from '@/features/clinical/Clinical.module.css'

const costsByTreatment = {
  'Ortodoncia - Fase 2': 550,
  'Ortodoncia - Ajuste': 300,
  'Limpieza dental': 250,
  Endodoncia: 700,
  Extracción: 350,
  'Consulta general': 200,
  Radiografía: 180,
  Blanqueamiento: 850,
}

function statusTone(status) {
  if (status === 'Completada') return 'green'
  if (status === 'Pendiente') return 'amber'
  return 'red'
}

export function AppointmentHistoryPage() {
  useDocumentTitle('Historial de citas')
  const appointments = useAppointments()
  const patients = usePatients()
  const [query, setQuery] = useState('')
  const [date, setDate] = useState('')
  const [status, setStatus] = useState('')
  const [patientId, setPatientId] = useState('')

  const patientMap = useMemo(
    () => new Map(patients.map((patient) => [patient.id, patient])),
    [patients],
  )
  const history = appointments.map((appointment, index) => {
    const patient = patientMap.get(appointment.patientId)
    const cost = costsByTreatment[appointment.treatment] ?? 300
    return {
      ...appointment,
      index: index + 1,
      patient,
      cost,
      paid: appointment.status === 'Completada' ? cost : Math.round(cost * 0.65),
    }
  })
  const rows = history.filter((appointment) => {
    const searchable = [
      appointment.treatment,
      appointment.dentist,
      appointment.patient?.name,
      appointment.status,
    ].join(' ')
    return (
      normalize(searchable).includes(normalize(query)) &&
      (!date || appointment.date === date) &&
      (!status || appointment.status === status) &&
      (!patientId || appointment.patientId === patientId)
    )
  })
  const { page, setPage, visible } = usePagination(rows, 8)

  return (
    <div className={styles.page}>
      <Banner
        title="HISTORIAL DE CITAS"
        description="Consulta el registro de tratamientos, médicos, pacientes, costos y estados de atención."
        Icon={IconClock}
        metrics={[
          [history.length, 'Historiales de citas'],
          [history.filter((appointment) => appointment.status === 'Completada').length, 'Completadas'],
        ]}
      />
      <section className={styles.card}>
        <form
          className={styles.filters}
          onSubmit={(event) => {
            event.preventDefault()
            setPage(1)
          }}
        >
          <TextField
            label="Buscar médico o paciente"
            icon={IconSearch}
            type="search"
            placeholder="Buscar por médico, paciente o tratamiento..."
            value={query}
            onChange={(event) => {
              setQuery(event.target.value)
              setPage(1)
            }}
          />
          <TextField
            label="Por fecha"
            icon={IconCalendar}
            type="date"
            value={date}
            onChange={(event) => {
              setDate(event.target.value)
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
          <SelectField
            label="Por paciente"
            placeholder="Todos los pacientes"
            options={patients.map((patient) => ({ value: patient.id, label: patient.name }))}
            value={patientId}
            onChange={(event) => {
              setPatientId(event.target.value)
              setPage(1)
            }}
          />
          <Button
            type="button"
            size="sm"
            variant="ghost"
            onClick={() => {
              setQuery('')
              setDate('')
              setStatus('')
              setPatientId('')
              setPage(1)
            }}
          >
            Limpiar
          </Button>
        </form>
        <div className={styles.tableScroll}>
          <table className={styles.table}>
            <thead>
              <tr>
                {['#', 'TRATAMIENTO', 'MÉDICO', 'PACIENTE', 'FECHA', 'HORA', 'ESTADO', 'COSTO', 'PAGADO'].map(
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
                  <td>{money(appointment.cost)}</td>
                  <td>{money(appointment.paid)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {!rows.length && <p className={styles.empty}>No se encontraron citas con estos filtros.</p>}
        </div>
        <Pagination total={rows.length} page={page} onChange={setPage} size={8} noun="historiales" />
      </section>
    </div>
  )
}
