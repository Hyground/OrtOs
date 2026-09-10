import { useId, useState } from 'react'
import { IconSearch, IconPlus } from '@/components/icons/icons'
import styles from './SearchSelect.module.css'
export function SearchSelect({ label = 'Paciente *', options, value, onChange, onAdd, error }) {
  const id = useId()
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState(0)
  const selected = options.find((o) => o.id === value)
  const filtered = options
    .filter((o) =>
      (o.name + ' ' + o.dpi + ' ' + o.folio)
        .toLocaleLowerCase()
        .includes(query.toLocaleLowerCase()),
    )
    .slice(0, 30)
  const choose = (o) => {
    onChange(o.id)
    setOpen(false)
    setQuery('')
  }
  return (
    <div
      className={styles.field}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget)) setOpen(false)
      }}
    >
      <label htmlFor={id}>{label}</label>
      <div className={styles.control}>
        <IconSearch />
        <input
          id={id}
          role="combobox"
          autoComplete="off"
          aria-autocomplete="list"
          aria-expanded={open}
          aria-controls={id + '-list'}
          aria-activedescendant={open && filtered[active] ? id + '-' + active : undefined}
          aria-invalid={!!error}
          aria-describedby={error ? id + '-error' : undefined}
          placeholder="Buscar por nombre o DPI..."
          onClick={() => {
            if (!open) {
              setOpen(true)
              setQuery('')
              setActive(0)
            }
          }}
          value={open ? query : (selected?.name ?? '')}
          onFocus={() => {
            setOpen(true)
            setQuery('')
            setActive(0)
          }}
          onChange={(e) => {
            setQuery(e.target.value)
            setActive(0)
            setOpen(true)
            onChange('')
          }}
          onKeyDown={(e) => {
            if (e.key === 'Escape') {
              e.stopPropagation()
              setOpen(false)
            }
            if (e.key === 'ArrowDown') {
              e.preventDefault()
              setOpen(true)
              setActive((n) => Math.min(n + 1, filtered.length - 1))
            }
            if (e.key === 'ArrowUp') {
              e.preventDefault()
              setActive((n) => Math.max(0, n - 1))
            }
            if (e.key === 'Enter' && open) {
              e.preventDefault()
              if (filtered[active]) choose(filtered[active])
            }
          }}
        />
        {onAdd && (
          <button type="button" aria-label="Agregar paciente" onClick={onAdd}>
            <IconPlus />
          </button>
        )}
      </div>
      {open && (
        <ul role="listbox" id={id + '-list'} className={styles.dropdown}>
          {filtered.map((o, i) => (
            <li
              role="option"
              aria-selected={o.id === value}
              id={id + '-' + i}
              key={o.id}
              className={active === i ? styles.active : ''}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => choose(o)}
            >
              {o.name}
              <small>
                {o.dpi} · {o.folio}
              </small>
            </li>
          ))}
          {!filtered.length && <li role="presentation">Sin pacientes encontrados</li>}
        </ul>
      )}
      {error && (
        <small id={id + '-error'} className={styles.error}>
          {error}
        </small>
      )}
    </div>
  )
}
