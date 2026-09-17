import { useRef, useState } from 'react'
import { Modal } from '@/components/ui/Modal/Modal'
import { TextField } from '@/components/ui/TextField/TextField'
import { IconUpload } from '@/components/icons/icons'
import { localDate } from '@/features/clinical/mockStore'
import { useEntryForm } from '@/features/clinical/useEntryForm'
import { Field, Section, FormFooter } from '@/features/clinical/components'
import { locations } from '../mockData/patients'
import styles from '@/features/clinical/Clinical.module.css'
const ALLERGY_OPTIONS = ['Penicilina', 'Aspirina', 'Anestesia local', 'Látex', 'Ninguna conocida']
const DISEASE_OPTIONS = [
  'Diabetes',
  'Hipertensión',
  'Enfermedades cardíacas',
  'Asma',
  'Ninguna conocida',
]
function ChecklistField({ label, options, value, onChange }) {
  const tokens = String(value ?? '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
  const known = tokens.filter((t) => options.includes(t))
  const [otroChecked, setOtroChecked] = useState(tokens.some((t) => !options.includes(t)))
  const [otroText, setOtroText] = useState(tokens.filter((t) => !options.includes(t)).join(', '))
  const emit = (nextKnown, nextOtroChecked, nextOtroText) => {
    const parts = [...nextKnown]
    if (nextOtroChecked && nextOtroText.trim()) parts.push(nextOtroText.trim())
    onChange(parts.join(', '))
  }
  const toggle = (option) => {
    const nextKnown = known.includes(option)
      ? known.filter((k) => k !== option)
      : [...known, option]
    emit(nextKnown, otroChecked, otroText)
  }
  return (
    <div className={styles.radios} role="group" aria-label={label}>
      <span>{label}</span>
      {options.map((option) => (
        <label key={option}>
          <input type="checkbox" checked={known.includes(option)} onChange={() => toggle(option)} />
          {option}
        </label>
      ))}
      <label>
        <input
          type="checkbox"
          checked={otroChecked}
          onChange={(e) => {
            setOtroChecked(e.target.checked)
            emit(known, e.target.checked, otroText)
          }}
        />
        Otra
      </label>
      {otroChecked && (
        <TextField
          label="Especifica"
          value={otroText}
          onChange={(e) => {
            setOtroText(e.target.value)
            emit(known, otroChecked, e.target.value)
          }}
        />
      )}
    </div>
  )
}
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
  const initialValuesRef = useRef(patient ?? initial)
  const [photoError, setPhotoError] = useState('')
  const [reading, setReading] = useState(false)
  const requestClose = () => {
    if (form.saving || reading) return
    const changed = JSON.stringify(form.values) !== JSON.stringify(initialValuesRef.current)
    if (changed && !window.confirm('¿Descartar los cambios sin guardar?')) return
    onClose()
  }
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
      const img = new Image()
      img.onload = () => {
        const scale = Math.min(1, 400 / img.width)
        const canvas = document.createElement('canvas')
        canvas.width = Math.round(img.width * scale)
        canvas.height = Math.round(img.height * scale)
        canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height)
        form.set('photo', canvas.toDataURL('image/jpeg', 0.8))
        setReading(false)
      }
      img.onerror = () => {
        setPhotoError('No se pudo leer la imagen.')
        setReading(false)
      }
      img.src = reader.result
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
      onClose={requestClose}
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
                {f('bloodGroup', 'Grupo sanguíneo', {
                  options: ['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-'],
                })}
                <ChecklistField
                  label="Alergias conocidas"
                  options={ALLERGY_OPTIONS}
                  value={form.values.allergies}
                  onChange={(value) => form.set('allergies', value)}
                />
                <ChecklistField
                  label="Enfermedades relevantes"
                  options={DISEASE_OPTIONS}
                  value={form.values.diseases}
                  onChange={(value) => form.set('diseases', value)}
                />
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
          onClose={requestClose}
          label="Guardar paciente"
        />
      </form>
    </Modal>
  )
}
