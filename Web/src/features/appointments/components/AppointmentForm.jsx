import { Modal } from '@/components/ui/Modal/Modal'
import { localDate } from '@/features/clinical/mockStore'
import { useEntryForm } from '@/features/clinical/useEntryForm'
import { PatientFields, Field, Section, FormFooter } from '@/features/clinical/components'
import { Badge } from '@/components/ui/Badge/Badge'
import { dentists, treatments } from '../mockData/appointments'
import styles from '@/features/clinical/Clinical.module.css'
export function AppointmentForm({ appointment, date, onClose, onSaved, onAdd, onRecord }) {
  const form = useEntryForm(
    'appointments',
    appointment ?? {
      patientId: '',
      date: date ?? localDate(),
      time: '',
      duration: '60',
      dentist: '',
      chair: 'Sillón 2',
      treatment: '',
      type: 'Tratamiento',
      priority: 'Media',
      reminder: '24',
      reason: '',
      notes: '',
      status: 'Pendiente',
    },
    onSaved,
  )
  const f = (name, label, props = {}) => <Field form={form} name={name} label={label} {...props} />
  return (
    <Modal
      open
      size="wide"
      title={appointment ? 'DETALLE / EDITAR CITA' : 'NUEVA CITA'}
      onClose={() => {
        if (!form.saving) onClose()
      }}
    >
      <form className={styles.form} onSubmit={form.submit} noValidate>
        <fieldset disabled={form.saving} className={styles.stack}>
          <PatientFields form={form} onAdd={() => onAdd(form)} onRecord={onRecord} />
          <Section title="DETALLES DE LA CITA">
            <div className={styles.cols3}>
              {f('date', 'Fecha *', { type: 'date', required: true })}
              {f('time', 'Hora *', { type: 'time', required: true })}
              {f('duration', 'Duración', {
                options: ['30', '45', '60', '90'].map((v) => ({ value: v, label: v + ' minutos' })),
              })}
            </div>
            <div className={styles.cols2}>
              {f('dentist', 'Odontólogo *', { options: dentists, required: true })}
              {f('chair', 'Sillón / Consultorio', {
                options: ['Sillón 1', 'Sillón 2', 'Sillón 3'],
              })}
            </div>
          </Section>
          <Section title="INFORMACIÓN CLÍNICA">
            <div className={styles.cols2}>
              {f('treatment', 'Tratamiento / Procedimiento *', {
                options: treatments,
                required: true,
              })}
              {f('reason', 'Motivo / Detalle', { type: 'textarea' })}
            </div>
            <div className={styles.cols3}>
              {f('type', 'Tipo de cita', {
                options: ['Primera consulta', 'Tratamiento', 'Control / Revisión', 'Urgencia'],
              })}
              <div>
                {f('priority', 'Prioridad', { options: ['Baja', 'Media', 'Alta'] })}
                <Badge>{form.values.priority}</Badge>
              </div>
              {f('reminder', 'Recordatorio', {
                options: ['1', '12', '24', '48'].map((v) => ({
                  value: v,
                  label: v + ' horas antes',
                })),
              })}
            </div>
            {appointment &&
              f('status', 'Estado', { options: ['Pendiente', 'Completada', 'Cancelada'] })}
          </Section>
          <Section title="NOTAS (OPCIONAL)">
            {f('notes', 'Notas adicionales', { type: 'textarea' })}
          </Section>
        </fieldset>
        <FormFooter form={form} onClose={onClose} label="Guardar Cita" />
      </form>
    </Modal>
  )
}
