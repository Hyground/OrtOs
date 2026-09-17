import { Fragment, useState } from 'react'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import {
  IconClipboard,
  IconSearch,
  IconPlus,
  IconEdit,
  IconTrash,
  IconChevronRight,
} from '@/components/icons/icons'
import { Button } from '@/components/ui/Button/Button'
import { Modal } from '@/components/ui/Modal/Modal'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog/ConfirmDialog'
import { TextField } from '@/components/ui/TextField/TextField'
import { SelectField } from '@/components/ui/SelectField/SelectField'
import { money, normalize } from '@/features/clinical/mockStore'
import { StatusToggle } from '@/features/clinical/components'
import { readTreatments, saveTreatments } from './treatmentsData'
import {
  categoryKey,
  readTreatmentCategories,
  saveTreatmentCategories,
} from './treatmentCategoriesData'
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
  const [items, setItems] = useState(readTreatments)
  const [categories, setCategories] = useState(() => readTreatmentCategories(items))
  const [categoryOpen, setCategoryOpen] = useState(false)
  const [categoryDraft, setCategoryDraft] = useState('')
  const [editingCategory, setEditingCategory] = useState(null)
  const [categoryError, setCategoryError] = useState('')
  const [categoryFromTreatment, setCategoryFromTreatment] = useState(false)
  const [deletingCategory, setDeletingCategory] = useState(null)
  const [expandedId, setExpandedId] = useState(null)
  const [search, setSearch] = useState('')
  const [draft, setDraft] = useState(null)
  const [deleting, setDeleting] = useState(null)
  const [confirmingStatus, setConfirmingStatus] = useState(null)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const filtered = items.filter((item) => normalize(item.name).includes(normalize(search)))
  function openCategories(fromTreatment = false) {
    setCategoryFromTreatment(fromTreatment)
    setCategoryOpen(true)
    setCategoryDraft('')
    setEditingCategory(null)
    setCategoryError('')
  }

  function submitCategory(event) {
    event.preventDefault()
    const name = categoryDraft.trim().replace(/\s+/g, ' ')
    if (!name) {
      setCategoryError('Ingresa el nombre de la categoría.')
      return
    }
    if (
      categories.some(
        (category) => categoryKey(category) === categoryKey(name) && category !== editingCategory,
      )
    ) {
      setCategoryError('Ya existe una categoría con ese nombre.')
      return
    }

    const nextCategories = editingCategory
      ? categories.map((category) => (category === editingCategory ? name : category))
      : [...categories, name]
    const nextItems = editingCategory
      ? items.map((item) =>
          categoryKey(item.category) === categoryKey(editingCategory)
            ? { ...item, category: name }
            : item,
        )
      : items

    try {
      if (editingCategory) saveTreatments(nextItems)
      saveTreatmentCategories(nextCategories)
      setItems(nextItems)
      setCategories(nextCategories)
      setCategoryDraft('')
      setEditingCategory(null)
      setCategoryError('')
      setNotice(editingCategory ? 'Categoría actualizada.' : 'Categoría creada.')
      if (categoryFromTreatment && !editingCategory) {
        setDraft((current) => current ? { ...current, category: name } : current)
        setCategoryOpen(false)
        setCategoryFromTreatment(false)
      }
    } catch {
      if (editingCategory) {
        try {
          saveTreatments(items)
        } catch {
          /* Se conserva el error original. */
        }
      }
      setCategoryError('No se pudo guardar la categoría. Inténtalo de nuevo.')
    }
  }

  function deleteCategory(name) {
    if (items.some((item) => categoryKey(item.category) === categoryKey(name))) {
      setCategoryError('Esta categoría tiene tratamientos. Asígnales otra antes de eliminarla.')
      return
    }
    try {
      const next = categories.filter((category) => category !== name)
      saveTreatmentCategories(next)
      setCategories(next)
      setCategoryError('')
      setCategoryDraft('')
      setEditingCategory(null)
      setNotice('Categoría eliminada.')
      setDeletingCategory(null)
    } catch {
      setCategoryError('No se pudo eliminar la categoría. Inténtalo de nuevo.')
    }
  }

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
    const description = (draft.description ?? '').trim()
    const durationMin = Number(draft.durationMin)
    const price = Number(draft.price)
    const selectedCategory = categories.find(
      (category) => categoryKey(category) === categoryKey(draft.category),
    )
    if (!name) {
      setError('Ingresa el nombre del tratamiento.')
      return
    }
    if (items.some((item) => item.id !== draft.id && normalize(item.name) === normalize(name))) {
      setError('Ya existe un tratamiento con ese nombre.')
      return
    }
    if (!selectedCategory) {
      setError('Selecciona una categoría de la lista.')
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
      category: selectedCategory,
      durationMin,
      price,
      active: draft.active,
    }
    const next = draft.id
      ? items.map((item) => (item.id === draft.id ? entry : item))
      : [...items, entry]
    if (persist(next, draft.id ? 'Tratamiento actualizado.' : 'Tratamiento creado.')) setDraft(null)
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
          <Button variant="ghost" onClick={() => openCategories()}>
            Categorías
          </Button>
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
                <th scope="col">Estado</th>
                <th scope="col">Opciones</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((item, index) => {
                const expanded = expandedId === item.id
                const detailId = `treatment-details-${item.id}`
                return (
                  <Fragment key={item.id}>
                    <tr
                      className={expanded ? styles.activeRow : styles.clickableRow}
                      tabIndex={0}
                      aria-expanded={expanded}
                      aria-controls={detailId}
                      onClick={() => setExpandedId(expanded ? null : item.id)}
                      onKeyDown={(event) => {
                        if (event.target !== event.currentTarget) return
                        if (event.key !== 'Enter' && event.key !== ' ') return
                        event.preventDefault()
                        setExpandedId(expanded ? null : item.id)
                      }}
                    >
                      <td>{index + 1}</td>
                      <td>
                        <strong>{item.name}</strong>
                      </td>
                      <td>{item.category || '—'}</td>
                      <td>{item.durationMin} min</td>
                      <td>{money(item.price)}</td>
                      <td onClick={(event) => event.stopPropagation()}>
                        <StatusToggle
                          active={item.active}
                          label={`Cambiar estado de ${item.name}`}
                          onToggle={() => {
                            setError('')
                            setNotice('')
                            setConfirmingStatus(item)
                          }}
                        />
                      </td>
                      <td onClick={(event) => event.stopPropagation()}>
                        <button
                          type="button"
                          className={styles.optionButton}
                          aria-label={`Opciones de ${item.name}`}
                          aria-expanded={expanded}
                          aria-controls={detailId}
                          onClick={() => setExpandedId(expanded ? null : item.id)}
                        >
                          Opciones <IconChevronRight />
                        </button>
                      </td>
                    </tr>
                    {expanded && (
                      <tr className={styles.detailRow} id={detailId}>
                        <td colSpan={7}>
                          <div className={styles.drawer}>
                            <div
                              className={styles.drawerActions}
                              aria-label={`Acciones de ${item.name}`}
                            >
                              <button
                                type="button"
                                className={styles.actionCard}
                                onClick={() => openForm(item)}
                              >
                                <IconEdit />
                                <span>Editar</span>
                              </button>
                              <button
                                type="button"
                                className={[styles.actionCard, styles.deleteAction].join(' ')}
                                onClick={() => {
                                  setError('')
                                  setNotice('')
                                  setDeleting(item)
                                }}
                              >
                                <IconTrash />
                                <span>Eliminar</span>
                              </button>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </Fragment>
                )
              })}
              {!filtered.length && (
                <tr>
                  <td colSpan={7} className={styles.empty}>
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

            <div className={styles.formGrid}>
              <div className={styles.categoryField}>
                <SelectField
                  label="Categoría"
                  placeholder="Selecciona una categoría"
                  options={categories}
                  required
                  value={draft.category}
                  onChange={(event) => setDraft({ ...draft, category: event.target.value })}
                />
                <button
                  type="button"
                  className={styles.addCategoryButton}
                  aria-label="Crear categoría desde tratamiento"
                  onClick={() => openCategories(true)}
                >
                  <IconPlus />
                </button>              </div>
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
      <Modal
        open={categoryOpen}
        onClose={() => {
          setCategoryOpen(false)
          setCategoryFromTreatment(false)
        }}
        title={categoryFromTreatment ? 'Crear categoría' : 'Categorías de tratamientos'}
      >
        <div className={styles.categoryManager}>
          <form className={styles.categoryForm} onSubmit={submitCategory}>
            <TextField
              label="Nombre de categoría"
              maxLength={60}
              required
              value={categoryDraft}
              onChange={(event) => setCategoryDraft(event.target.value)}
            />
            <Button type="submit">{editingCategory ? 'Guardar cambios' : 'Crear categoría'}</Button>
            {editingCategory && (
              <Button
                variant="ghost"
                onClick={() => {
                  setEditingCategory(null)
                  setCategoryDraft('')
                  setCategoryError('')
                }}
              >
                Cancelar edición
              </Button>
            )}
          </form>
          {categoryError && (
            <p role="alert" className={styles.error}>
              {categoryError}
            </p>
          )}
          {!categoryFromTreatment && (
          <ul className={styles.categoryList}>
            {categories.map((category) => {
              const usageCount = items.filter(
                (item) => categoryKey(item.category) === categoryKey(category),
              ).length
              const used = usageCount > 0
              return (
                <li key={category}>
                  <span className={styles.categoryInfo}>
                    <strong>{category}</strong>
                    <small>
                      {usageCount} {usageCount === 1 ? 'tratamiento' : 'tratamientos'}
                    </small>
                  </span>
                  <div>
                    <button
                      type="button"
                      aria-label={`Renombrar ${category}`}
                      onClick={() => {
                        setEditingCategory(category)
                        setCategoryDraft(category)
                        setCategoryError('')
                      }}
                    >
                      <IconEdit />
                    </button>
                    <button
                      type="button"
                      aria-label={`Eliminar ${category}`}
                      title={used ? 'En uso por tratamientos' : 'Eliminar categoría'}
                      disabled={used}
                      onClick={() => {
                        setCategoryError('')
                        setDeletingCategory(category)
                      }}
                    >
                      <IconTrash />
                    </button>
                  </div>
                </li>
              )
            })}
          </ul>
          )}
        </div>
      </Modal>
      <ConfirmDialog
        open={!!deletingCategory}
        title="Eliminar categoría"
        message={`¿Estás seguro de eliminar ${deletingCategory}?`}
        confirmLabel="Eliminar"
        danger
        error={categoryError}
        onClose={() => setDeletingCategory(null)}
        onConfirm={() => deleteCategory(deletingCategory)}
      />
      <ConfirmDialog
        open={!!confirmingStatus}
        title={confirmingStatus?.active ? 'Desactivar tratamiento' : 'Activar tratamiento'}
        message={`¿Estás seguro de ${confirmingStatus?.active ? 'desactivar' : 'activar'} ${confirmingStatus?.name}?`}
        confirmLabel={confirmingStatus?.active ? 'Desactivar' : 'Activar'}
        danger={!!confirmingStatus?.active}
        error={error}
        onClose={() => setConfirmingStatus(null)}
        onConfirm={() => {
          if (persist(
            items.map((item) =>
              item.id === confirmingStatus.id ? { ...item, active: !item.active } : item
            ),
            `Tratamiento ${confirmingStatus.active ? 'desactivado' : 'activado'}.`,
          )) setConfirmingStatus(null)
        }}
      />
      <ConfirmDialog
        open={!!deleting}
        title="Eliminar tratamiento"
        message={`¿Estás seguro de eliminar ${deleting?.name}?`}
        confirmLabel="Eliminar"
        danger
        error={error}
        onClose={() => setDeleting(null)}
        onConfirm={() => {
          if (persist(
            items.filter((item) => item.id !== deleting.id),
            'Tratamiento eliminado.',
          )) setDeleting(null)
        }}
      />
    </section>
  )
}
