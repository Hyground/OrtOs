import { Fragment, useEffect, useState } from 'react'
import { IconChevronRight, IconEdit, IconEye, IconMedical, IconTrash } from '@/components/icons/icons'
import { Button } from '@/components/ui/Button/Button'
import { Modal } from '@/components/ui/Modal/Modal'
import { TextField } from '@/components/ui/TextField/TextField'
import { SelectField } from '@/components/ui/SelectField/SelectField'
import { Avatar, Banner, CenterToast, StatusToggle } from '@/features/clinical/components'
import { useModuleDialogs } from '@/features/clinical/useModuleDialogs'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { useDoctors } from '../hooks/useDoctors'
import { DoctorForm } from './DoctorForm'
import { specialties } from '../mockData/doctors'
import { normalize } from '@/features/clinical/mockStore'
import styles from '@/features/clinical/Clinical.module.css'

export function DoctorsPage() {
  useDocumentTitle('Médicos')
  const dialog = useModuleDialogs()
  const initialDoctors = useDoctors()
  const [doctors, setDoctors] = useState(initialDoctors)
  const [remove, setRemove] = useState(null)
  const [viewing, setViewing] = useState(null)
  const [statusNotice, setStatusNotice] = useState(null)
  const [expandedId, setExpandedId] = useState('')
  const [query, setQuery] = useState('')
  const [specialty, setSpecialty] = useState('')
  const [status, setStatus] = useState('')
  const rows = doctors.filter(
    (doctor) =>
      normalize(`${doctor.name} ${doctor.dpi} ${doctor.specialty}`).includes(normalize(query)) &&
      (!specialty || doctor.specialty === specialty) &&
      (!status || doctor.status === status),
  )

  useEffect(() => {
    if (!statusNotice) return undefined
    const timer = setTimeout(() => setStatusNotice(null), 2200)
    return () => clearTimeout(timer)
  }, [statusNotice])

  useEffect(() => {
    if (rows.some((doctor) => doctor.id === expandedId)) return
    setExpandedId('')
  }, [expandedId, rows])

  const toggleDoctorStatus = (doctor) => {
    const nextStatus = doctor.status === 'Activo' ? 'Inactivo' : 'Activo'
    setDoctors((current) =>
      current.map((item) => (item.id === doctor.id ? { ...item, status: nextStatus } : item)),
    )
    setStatusNotice({ name: doctor.name, status: nextStatus })
  }
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
      <CenterToast notice={statusNotice} />
      <section className={styles.card}>
        <div className={styles.filters}>
          <TextField
            label="Buscar médico"
            type="search"
            placeholder="Buscar por nombre, DPI o especialidad..."
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
          <SelectField label="Especialidad" placeholder="Todas" options={specialties} value={specialty} onChange={(event) => setSpecialty(event.target.value)} />
          <SelectField label="Estado" placeholder="Todos los estados" options={['Activo', 'Inactivo']} value={status} onChange={(event) => setStatus(event.target.value)} />
          <Button type="button" size="sm" onClick={dialog.create}>
            + NUEVO MÉDICO
          </Button>
          <Button type="button" size="sm" variant="ghost" onClick={() => { setQuery(''); setSpecialty(''); setStatus('') }}>
            Limpiar
          </Button>
        </div>
        <div className={styles.tableContainerScroll}>
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
              {rows.map((doctor) => {
                const expanded = expandedId === doctor.id
                return (
                  <Fragment key={doctor.id}>
                    <tr
                      className={expanded ? styles.activeRow : styles.clickableRow}
                      tabIndex={0}
                      aria-expanded={expanded}
                      aria-controls={'doctor-actions-' + doctor.id}
                      onClick={() => setExpandedId(expanded ? '' : doctor.id)}
                      onKeyDown={(event) => {
                        if (event.key !== 'Enter' && event.key !== ' ') return
                        event.preventDefault()
                        setExpandedId(expanded ? '' : doctor.id)
                      }}
                    >
                      <td>
                        <div className={styles.personButton}>
                          <Avatar patient={doctor} />
                          <span>
                            <strong>{doctor.name}</strong>
                            <small>{doctor.specialty}</small>
                          </span>
                        </div>
                      </td>
                      <td>{doctor.dpi}</td>
                      <td>{doctor.specialty}</td>
                      <td>{doctor.address || '-'}</td>
                      <td>{doctor.email || '-'}</td>
                      <td>{doctor.phone}</td>
                      <td onClick={(event) => event.stopPropagation()}>
                        <StatusToggle
                          active={doctor.status === 'Activo'}
                          label={'Cambiar estado de ' + doctor.name + ' a ' + (doctor.status === 'Activo' ? 'Inactivo' : 'Activo')}
                          onToggle={() => toggleDoctorStatus(doctor)}
                        />
                      </td>
                      <td onClick={(event) => event.stopPropagation()}>
                        <button
                          type="button"
                          className={styles.optionButton}
                          aria-expanded={expanded}
                          aria-controls={'doctor-actions-' + doctor.id}
                          onClick={() => setExpandedId(expanded ? '' : doctor.id)}
                        >
                          Opciones
                          <IconChevronRight />
                        </button>
                      </td>
                    </tr>
                    {expanded && (
                      <tr className={styles.detailRow}>
                        <td colSpan={8}>
                          <div className={styles.patientDrawer} id={'doctor-actions-' + doctor.id}>
                            <div className={styles.drawerActions + ' ' + styles.doctorDrawerActions} aria-label={'Acciones de ' + doctor.name}>
                              <button
                                type="button"
                                className={styles.actionCard}
                                onClick={() => setViewing(doctor)}
                              >
                                <IconEye />
                                <span>Ver</span>
                              </button>
                              <button
                                type="button"
                                className={styles.actionCard + " " + styles.actionEdit}
                                onClick={() => dialog.setEditing(doctor)}
                              >
                                <IconEdit />
                                <span>Editar</span>
                              </button>
                              <button
                                type="button"
                                className={styles.actionCard + " " + styles.actionDanger}
                                onClick={() => setRemove(doctor)}
                              >
                                <IconTrash />
                                <span>Eliminar</span>
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
          {!rows.length && <p className={styles.empty}>No se encontraron médicos con estos filtros.</p>}
        </div>
      </section>
      {dialog.open && <DoctorForm doctor={dialog.editing} onClose={dialog.close} onSaved={saveDoctor} />}
      <Modal open={!!viewing} title="Detalle del médico" onClose={() => setViewing(null)} size="wide">
        <div className={styles.cardBody}>
          <div className={styles.patientCard}>
            <Avatar patient={viewing} />
            <div>
              <strong>{viewing?.name}</strong>
              <small>{viewing?.specialty}</small>
            </div>
          </div>
          <div className={styles.cols2}>
            <div className={styles.metricRow}>
              <span>DPI</span>
              <strong>{viewing?.dpi || '-'}</strong>
            </div>
            <div className={styles.metricRow}>
              <span>Estado</span>
              <strong>{viewing?.status || '-'}</strong>
            </div>
            <div className={styles.metricRow}>
              <span>Teléfono</span>
              <strong>{viewing?.phone || '-'}</strong>
            </div>
            <div className={styles.metricRow}>
              <span>Email</span>
              <strong>{viewing?.email || '-'}</strong>
            </div>
            <div className={styles.metricRow}>
              <span>Dirección</span>
              <strong>{viewing?.address || '-'}</strong>
            </div>
            <div className={styles.metricRow}>
              <span>Especialidad</span>
              <strong>{viewing?.specialty || '-'}</strong>
            </div>
          </div>
        </div>
      </Modal>
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
