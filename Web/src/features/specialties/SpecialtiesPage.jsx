import { useState } from 'react'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { IconServices, IconSearch, IconPlus, IconEdit, IconTrash } from '@/components/icons/icons'
import { Button } from '@/components/ui/Button/Button'
import { Modal } from '@/components/ui/Modal/Modal'
import { TextField } from '@/components/ui/TextField/TextField'
import { TextAreaField } from '@/components/ui/TextAreaField/TextAreaField'
import { normalizeName, readSpecialties, saveSpecialties } from './specialtiesData'
import styles from './SpecialtiesPage.module.css'

export function SpecialtiesPage() {
  useDocumentTitle('Especialidades')
  const [items, setItems] = useState(readSpecialties)
  const [search, setSearch] = useState('')
  const [draft, setDraft] = useState(null)
  const [deleting, setDeleting] = useState(null)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const filtered = items.filter((item) => normalizeName(item.name).includes(normalizeName(search)))

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
    const entry = { id: draft.id ?? crypto.randomUUID(), name, description }
    const next = draft.id
      ? items.map((item) => (item.id === draft.id ? entry : item))
      : [...items, entry]
    if (persist(next, draft.id ? 'Especialidad actualizada.' : 'Especialidad creada.'))
      setDraft(null)
  }

  return (
    <section className={styles.page}>
      <header className={styles.banner}>
        <span className={styles.moduleIcon}>
          <IconServices />
        </span>
        <div>
          <h1>Especialidades</h1>
          <p>Administra las áreas odontológicas de la clínica.</p>
        </div>
        <div className={styles.total}>
          <strong>{items.length}</strong>
          <span>Especialidades registradas</span>
        </div>
      </header>

      <div className={styles.card}>
        <div className={styles.toolbar}>
          <TextField
            label="Buscar especialidad"
            type="search"
            icon={IconSearch}
            placeholder="Buscar por nombre…"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
          <Button onClick={() => openForm()}>
            <IconPlus /> Nueva especialidad
          </Button>
          <span className={styles.count}>
            TOTAL: <strong>{items.length}</strong>
          </span>
        </div>
        <div className={styles.tableScroll}>
          <table className={styles.table} aria-label="Especialidades registradas">
            <thead>
              <tr>
                <th scope="col">#</th>
                <th scope="col">Nombre</th>
                <th scope="col">Descripción</th>
                <th scope="col">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((item, index) => (
                <tr key={item.id}>
                  <td>{index + 1}</td>
                  <td>
                    <strong>{item.name}</strong>
                  </td>
                  <td className={styles.description}>{item.description}</td>
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
              {!filtered.length && (
                <tr>
                  <td colSpan={4} className={styles.empty}>
                    {items.length
                      ? 'No hay especialidades que coincidan con la búsqueda.'
                      : 'Todavía no hay especialidades. Agrega la primera con Nueva especialidad.'}
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
      <Modal open={!!deleting} onClose={() => setDeleting(null)} title="Eliminar especialidad">
        <div className={styles.form}>
          <p>
            ¿Deseas eliminar la especialidad <strong>{deleting?.name}</strong>?
          </p>
          {error && (
            <p role="alert" className={styles.error}>
              {error}
            </p>
          )}
          <div className={styles.formActions}>
            <Button variant="ghost" onClick={() => setDeleting(null)}>
              Cancelar
            </Button>
            <Button
              className={styles.delete}
              onClick={() => {
                if (
                  persist(
                    items.filter((item) => item.id !== deleting.id),
                    'Especialidad eliminada.',
                  )
                )
                  setDeleting(null)
              }}
            >
              Eliminar
            </Button>
          </div>
        </div>
      </Modal>
    </section>
  )
}
