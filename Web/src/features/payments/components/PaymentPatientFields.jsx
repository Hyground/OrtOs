import { Button } from '@/components/ui/Button/Button'
import { QuickPatientSelect } from './QuickPatientSelect'
import { Avatar, Section } from '@/features/clinical/components'
import { TextField } from '@/components/ui/TextField/TextField'
import { age, displayDate } from '@/features/clinical/mockStore'
import { usePatients } from '@/features/patients/hooks/usePatients'
import styles from '@/features/clinical/Clinical.module.css'

export function PaymentPatientFields({ form, onAdd, onRecord }) {
  const patients = usePatients()
  const patient = patients.find((p) => p.id === form.values.patientId)
  return (
    <Section title="INFORMACIÓN DEL PACIENTE">
      <QuickPatientSelect
        openOnFocus={false}
        optionLimit={30}
        options={patients}
        value={form.values.patientId}
        onChange={(value) => form.set('patientId', value)}
        onAdd={onAdd}
        error={form.errors.patientId}
      />
      {patient && (
        <>
          <div className={styles.patientCard} aria-label="Paciente seleccionado">
          <Avatar patient={patient} />
          <div>
            <strong>{patient.name}</strong>
            <small>
              {displayDate(patient.birthDate)} ({age(patient.birthDate)} años) · {patient.treatment}
            </small>
          </div>
          {onRecord && (
            <Button size="sm" variant="ghost" onClick={() => onRecord(patient)}>
              Ver expediente
            </Button>
          )}
          </div>
          <div className={styles.cols3}>
            <TextField label="DPI" readOnly value={patient.dpi || 'No registrado'} />
            <TextField label="Teléfono" type="tel" readOnly value={patient.phone || 'No registrado'} />
            <TextField label="Expediente / Folio" readOnly value={patient.folio || 'No registrado'} />
          </div>
        </>
      )}
    </Section>
  )
}
