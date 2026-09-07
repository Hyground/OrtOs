import styles from './PageLoader.module.css'

export function PageLoader() {
  return (
    <div className={styles.root} role="status" aria-live="polite">
      <span className={styles.spinner} aria-hidden="true" />
      <span className={styles.label}>Cargando…</span>
    </div>
  )
}
