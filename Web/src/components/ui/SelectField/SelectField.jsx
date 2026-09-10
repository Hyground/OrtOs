import { useId } from 'react'
import styles from './SelectField.module.css'
export function SelectField({ label, options = [], placeholder = 'Seleccionar', error, ...props }) {
  const id = useId()
  return (
    <div className={styles.field}>
      <label htmlFor={id}>{label}</label>
      <select
        id={id}
        aria-invalid={!!error}
        aria-describedby={error ? id + '-error' : undefined}
        {...props}
      >
        <option value="">{placeholder}</option>
        {options.map((o) => (
          <option key={o.value ?? o} value={o.value ?? o}>
            {o.label ?? o}
          </option>
        ))}
      </select>
      {error && (
        <small id={id + '-error'} role="alert">
          {error}
        </small>
      )}
    </div>
  )
}
