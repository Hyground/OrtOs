import { useState } from 'react'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { IconClipboard, IconSearch, IconPlus, IconEdit, IconTrash } from '@/components/icons/icons'
import { Button } from '@/components/ui/Button/Button'
import { Modal } from '@/components/ui/Modal/Modal'
import { TextField } from '@/components/ui/TextField/TextField'
import { TextAreaField } from '@/components/ui/TextAreaField/TextAreaField'
import { money, normalize } from '@/features/clinical/mockStore'
import { useAppointments } from '@/features/appointments/hooks/useAppointments'
import { readTreatments, saveTreatments } from './treatmentsData'
import styles from './TreatmentsPage.module.css'

const emptyDraft = {
  name: '',
  description: '',
  category: '',
  durationMin: '30',
  price: '',
  active: true,
}

export function TreatmentsPage() {
  useDocumentTitle('Tratamientos')
  const appointments = useAppointments()
  const [items, setItems] = useState(readTreatments)
  const [search, setSearch] = useState('')
  const [draft, setDraft] = useState(null)
  const [deleting, setDeleting] = useState(null)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const filtered = items.filter((item) => normalize(item.name).includes(normalize(search)))
  const requestedCount = (name) =>
    appointments.filter((a) => normalize(a.treatment) === normalize(name)).length

  function openForm(item = emptyDraft) {
    setError('')
    setNotice('')
    setDraft({ ...item, durationMin: String(item.durationMin), price: String(item.price) })
  }

  function persist(next, message) {
    try {
      saveTreatments(next)
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
    const durationMin = Number(draft.durationMin)
    const price = Number(draft.price)
    if (!name) {
      setError('Ingresa el nombre del tratamiento.')
      return
    }
    if (items.some((item) => item.id !== draft.id && normalize(item.name) === normalize(name))) {
      setError('Ya existe un tratamiento con ese nombre.')
      return
    }
    if (!Number.isFinite(durationMin) || durationMin <= 0) {
      setError('Ingresa una duración válida en minutos.')
      return
    }
    if (!Number.isFinite(price) || price < 0) {
      setError('Ingresa un precio válido.')
      return
    }
    const entry = {
      id: draft.id ?? crypto.randomUUID(),
      name,
      description,
      category: draft.category.trim(),
      durationMin,
      price,
      active: draft.active,
    }
    const next = draft.id
      ? items.map((item) => (item.id === draft.id ? entry : item))
      : [...items, entry]
    if (persist(next, draft.id ? 'Tratamiento actualizado.' : 'Tratamiento creado.'))
      setDraft(null)
  }

  return (
    <section className={styles.page}>
      <header className={styles.banner}>
        <span className={styles.moduleIcon}>
          <IconClipboard />
        </span>
        <div>
          <h1>Tratamientos</h1>
          <p>Administra el catálogo de procedimientos, precios y duración de la clínica.</p>
        </div>
        <div className={styles.total}>
          <strong>{items.length}</strong>
          <span>Tratamientos registrados</span>
        </div>
      </header>

      <div className={styles.card}>
        <div className={styles.toolbar}>
          <TextField
            label="Buscar tratamiento"
            type="search"
            icon={IconSearch}
            placeholder="Buscar por nombre…"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
          <Button onClick={() => openForm()}>
            <IconPlus /> Nuevo tratamiento
          </Button>
          <span className={styles.count}>
            TOTAL: <strong>{items.length}</strong>
          </span>
        </div>
        <div className={styles.tableScroll}>
          <table className={styles.table} aria-label="Tratamientos registrados">
            <thead>
              <tr>
                <th scope="col">#</th>
                <th scope="col">Nombre</th>
                <th scope="col">Categoría</th>
                <th scope="col">Duración</th>
                <th scope="col">Precio</th>
                <th scope="col">Veces solicitado</th>
                <th scope="col">Estado</th>
                <th scope="col">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((item, index) => (
                <tr key={item.id} className={item.active ? '' : styles.inactive}>
                  <td>{index + 1}</td>
                  <td>
                    <strong>{item.name}</strong>
                  </td>
                  <td>{item.category || '—'}</td>
                  <td>{item.durationMin} min</td>
                  <td>{money(item.price)}</td>
                  <td>
                    <span className={styles.requested}>{requestedCount(item.name)}</span>
                  </td>
                  <td>{item.active ? 'Activo' : 'Inactivo'}</td>
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
                  <td colSpan={8} className={styles.empty}>
                    {items.length
                      ? 'No hay tratamientos que coincidan con la búsqueda.'
                      : 'Todavía no hay tratamientos. Agrega el primero con Nuevo tratamiento.'}
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
        title={draft?.id ? 'Editar tratamiento' : 'Nuevo tratamiento'}
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
              rows={3}
              maxLength={1500}
              value={draft.description}
              onChange={(event) => setDraft({ ...draft, description: event.target.value })}
            />
            <div className={styles.formGrid}>
              <TextField
                label="Categoría"
                maxLength={60}
                value={draft.category}
                onChange={(event) => setDraft({ ...draft, category: event.target.value })}
              />
              <TextField
                label="Duración (minutos)"
                type="number"
                min="5"
                step="5"
                required
                value={draft.durationMin}
                onChange={(event) => setDraft({ ...draft, durationMin: event.target.value })}
              />
              <TextField
                label="Precio (Q)"
                type="number"
                min="0"
                step="0.01"
                required
                value={draft.price}
                onChange={(event) => setDraft({ ...draft, price: event.target.value })}
              />
              <label className={styles.checkboxField}>
                <input
                  type="checkbox"
                  checked={draft.active}
                  onChange={(event) => setDraft({ ...draft, active: event.target.checked })}
                />
                Tratamiento activo
              </label>
            </div>
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
      <Modal open={!!deleting} onClose={() => setDeleting(null)} title="Eliminar tratamiento">
        <div className={styles.form}>
          <p>
            ¿Deseas eliminar el tratamiento <strong>{deleting?.name}</strong>?
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
                    'Tratamiento eliminado.',
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
