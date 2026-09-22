import { useState } from 'react'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { IconServices, IconPlus, IconEdit, IconTrash } from '@/components/icons/icons'
import { Button } from '@/components/ui/Button/Button'
import { Modal } from '@/components/ui/Modal/Modal'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog/ConfirmDialog'
import { TextField } from '@/components/ui/TextField/TextField'
import { TextAreaField } from '@/components/ui/TextAreaField/TextAreaField'
import { StatusToggle } from '@/features/clinical/components'
import { normalizeName, readSpecialties, saveSpecialties } from './specialtiesData'
import styles from './SpecialtiesPage.module.css'

export function SpecialtiesPage() {
  useDocumentTitle('Especialidades')
  const [items, setItems] = useState(readSpecialties)
  const [draft, setDraft] = useState(null)
  const [deleting, setDeleting] = useState(null)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')

  function openForm(item = { name: '', description: '' }) {
    setError('')
    setNotice('')
    setDraft({ ...item })
  }

  function persist(next, message) {
    try {
      saveSpecialties(next)
      setItems(next)
      setNotice(message)
      setError('')
      return true
    } catch {
      setError(
        'No se pudo guardar en el navegador. Revisa el almacenamiento disponible e inténtalo de nuevo.',
      )
      return false
    }
  }

  function toggleStatus(item) {
    const nextStatus = item.status === 'Inactivo' ? 'Activo' : 'Inactivo'
    const next = items.map((entry) => (entry.id === item.id ? { ...entry, status: nextStatus } : entry))
    persist(next, `Estado de ${item.name} actualizado.`)
  }

  function submit(event) {
    event.preventDefault()
    const name = draft.name.trim()
    const description = draft.description.trim()
    if (!name || !description) {
      setError('Completa el nombre y la descripción.')
      return
    }
    if (
      items.some((item) => item.id !== draft.id && normalizeName(item.name) === normalizeName(name))
    ) {
      setError('Ya existe una especialidad con ese nombre.')
      return
    }
    const entry = { id: draft.id ?? crypto.randomUUID(), name, description, status: draft.status ?? 'Activo' }
    const next = draft.id
      ? items.map((item) => (item.id === draft.id ? entry : item))
      : [...items, entry]
    if (persist(next, draft.id ? 'Especialidad actualizada.' : 'Especialidad creada.'))
      setDraft(null)
  }

  return (
    <section className={styles.page}>
      <div className={styles.headerRow}>
        <header className={styles.banner}>
          <span className={styles.moduleIcon}>
            <IconServices />
          </span>
          <div className={styles.bannerText}>
            <h1>Especialidades</h1>
            <p>Administra las áreas odontológicas de la clínica.</p>
          </div>
          <div className={styles.total}>
            <strong>{items.length}</strong>
            <span>Especialidades registradas</span>
          </div>
        </header>

        <Button size="sm" onClick={() => openForm()}>
          <IconPlus /> Nueva especialidad
        </Button>
      </div>

      <div className={styles.card}>
        <div className={styles.tableScroll}>
          <table className={styles.table} aria-label="Especialidades registradas">
            <thead>
              <tr>
                <th scope="col">#</th>
                <th scope="col">Nombre</th>
                <th scope="col">Descripción</th>
                <th scope="col">Visibilidad</th>
                <th scope="col">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, index) => (
                <tr key={item.id}>
                  <td>{index + 1}</td>
                  <td>
                    <strong>{item.name}</strong>
                  </td>
                  <td className={styles.description}>{item.description}</td>
                  <td>
                    <StatusToggle
                      active={item.status !== 'Inactivo'}
                      onLabel="Público"
                      offLabel="Privado"
                      label={`Cambiar visibilidad de ${item.name} a ${item.status === 'Inactivo' ? 'Público' : 'Privado'}`}
                      onToggle={() => toggleStatus(item)}
                    />
                  </td>
                  <td>
                    <div className={styles.actions}>
                      <button
                        type="button"
                        className={styles.edit}
                        aria-label={`Editar ${item.name}`}
                        title="Editar"
                        onClick={() => openForm(item)}
                      >
                        <IconEdit />
                      </button>
                      <button
                        type="button"
                        className={styles.delete}
                        aria-label={`Eliminar ${item.name}`}
                        title="Eliminar"
                        onClick={() => {
                          setError('')
                          setNotice('')
                          setDeleting(item)
                        }}
                      >
                        <IconTrash />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {!items.length && (
                <tr>
                  <td colSpan={5} className={styles.empty}>
                    Todavía no hay especialidades. Agrega la primera con Nueva especialidad.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      {notice && (
        <p role="status" className={styles.notice}>
          {notice}
        </p>
      )}

      <Modal
        open={!!draft}
        onClose={() => setDraft(null)}
        title={draft?.id ? 'Editar especialidad' : 'Nueva especialidad'}
      >
        {draft && (
          <form className={styles.form} onSubmit={submit}>
            <TextField
              label="Nombre"
              required
              maxLength={100}
              value={draft.name}
              onChange={(event) => setDraft({ ...draft, name: event.target.value })}
            />
            <TextAreaField
              label="Descripción"
              required
              rows={4}
              maxLength={1500}
              value={draft.description}
              onChange={(event) => setDraft({ ...draft, description: event.target.value })}
            />
            {error && (
              <p role="alert" className={styles.error}>
                {error}
              </p>
            )}
            <div className={styles.formActions}>
              <Button variant="ghost" onClick={() => setDraft(null)}>
                Cancelar
              </Button>
              <Button type="submit">Guardar</Button>
            </div>
          </form>
        )}
      </Modal>
      <ConfirmDialog
        open={!!deleting}
        title="Eliminar especialidad"
        message={`¿Estás seguro de eliminar ${deleting?.name}?`}
        confirmLabel="Eliminar"
        danger
        error={error}
        onClose={() => setDeleting(null)}
        onConfirm={() => {
          if (persist(
            items.filter((item) => item.id !== deleting.id),
            'Especialidad eliminada.',
          )) setDeleting(null)
        }}
      />
    </section>
  )
}
