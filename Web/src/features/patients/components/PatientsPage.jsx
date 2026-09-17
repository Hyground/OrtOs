import { Fragment, useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import {
  IconUsers,
  IconEye,
  IconEdit,
  IconSearch,
  IconDownload,
  IconCalendar,
  IconTooth,
  IconCreditCard,
  IconChevronRight,
} from '@/components/icons/icons'
import { Button } from '@/components/ui/Button/Button'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog/ConfirmDialog'
import { TextField } from '@/components/ui/TextField/TextField'
import { SelectField } from '@/components/ui/SelectField/SelectField'
import { Avatar, Banner, CenterToast, Pagination, StatusToggle } from '@/features/clinical/components'
import { usePagination, exportExcel } from '@/features/clinical/tableHelpers'
import { useModuleDialogs } from '@/features/clinical/useModuleDialogs'
import { normalize, age, displayDate, saveRecord, localDate } from '@/features/clinical/mockStore'
import { RecordModal } from '@/features/records/components/RecordModal'
import { PatientForm } from './PatientForm'
import { AppointmentForm } from '@/features/appointments/components/AppointmentForm'
import { PaymentForm } from '@/features/payments/components/PaymentForm'
import { initialPayment } from '@/features/payments/mockData/initialPayment'
import { paths } from '@/app/routes/paths'
import { usePatients } from '../hooks/usePatients'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import styles from '@/features/clinical/Clinical.module.css'
export function PatientsPage() {
  useDocumentTitle('Pacientes')
  const navigate = useNavigate()
  const patients = usePatients()
  const dialog = useModuleDialogs()
  const [params] = useSearchParams()
  const [query, setQuery] = useState(params.get('q') ?? '')
  const [status, setStatus] = useState('')
  const [gender, setGender] = useState('')
  const [statusBusy, setStatusBusy] = useState('')
  const [confirmingStatus, setConfirmingStatus] = useState(null)
  const [statusError, setStatusError] = useState('')
  const [statusNotice, setStatusNotice] = useState(null)
  const [expandedId, setExpandedId] = useState('')
  const [quickPayment, setQuickPayment] = useState(null)
  const [quickAppointment, setQuickAppointment] = useState(null)
  const rows = patients.filter(
    (p) =>
      normalize(p.name + ' ' + p.dpi + ' ' + p.phone + ' ' + p.folio).includes(normalize(query)) &&
      (!status || p.status === status) &&
      (!gender || p.gender === gender),
  )
  const { page, setPage, visible } = usePagination(rows, 5)
  const globalQuery = params.get('q') ?? ''
  useEffect(() => {
    setQuery(globalQuery)
    setPage(1)
  }, [globalQuery, setPage])
  useEffect(() => {
    if (!statusNotice) return undefined
    const timer = setTimeout(() => setStatusNotice(null), 2200)
    return () => clearTimeout(timer)
  }, [statusNotice])
  useEffect(() => {
    if (visible.some((patient) => patient.id === expandedId)) return
    setExpandedId('')
  }, [expandedId, visible])
  const exportRows = () =>
    exportExcel(
      rows,
      [
        { key: 'name', label: 'Paciente' },
        { key: 'dpi', label: 'DPI' },
        { key: 'phone', label: 'Teléfono' },
        { key: 'email', label: 'Email' },
        { key: 'folio', label: 'Expediente' },
        { key: 'status', label: 'Estado' },
      ],
      'pacientes-ortos.xlsx',
      'Directorio de pacientes',
    )
  const togglePatientStatus = async (patient) => {
    const nextStatus = patient.status === 'Activo' ? 'Inactivo' : 'Activo'
    setStatusBusy(patient.id)
    try {
      await saveRecord('patients', { ...patient, status: nextStatus })
      setStatusNotice(`${patient.name} ${nextStatus === 'Activo' ? 'activado' : 'desactivado'}`)
    } catch (e) {
      setStatusError(e.message)
    } finally {
      setStatusBusy('')
    }
  }
  return (
    <div className={styles.page}>
      <Banner
        title="MÓDULO DE PACIENTE"
        description="Administra la información de los pacientes, sus datos personales, contactos, historial clínico y expedientes en un solo lugar."
        Icon={IconUsers}
        metrics={[
          [patients.length, 'Pacientes registrados'],
          [
            patients.filter((p) => p.createdAt?.startsWith(localDate().slice(0, 7))).length,
            'Nuevos este mes',
          ],
        ]}
        onNew={dialog.create}
        newLabel="NUEVO PACIENTE"
      />
      {dialog.notice && (
        <p role="status" className={styles.success}>
          {dialog.notice}
        </p>
      )}
      <CenterToast notice={statusNotice} />
      <section className={styles.card}>
        <form
          className={styles.filters}
          onSubmit={(e) => {
            e.preventDefault()
            setPage(1)
          }}
        >
          <TextField
            label="Buscar paciente"
            icon={IconSearch}
            type="search"
            placeholder="Buscar por nombre, DPI o teléfono..."
            value={query}
            onChange={(e) => {
              setQuery(e.target.value)
              setPage(1)
            }}
          />
          <SelectField
            label="Estado"
            placeholder="Todos los estados"
            options={['Activo', 'Inactivo']}
            value={status}
            onChange={(e) => {
              setStatus(e.target.value)
              setPage(1)
            }}
          />
          <SelectField
            label="Género"
            placeholder="Todos los géneros"
            options={['Femenino', 'Masculino', 'Otro']}
            value={gender}
            onChange={(e) => {
              setGender(e.target.value)
              setPage(1)
            }}
          />
          <Button type="submit" size="sm">
            <IconSearch /> Buscar
          </Button>
          <Button type="button" size="sm" onClick={dialog.create}>
            + NUEVO PACIENTE
          </Button>
          <Button size="sm" variant="ghost" onClick={exportRows} aria-label="Exportar pacientes">
            <IconDownload />
          </Button>
        </form>
        <div className={styles.tableScroll}>
          <table className={styles.table + ' ' + styles.patientsTable}>
            <thead>
              <tr>
                {['PACIENTE', 'DPI', 'TELÉFONO', 'EMAIL', 'ÚLTIMA CITA', 'ESTADO', 'ACCIONES'].map(
                  (h) => (
                    <th key={h} scope="col">
                      {h}
                    </th>
                  ),
                )}
              </tr>
            </thead>
            <tbody>
              {visible.map((p) => {
                const expanded = expandedId === p.id
                return (
                  <Fragment key={p.id}>
                    <tr
                      className={expanded ? styles.activeRow : styles.clickableRow}
                      tabIndex={0}
                      aria-expanded={expanded}
                      aria-controls={'patient-actions-' + p.id}
                      onClick={() => setExpandedId(expanded ? '' : p.id)}
                      onKeyDown={(event) => {
                        if (event.key !== 'Enter' && event.key !== ' ') return
                        event.preventDefault()
                        setExpandedId(expanded ? '' : p.id)
                      }}
                    >
                      <td>
                        <div className={styles.personButton}>

                          <Avatar patient={p} variant="initials" />
                          <span>
                            <strong>{p.name}</strong>
                            <small>
                              {p.gender}, {age(p.birthDate)} años
                            </small>
                          </span>
                        </div>
                      </td>
                      <td data-label="DPI">{p.dpi || '—'}</td>
                      <td data-label="TELÉFONO">{p.phone}</td>
                      <td data-label="EMAIL">{p.email || '—'}</td>
                      <td data-label="ÚLTIMA CITA">{displayDate(p.lastAppointment)}</td>
                      <td data-label="ESTADO" onClick={(event) => event.stopPropagation()}>
                        <StatusToggle
                          active={p.status === 'Activo'}
                          disabled={statusBusy === p.id}
                          label={`Cambiar estado de ${p.name} a ${
                            p.status === 'Activo' ? 'Inactivo' : 'Activo'
                          }`}
                          onToggle={() => {
                            setStatusError('')
                            setConfirmingStatus(p)
                          }}
                        />
                      </td>
                      <td data-label="ACCIONES" onClick={(event) => event.stopPropagation()}>
                        <button
                          type="button"
                          className={styles.optionButton}
                          aria-expanded={expanded}
                          aria-controls={'patient-actions-' + p.id}
                          onClick={() => setExpandedId(expanded ? '' : p.id)}
                        >
                          Opciones
                          <IconChevronRight />
                        </button>
                      </td>
                    </tr>
                    {expanded && (
                      <tr className={styles.detailRow}>
                        <td colSpan={7}>
                          <div className={styles.patientDrawer} id={'patient-actions-' + p.id}>
                            <div className={styles.drawerActions} aria-label={'Acciones de ' + p.name}>
                              <button
                                type="button"
                                className={styles.actionCard + ' ' + styles.actionPayment}
                                onClick={() => setQuickPayment(p)}
                              >
                                <IconCreditCard />
                                <span>Registrar pago</span>
                              </button>
                              <button
                                type="button"
                                className={styles.actionCard + ' ' + styles.actionAppointment}
                                onClick={() => setQuickAppointment(p)}
                              >
                                <IconCalendar />
                                <span>Agendar cita</span>
                              </button>
                              <button
                                type="button"
                                className={styles.actionCard + ' ' + styles.actionRecord}
                                onClick={() => dialog.setRecord(p)}
                              >
                                <IconEye />
                                <span>Ver expediente</span>
                              </button>
                              <button
                                type="button"
                                className={styles.actionCard + ' ' + styles.actionRecord}
                                onClick={() => navigate(paths.odontogram + '?paciente=' + p.id)}
                              >
                                <IconTooth />
                                <span>Odontograma</span>
                              </button>
                              <button
                                type="button"
                                className={styles.actionCard + ' ' + styles.actionEdit}
                                onClick={() => dialog.setEditing(p)}
                              >
                                <IconEdit />
                                <span>Editar datos</span>
                              </button>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </Fragment>
                )
              })}
            </tbody>
          </table>
          {!rows.length && (
            <p className={styles.empty}>No se encontraron pacientes con estos filtros.</p>
          )}
        </div>
        <Pagination total={rows.length} page={page} onChange={setPage} size={5} noun="pacientes" />
      </section>
      <ConfirmDialog
        open={!!confirmingStatus}
        title={confirmingStatus?.status === 'Activo' ? 'Desactivar paciente' : 'Activar paciente'}
        message={`¿Estás seguro de ${confirmingStatus?.status === 'Activo' ? 'desactivar' : 'activar'} ${confirmingStatus?.name}?`}
        confirmLabel={confirmingStatus?.status === 'Activo' ? 'Desactivar' : 'Activar'}
        danger={confirmingStatus?.status === 'Activo'}
        busy={!!statusBusy}
        error={statusError}
        onClose={() => setConfirmingStatus(null)}
        onConfirm={() => togglePatientStatus(confirmingStatus)}
      />
      {dialog.open && (
        <PatientForm patient={dialog.editing} onClose={dialog.close} onSaved={dialog.onSaved} />
      )}

      {quickPayment && (
        <PaymentForm
          payment={{ ...initialPayment(), patientId: quickPayment.id }}
          compactPatient
          onClose={() => setQuickPayment(null)}
          onSaved={() => {
            setQuickPayment(null)
            dialog.setNotice('Pago registrado correctamente.')
          }}
          onAdd={(form) => dialog.setAdding({ form })}
          onRecord={dialog.setRecord}
        />
      )}
      {quickAppointment && (
        <AppointmentForm
          initialPatientId={quickAppointment.id}
          compactPatient
          date={localDate()}
          onClose={() => setQuickAppointment(null)}
          onSaved={() => {
            setQuickAppointment(null)
            dialog.setNotice('Cita registrada correctamente.')
          }}
          onAdd={(form) => dialog.setAdding({ form })}
          onRecord={dialog.setRecord}
        />
      )}
      {dialog.record && (
        <RecordModal patient={dialog.record} onClose={() => dialog.setRecord(null)} />
      )}
    </div>
  )
}
