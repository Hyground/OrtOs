import { useId, useState } from 'react'
import { IconEye, IconEyeOff } from '@/components/icons/icons'
import styles from './TextField.module.css'

export function TextField({ label, type = 'text', error, icon: Icon, prefix, ...rest }) {
  const id = useId()
  const errorId = `${id}-error`
  const [reveal, setReveal] = useState(false)
  const isPassword = type === 'password'
  const inputType = isPassword && reveal ? 'text' : type

  const inputClass = [
    styles.input,
    (Icon || prefix) && styles.hasIcon,
    isPassword && styles.hasReveal,
    error && styles.inputError,
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <div className={styles.field}>
      <label htmlFor={id} className={styles.label}>
        {label}
      </label>
      <div className={styles.control}>
        {Icon ? <Icon className={styles.icon} /> : null}
        {prefix && (
          <span className={styles.icon} aria-hidden="true">
            {prefix}
          </span>
        )}
        <input
          id={id}
          type={inputType}
          className={inputClass}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? errorId : undefined}
          {...rest}
        />
        {isPassword ? (
          <button
            type="button"
            className={styles.reveal}
            aria-label={reveal ? 'Ocultar contraseña' : 'Mostrar contraseña'}
            onClick={() => setReveal((value) => !value)}
          >
            {reveal ? <IconEyeOff /> : <IconEye />}
          </button>
        ) : null}
      </div>
      {error ? (
        <p id={errorId} className={styles.error}>
          {error}
        </p>
      ) : null}
    </div>
  )
}
