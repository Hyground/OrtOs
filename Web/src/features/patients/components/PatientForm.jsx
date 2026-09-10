import { useState } from 'react'
import { Modal } from '@/components/ui/Modal/Modal'
import { IconUpload } from '@/components/icons/icons'
import { localDate } from '@/features/clinical/mockStore'
import { useEntryForm } from '@/features/clinical/useEntryForm'
import { Field, Section, FormFooter } from '@/features/clinical/components'
import { locations } from '../mockData/patients'
import styles from '@/features/clinical/Clinical.module.css'
const initial = {
  names: '',
  surnames: '',
  dpi: '',
  birthDate: '',
  gender: 'Femenino',
  maritalStatus: 'Soltero/a',
  occupation: '',
  phone: '',
  secondaryPhone: '',
  email: '',
  address: '',
  department: 'Huehuetenango',
  municipality: '',
  reference: '',
  bloodGroup: '',
  allergies: '',
  diseases: '',
  medications: false,
  smoker: false,
  notes: '',
  photo: '',
  status: 'Activo',
  treatment: 'Sin tratamiento activo',
  balance: 0,
  createdAt: localDate(),
}
export function PatientForm({ patient, onClose, onSaved }) {
  const form = useEntryForm('patients', patient ?? initial, onSaved)
  const [photoError, setPhotoError] = useState('')
  const [reading, setReading] = useState(false)
  const upload = async (file) => {
    setPhotoError('')
    if (!file) return
    if (!['image/png', 'image/jpeg'].includes(file.type) || file.size > 2 * 1024 * 1024) {
      setPhotoError('Selecciona una imagen JPG o PNG de hasta 2 MB.')
      return
    }
    setReading(true)
    const reader = new FileReader()
    reader.onload = () => {
      form.set('photo', reader.result)
      setReading(false)
    }
    reader.onerror = () => {
      setPhotoError('No se pudo leer la imagen.')
      setReading(false)
    }
    reader.readAsDataURL(file)
  }
  const f = (name, label, props = {}) => <Field form={form} name={name} label={label} {...props} />
  return (
    <Modal
      open
      onClose={() => {
        if (!form.saving && !reading) onClose()
      }}
      title={patient ? 'EDITAR PACIENTE' : 'NUEVO PACIENTE'}
      size="wide"
    >
      <form className={styles.form} onSubmit={form.submit} noValidate aria-busy={form.saving}>
        <fieldset disabled={form.saving || reading}>
          <div className={styles.formColumns}>
            <div>
              <Section title="DATOS PERSONALES">
                <div className={styles.cols2}>
                  {f('names', 'Nombres *', { required: true })}
                  {f('surnames', 'Apellidos *', { required: true })}
                </div>
                <div className={styles.cols2}>
                  {f('dpi', 'DPI', { inputMode: 'numeric', maxLength: 13 })}
                  {f('birthDate', 'Fecha de nacimiento *', {
                    type: 'date',
                    max: localDate(),
                    required: true,
                  })}
                </div>
                <div className={styles.cols2}>
                  {f('gender', 'Género', { options: ['Femenino', 'Masculino', 'Otro'] })}
                  {f('maritalStatus', 'Estado civil', {
                    options: ['Soltero/a', 'Casado/a', 'Divorciado/a', 'Viudo/a', 'Unión Libre'],
                  })}
                </div>
                {f('occupation', 'Ocupación')}
                {patient && f('status', 'Estado', { options: ['Activo', 'Inactivo'] })}
              </Section>
              <Section title="DATOS DE CONTACTO">
                <div className={styles.cols2}>
                  {f('phone', 'Teléfono principal *', {
                    type: 'tel',
                    placeholder: '5555-1234',
                    required: true,
                  })}
                  {f('secondaryPhone', 'Teléfono secundario', { type: 'tel' })}
                </div>
                {f('email', 'Correo electrónico', { type: 'email' })}
                {f('address', 'Dirección')}
                <div className={styles.cols3}>
                  {f('department', 'Departamento', {
                    options: Object.keys(locations),
                    onChange: (e) => {
                      form.set('department', e.target.value)
                      form.set('municipality', '')
                    },
                  })}
                  {f('municipality', 'Municipio', {
                    options: locations[form.values.department] ?? [],
                  })}
                  {f('reference', 'Referencia')}
                </div>
              </Section>
            </div>
            <div>
              <Section title="INFORMACIÓN MÉDICA BÁSICA">
                <div className={styles.cols2}>
                  {f('bloodGroup', 'Grupo sanguíneo', {
                    options: ['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-'],
                  })}
                  {f('allergies', 'Alergias conocidas')}
                </div>
                {f('diseases', 'Enfermedades relevantes')}
                {[
                  ['medications', '¿Toma medicamentos?'],
                  ['smoker', '¿Fuma?'],
                ].map(([key, label]) => (
                  <div className={styles.radios} key={key} role="group" aria-label={label}>
                    <span>{label}</span>
                    {[true, false].map((value) => (
                      <label key={String(value)}>
                        <input
                          type="radio"
                          name={key}
                          checked={form.values[key] === value}
                          onChange={() => form.set(key, value)}
                        />
                        {value ? 'Sí' : 'No'}
                      </label>
                    ))}
                  </div>
                ))}
                {f('notes', 'Notas adicionales', { type: 'textarea' })}
              </Section>
              <Section title="ARCHIVOS Y DOCUMENTOS">
                <label
                  className={styles.dropzone}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => {
                    e.preventDefault()
                    if (!form.saving && !reading) upload(e.dataTransfer.files[0])
                  }}
                >
                  {form.values.photo ? (
                    <img src={form.values.photo} alt="Vista previa del paciente" />
                  ) : (
                    <IconUpload />
                  )}
                  <strong>{reading ? 'Cargando foto…' : 'Subir foto'}</strong>
                  <span>Foto del paciente</span>
                  <small>PNG, JPG (máx. 2MB)</small>
                  <input
                    type="file"
                    accept="image/png,image/jpeg"
                    aria-label="Foto del paciente"
                    onChange={(e) => upload(e.target.files[0])}
                  />
                </label>
                {photoError && (
                  <p role="alert" className={styles.error}>
                    {photoError}
                  </p>
                )}
              </Section>
            </div>
          </div>
        </fieldset>
        <FormFooter
          form={{ ...form, saving: form.saving || reading }}
          onClose={onClose}
          label="Guardar paciente"
        />
      </form>
    </Modal>
  )
}
