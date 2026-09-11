import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { IconEdit, IconMedical, IconSearch, IconTrash } from '@/components/icons/icons'
import { Button } from '@/components/ui/Button/Button'
import { TextField } from '@/components/ui/TextField/TextField'
import { SelectField } from '@/components/ui/SelectField/SelectField'
import { Badge } from '@/components/ui/Badge/Badge'
import { Modal } from '@/components/ui/Modal/Modal'
import { Avatar, Banner, Pagination, Tabs } from '@/features/clinical/components'
import { normalize } from '@/features/clinical/mockStore'
import { useModuleDialogs } from '@/features/clinical/useModuleDialogs'
import { usePagination } from '@/features/clinical/tableHelpers'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { useDoctors } from '../hooks/useDoctors'
import { specialties } from '../mockData/doctors'
import { DoctorForm } from './DoctorForm'
import styles from '@/features/clinical/Clinical.module.css'

export function DoctorsPage() {
  useDocumentTitle('Médicos')
  const [params] = useSearchParams()
  const dialog = useModuleDialogs()
  const initialDoctors = useDoctors()
  const [doctors, setDoctors] = useState(initialDoctors)
  const [query, setQuery] = useState(params.get('q') ?? '')
  const [specialty, setSpecialty] = useState('')
  const [remove, setRemove] = useState(null)
  const rows = doctors.filter(
    (doctor) =>
      normalize(doctor.name + ' ' + doctor.dpi + ' ' + doctor.specialty + ' ' + doctor.phone).includes(
        normalize(query),
      ) &&
      (!specialty || doctor.specialty === specialty),
  )
  const { page, setPage, visible } = usePagination(rows, 7)

  useEffect(() => {
    setQuery(params.get('q') ?? '')
    setPage(1)
  }, [params, setPage])

  const saveDoctor = (doctor) => {
    setDoctors((current) =>
      current.some((item) => item.id === doctor.id)
        ? current.map((item) => (item.id === doctor.id ? doctor : item))
        : [doctor, ...current],
    )
    dialog.onSaved()
  }

  return (
    <div className={styles.page}>
      <Banner
        title="MÓDULO DE MÉDICOS"
        description="Administra el directorio médico, especialidades asignadas y datos de contacto del personal clínico."
        Icon={IconMedical}
        metrics={[
          [doctors.length, 'Médicos registrados'],
          [doctors.filter((doctor) => doctor.status === 'Activo').length, 'Activos'],
        ]}
        onNew={dialog.create}
        newLabel="NUEVO MÉDICO"
      />
      {dialog.notice && (
        <p role="status" className={styles.success}>
          {dialog.notice}
        </p>
      )}
      <section className={styles.card}>
        <Tabs
          items={['LISTA DE MÉDICOS', 'NUEVO MÉDICO']}
          value="LISTA DE MÉDICOS"
          onChange={(value) => (value === 'NUEVO MÉDICO' ? dialog.create() : null)}
        />
        <form
          className={styles.filters}
          onSubmit={(event) => {
            event.preventDefault()
            setPage(1)
          }}
        >
          <TextField
            label="Buscar médico"
            icon={IconSearch}
            type="search"
            placeholder="Buscar por nombre, DPI o teléfono..."
            value={query}
            onChange={(event) => {
              setQuery(event.target.value)
              setPage(1)
            }}
          />
          <SelectField
            label="Especialidad"
            placeholder="Todas las especialidades"
            options={specialties}
            value={specialty}
            onChange={(event) => {
              setSpecialty(event.target.value)
              setPage(1)
            }}
          />
          <Button type="submit" size="sm">
            <IconSearch /> Aplicar filtros
          </Button>
          <Button
            type="button"
            size="sm"
            variant="ghost"
            onClick={() => {
              setQuery('')
              setSpecialty('')
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
                {['NOMBRE Y APELLIDO', 'DPI', 'ESPECIALIDAD', 'DIRECCIÓN', 'EMAIL', 'TELÉFONO', 'ESTADO', 'OPCIONES'].map(
                  (heading) => (
                    <th key={heading} scope="col">
                      {heading}
                    </th>
                  ),
                )}
              </tr>
            </thead>
            <tbody>
              {visible.map((doctor) => (
                <tr key={doctor.id}>
                  <td>
                    <div className={styles.person}>
                      <Avatar patient={doctor} />
                      <strong>{doctor.name}</strong>
                    </div>
                  </td>
                  <td>{doctor.dpi}</td>
                  <td>{doctor.specialty}</td>
                  <td>{doctor.address || '—'}</td>
                  <td>{doctor.email || '—'}</td>
                  <td>{doctor.phone}</td>
                  <td>
                    <Badge tone={doctor.status === 'Activo' ? 'green' : 'amber'}>{doctor.status}</Badge>
                  </td>
                  <td>
                    <div className={styles.actions}>
                      <button
                        type="button"
                        className={styles.iconButton}
                        aria-label={'Editar ' + doctor.name}
                        onClick={() => dialog.setEditing(doctor)}
                      >
                        <IconEdit />
                      </button>
                      <button
                        type="button"
                        className={styles.iconButton + ' ' + styles.danger}
                        aria-label={'Eliminar ' + doctor.name}
                        onClick={() => setRemove(doctor)}
                      >
                        <IconTrash />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!rows.length && <p className={styles.empty}>No se encontraron médicos con estos filtros.</p>}
        </div>
        <Pagination total={rows.length} page={page} onChange={setPage} size={7} noun="médicos" />
      </section>
      {dialog.open && <DoctorForm doctor={dialog.editing} onClose={dialog.close} onSaved={saveDoctor} />}
      <Modal open={!!remove} title="Eliminar médico" onClose={() => setRemove(null)}>
        <p>¿Eliminar a {remove?.name}? Esta acción solo afecta los datos de demostración.</p>
        <div className={styles.footer}>
          <Button variant="ghost" onClick={() => setRemove(null)}>
            Cancelar
          </Button>
          <Button
            onClick={() => {
              setDoctors((current) => current.filter((doctor) => doctor.id !== remove.id))
              setRemove(null)
              dialog.setNotice('Médico eliminado.')
            }}
          >
            Eliminar
          </Button>
        </div>
      </Modal>
    </div>
  )
}
