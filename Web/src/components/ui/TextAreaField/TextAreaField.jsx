import { useId } from 'react'
import styles from './TextAreaField.module.css'
export function TextAreaField({ label, error, ...props }) {
  const id = useId()
  return (
    <div className={styles.field}>
      <label htmlFor={id}>{label}</label>
      <textarea
        id={id}
        rows={3}
        aria-invalid={!!error}
        aria-describedby={error ? id + '-error' : undefined}
        {...props}
      />
      {error && <small id={id + '-error'}>{error}</small>}
    </div>
  )
}
