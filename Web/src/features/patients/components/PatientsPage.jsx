import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import {
  IconUsers,
  IconEye,
  IconEdit,
  IconTrash,
  IconSearch,
  IconDownload,
} from '@/components/icons/icons'
import { Button } from '@/components/ui/Button/Button'
import { TextField } from '@/components/ui/TextField/TextField'
import { SelectField } from '@/components/ui/SelectField/SelectField'
import { Modal } from '@/components/ui/Modal/Modal'
import { Avatar, Banner, CenterToast, Pagination, StatusToggle, Tabs } from '@/features/clinical/components'
import { usePagination, exportExcel } from '@/features/clinical/tableHelpers'
import { useModuleDialogs } from '@/features/clinical/useModuleDialogs'
import { normalize, age, displayDate, deletePatient, saveRecord } from '@/features/clinical/mockStore'
import { RecordModal } from '@/features/records/components/RecordModal'
import { PatientForm } from './PatientForm'
import { usePatients } from '../hooks/usePatients'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import styles from '@/features/clinical/Clinical.module.css'
export function PatientsPage() {
  useDocumentTitle('Pacientes')
  const patients = usePatients()
  const dialog = useModuleDialogs()
  const [params] = useSearchParams()
  const [query, setQuery] = useState(params.get('q') ?? '')
  const [status, setStatus] = useState('')
  const [gender, setGender] = useState('')
  const [remove, setRemove] = useState(null)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const [statusBusy, setStatusBusy] = useState('')
  const [statusNotice, setStatusNotice] = useState(null)
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
      dialog.setNotice('')
      setError(e.message)
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
          [patients.filter((p) => p.createdAt?.startsWith('2026-08')).length, 'Nuevos en agosto'],
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
        <Tabs
          items={['LISTA DE PACIENTES', 'NUEVO PACIENTE', 'EXPORTAR']}
          value="LISTA DE PACIENTES"
          onChange={(v) =>
            v === 'NUEVO PACIENTE' ? dialog.create() : v === 'EXPORTAR' ? exportRows() : null
          }
        />
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
          <Button size="sm" variant="ghost" onClick={exportRows} aria-label="Exportar pacientes">
            <IconDownload />
          </Button>
        </form>
        <div className={styles.tableScroll}>
          <table className={styles.table}>
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
              {visible.map((p) => (
                <tr key={p.id}>
                  <td>
                    <div className={styles.person}>
                      <Avatar patient={p} />
                      <div>
                        <strong>{p.name}</strong>
                        <small>
                          {p.gender}, {age(p.birthDate)} años
                        </small>
                      </div>
                    </div>
                  </td>
                  <td>{p.dpi || '—'}</td>
                  <td>{p.phone}</td>
                  <td>{p.email || '—'}</td>
                  <td>{displayDate(p.lastAppointment)}</td>
                  <td>
                                        <StatusToggle
                      active={p.status === 'Activo'}
                      disabled={statusBusy === p.id}
                      label={`Cambiar estado de ${p.name} a ${
                        p.status === 'Activo' ? 'Inactivo' : 'Activo'
                      }`}
                      onToggle={() => togglePatientStatus(p)}
                    />
                  </td>
                  <td>
                    <div className={styles.actions}>
                      <button
                        className={styles.iconButton}
                        aria-label={'Ver expediente de ' + p.name}
                        onClick={() => dialog.setRecord(p)}
                      >
                        <IconEye />
                      </button>
                      <button
                        className={styles.iconButton}
                        aria-label={'Editar ' + p.name}
                        onClick={() => dialog.setEditing(p)}
                      >
                        <IconEdit />
                      </button>
                      <button
                        className={styles.iconButton + ' ' + styles.danger}
                        aria-label={'Eliminar ' + p.name}
                        onClick={() => {
                          setRemove(p)
                          setError('')
                        }}
                      >
                        <IconTrash />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!rows.length && (
            <p className={styles.empty}>No se encontraron pacientes con estos filtros.</p>
          )}
        </div>
        <Pagination total={rows.length} page={page} onChange={setPage} size={5} noun="pacientes" />
      </section>
      {dialog.open && (
        <PatientForm patient={dialog.editing} onClose={dialog.close} onSaved={dialog.onSaved} />
      )}
      {dialog.record && (
        <RecordModal patient={dialog.record} onClose={() => dialog.setRecord(null)} />
      )}
      <Modal
        open={!!remove}
        title="Eliminar paciente"
        onClose={() => {
          if (!busy) setRemove(null)
        }}
      >
        <p>
          ¿Eliminar a {remove?.name}? Esta acción elimina el registro del entorno de demostración.
        </p>
        {error && (
          <p role="alert" className={styles.error}>
            {error}
          </p>
        )}
        <div className={styles.footer}>
          <Button variant="ghost" disabled={busy} onClick={() => setRemove(null)}>
            Cancelar
          </Button>
          <Button
            disabled={busy}
            onClick={async () => {
              setBusy(true)
              try {
                await deletePatient(remove.id)
                setRemove(null)
                dialog.setNotice('Paciente eliminado.')
              } catch (e) {
                setError(e.message)
              } finally {
                setBusy(false)
              }
            }}
          >
            {busy ? 'Eliminando…' : 'Eliminar'}
          </Button>
        </div>
      </Modal>
    </div>
  )
}
