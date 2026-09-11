import { useState } from 'react'
import { Modal } from '@/components/ui/Modal/Modal'
import { IconUpload } from '@/components/icons/icons'
import { Field, Section, FormFooter } from '@/features/clinical/components'
import { specialties } from '../mockData/doctors'
import styles from '@/features/clinical/Clinical.module.css'

const emptyDoctor = {
  names: '',
  surnames: '',
  dpi: '',
  specialty: 'General',
  address: '',
  phone: '',
  email: '',
  status: 'Activo',
  photo: '',
}

export function DoctorForm({ doctor, onClose, onSaved }) {
  const [values, setValues] = useState(doctor ?? emptyDoctor)
  const [errors, setErrors] = useState({})
  const [saving, setSaving] = useState(false)
  const [photoError, setPhotoError] = useState('')

  const form = {
    values,
    errors,
    saving,
    set: (name, value) => {
      setValues((current) => ({ ...current, [name]: value }))
      setErrors((current) => ({ ...current, [name]: '' }))
    },
  }

  const upload = (file) => {
    setPhotoError('')
    if (!file) return
    if (!['image/png', 'image/jpeg'].includes(file.type) || file.size > 2 * 1024 * 1024) {
      setPhotoError('Selecciona una imagen JPG o PNG de hasta 2 MB.')
      return
    }
    const reader = new FileReader()
    reader.onload = () => form.set('photo', reader.result)
    reader.onerror = () => setPhotoError('No se pudo leer la imagen.')
    reader.readAsDataURL(file)
  }

  const submit = (event) => {
    event.preventDefault()
    const nextErrors = {}
    if (!values.names.trim()) nextErrors.names = 'Ingresa los nombres.'
    if (!values.surnames.trim()) nextErrors.surnames = 'Ingresa los apellidos.'
    if (!values.dpi.trim()) nextErrors.dpi = 'Ingresa el DPI.'
    if (!values.specialty) nextErrors.specialty = 'Selecciona la especialidad.'
    if (!values.phone.trim()) nextErrors.phone = 'Ingresa el teléfono.'
    if (Object.keys(nextErrors).length) {
      setErrors(nextErrors)
      return
    }
    setSaving(true)
    window.setTimeout(() => {
      onSaved({
        ...values,
        id: values.id ?? 'doctor-' + crypto.randomUUID(),
        name: values.names.trim() + ' ' + values.surnames.trim(),
      })
      setSaving(false)
    }, 250)
  }

  const f = (name, label, props = {}) => <Field form={form} name={name} label={label} {...props} />

  return (
    <Modal open onClose={() => !saving && onClose()} title={doctor ? 'EDITAR MÉDICO' : 'NUEVO MÉDICO'} size="wide">
      <form className={styles.form} onSubmit={submit} noValidate aria-busy={saving}>
        <fieldset disabled={saving}>
          <div className={styles.formColumns}>
            <div>
              <Section title="DATOS PERSONALES">
                <div className={styles.cols2}>
                  {f('names', 'Nombres *', { required: true })}
                  {f('surnames', 'Apellidos *', { required: true })}
                </div>
                {f('dpi', 'DPI *', { required: true, inputMode: 'numeric' })}
                {f('specialty', 'Especialidad *', { options: specialties, required: true })}
                {doctor && f('status', 'Estado', { options: ['Activo', 'Inactivo'] })}
              </Section>
            </div>
            <div>
              <Section title="DATOS DE CONTACTO">
                {f('phone', 'Teléfono *', { type: 'tel', required: true })}
                {f('email', 'Email', { type: 'email' })}
                {f('address', 'Dirección')}
              </Section>
              <Section title="ARCHIVOS Y DOCUMENTOS">
                <label
                  className={styles.dropzone}
                  onDragOver={(event) => event.preventDefault()}
                  onDrop={(event) => {
                    event.preventDefault()
                    upload(event.dataTransfer.files[0])
                  }}
                >
                  {values.photo ? <img src={values.photo} alt="Vista previa del médico" /> : <IconUpload />}
                  <strong>Subir foto del médico</strong>
                  <span>Haga clic para subir o arrastrar y soltar foto</span>
                  <small>PNG, JPG (máx. 2MB)</small>
                  <input
                    type="file"
                    accept="image/png,image/jpeg"
                    aria-label="Foto del médico"
                    onChange={(event) => upload(event.target.files[0])}
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
        <FormFooter form={{ ...form, saving }} onClose={onClose} label="Guardar médico" />
      </form>
    </Modal>
  )
}
