import { IconEye } from '@/components/icons/icons'
import { Button } from '@/components/ui/Button/Button'
import { Modal } from '@/components/ui/Modal/Modal'
import { localDate } from '@/features/clinical/mockStore'
import { useEntryForm } from '@/features/clinical/useEntryForm'
import { Avatar, PatientFields, Field, Section, FormFooter } from '@/features/clinical/components'
import { Badge } from '@/components/ui/Badge/Badge'
import { usePatients } from '@/features/patients/hooks/usePatients'
import { dentists, treatments } from '../mockData/appointments'
import styles from '@/features/clinical/Clinical.module.css'
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
  const patient = patients.find((p) => p.id === form.values.patientId)
  const f = (name, label, props = {}) => <Field form={form} name={name} label={label} {...props} />
  return (
    <Modal
      open
      size="wide"
      title={isEditing ? 'DETALLE / EDITAR CITA' : 'NUEVA CITA'}
      onClose={() => {
        if (!form.saving) onClose()
      }}
    >
      <form className={styles.form} onSubmit={form.submit} noValidate>
        <fieldset disabled={form.saving} className={styles.stack}>
          {compactPatient && patient ? (
            <section className={styles.quickPatient} aria-label="Paciente seleccionado">
              <Avatar patient={patient} />
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
            <PatientFields form={form} onAdd={() => onAdd(form)} onRecord={onRecord} />
          )}
          <Section title={compactPatient ? 'AGENDAR CITA' : 'DETALLES DE LA CITA'}>
            <div className={styles.cols3}>
              {f('date', 'Fecha *', { type: 'date', required: true })}
              {f('time', 'Hora *', { type: 'time', required: true })}
              {f('dentist', 'Odontólogo *', { options: dentists, required: true })}
            </div>
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
        <FormFooter form={form} onClose={onClose} label="Guardar Cita" />
      </form>
    </Modal>
  )
}


