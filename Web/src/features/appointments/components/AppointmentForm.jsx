import { useRef, useState } from 'react'
import { IconEye } from '@/components/icons/icons'
import { Button } from '@/components/ui/Button/Button'
import { Modal } from '@/components/ui/Modal/Modal'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog/ConfirmDialog'
import { localDate, displayDate, getClinic } from '@/features/clinical/mockStore'
import { useEntryForm } from '@/features/clinical/useEntryForm'
import { Avatar, PatientFields, Field, Section, FormFooter } from '@/features/clinical/components'
import { Badge } from '@/components/ui/Badge/Badge'
import { usePatients } from '@/features/patients/hooks/usePatients'
import { useDoctors } from '@/features/doctors/hooks/useDoctors'
import { treatments } from '../mockData/appointments'
import styles from '@/features/clinical/Clinical.module.css'
import calendarStyles from './Calendar.module.css'
import { TimeField12h } from './TimeField12h'
import { PatientAccountModal } from '@/features/payments/components/PatientAccountModal'
export function AppointmentForm({
  appointment,
  date,
  initialPatientId = '',
  compactPatient = false,
  onClose,
  onSaved,
  onAdd,
  onRecord,
}) {
  const patients = usePatients()
  const dentists = useDoctors()
    .filter((d) => d.status === 'Activo')
    .map((d) => d.name)
  const isEditing = Boolean(appointment?.id)
  const initialAppointment = {
    patientId: initialPatientId,
    date: date ?? localDate(),
    time: '',
    duration: '60',
    dentist: '',
    chair: 'Sillón 2',
    treatment: '',
    type: 'Tratamiento',
    priority: '',
    reminder: '24',
    reason: '',
    notes: '',
    status: 'Pendiente',
    ...appointment,
  }
  const form = useEntryForm('appointments', initialAppointment, onSaved)
  const initialValuesRef = useRef(initialAppointment)
  const patient = patients.find((p) => p.id === form.values.patientId)
  const f = (name, label, props = {}) => <Field form={form} name={name} label={label} {...props} />
  const [confirmClose, setConfirmClose] = useState(false)
  const [accountOpen, setAccountOpen] = useState(false)
  const requestClose = () => {
    if (form.saving) return
    const changed = JSON.stringify(form.values) !== JSON.stringify(initialValuesRef.current)
    if (changed) setConfirmClose(true)
    else onClose()
  }
  const occupiedSlots =
    form.values.dentist && form.values.date
      ? getClinic()
          .appointments.filter(
            (a) =>
              a.date === form.values.date &&
              a.dentist === form.values.dentist &&
              a.id !== form.values.id,
          )
          .map((a) => {
            const [h, m] = a.time.split(':').map(Number)
            const endMinutes = h * 60 + m + (Number(a.duration) || 60)
            const end =
              String(Math.floor(endMinutes / 60)).padStart(2, '0') +
              ':' +
              String(endMinutes % 60).padStart(2, '0')
            return a.time + '–' + end
          })
          .sort()
      : []
  return (
    <Modal
      open
      size="wide"
      title={isEditing ? 'DETALLE / EDITAR CITA' : 'NUEVA CITA'}
      onClose={requestClose}
    >
      <form className={styles.form} onSubmit={form.submit} noValidate>
        <fieldset disabled={form.saving} className={styles.stack}>
          {compactPatient && patient ? (
            <section className={styles.quickPatient} aria-label="Paciente seleccionado">
              <Avatar patient={patient} variant="initials" />
              <div className={styles.quickPatientInfo}>
                <strong>{patient.name}</strong>
                <small>{patient.folio}</small>
              </div>
              {onRecord && (
                <Button size="sm" onClick={() => onRecord(patient)}>
                  <IconEye />
                  Ver expediente
                </Button>
              )}
            </section>
          ) : (
            <PatientFields
              form={form}
              onAdd={() => onAdd(form)}
              onRecord={onRecord}
              warnInactive
            />
          )}
          <Section title={compactPatient ? 'AGENDAR CITA' : 'DETALLES DE LA CITA'}>
            {isEditing && patient && <Button type="button" size="sm" onClick={() => setAccountOpen(true)}>Cuenta de la cita</Button>}
            <div className={styles.cols3}>
              {f('date', 'Fecha *', { type: 'date', required: true })}
              <TimeField12h
                label="Hora *"
                value={form.values.time}
                onChange={(value) => form.set('time', value)}
                error={form.errors.time}
              />
              {f('dentist', 'Odontólogo *', { options: dentists, required: true })}
            </div>
            {form.values.dentist && form.values.date && (
              <div className={calendarStyles.occupiedSlots}>
                <span>
                  Horarios ocupados de {form.values.dentist} el {displayDate(form.values.date)}:
                </span>
                {occupiedSlots.length ? (
                  <ul>
                    {occupiedSlots.map((slot) => (
                      <li key={slot}>{slot}</li>
                    ))}
                  </ul>
                ) : (
                  <span>Sin citas registradas este día.</span>
                )}
              </div>
            )}
            <div className={styles.cols3}>
              {f('treatment', 'Tratamiento *', {
                options: treatments,
                required: true,
              })}
              {f('duration', 'Duración', {
                options: ['30', '45', '60', '90'].map((v) => ({ value: v, label: v + ' minutos' })),
              })}
              {compactPatient ? (
                <div className={styles.quickPriority}>
                  {f('priority', 'Prioridad', {
                    className: styles['quickPrioritySelect' + form.values.priority],
                    options: ['Baja', 'Media', 'Alta'],
                    required: true,
                  })}
                </div>
              ) : (
                f('chair', 'Sillón / Consultorio', {
                  options: ['Sillón 1', 'Sillón 2', 'Sillón 3'],
                })
              )}
            </div>
            {compactPatient ? (
              f('reason', 'Motivo / Nota breve', { type: 'textarea' })
            ) : (
              <>
                <div className={styles.cols3}>
                  {f('type', 'Tipo de cita', {
                    options: ['Primera consulta', 'Tratamiento', 'Control / Revisión', 'Urgencia'],
                  })}
                  <div>
                    {f('priority', 'Prioridad', {
                      options: ['Baja', 'Media', 'Alta'],
                      required: true,
                    })}
                    {form.values.priority && <Badge>{form.values.priority}</Badge>}
                  </div>
                  {f('reminder', 'Recordatorio', {
                    options: ['1', '12', '24', '48'].map((v) => ({
                      value: v,
                      label: v + ' horas antes',
                    })),
                  })}
                </div>
                {f('reason', 'Motivo / Detalle', { type: 'textarea' })}
              </>
            )}
            {isEditing &&
              f('status', 'Estado', { options: ['Pendiente', 'Completada', 'Cancelada'] })}
          </Section>
          {!compactPatient && (
            <Section title="NOTAS (OPCIONAL)">
              {f('notes', 'Notas adicionales', { type: 'textarea' })}
            </Section>
          )}
        </fieldset>
        <FormFooter form={form} onClose={requestClose} label="Guardar Cita" />
      </form>
      <ConfirmDialog
        open={confirmClose}
        title="¿Cerrar sin guardar?"
        message="¿Estás seguro de cerrar sin guardar?"
        confirmLabel="Cerrar sin guardar"
        cancelLabel="Seguir editando"
        danger
        onClose={() => setConfirmClose(false)}
        onConfirm={onClose}
      />
      {accountOpen && <PatientAccountModal patient={patient} appointment={appointment} onClose={() => setAccountOpen(false)} />}
    </Modal>
  )
}


