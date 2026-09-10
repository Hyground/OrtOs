import styles from './Switch.module.css'
export function Switch({ label, checked, onChange, ...props }) {
  return (
    <label className={styles.label}>
      <input
        type="checkbox"
        role="switch"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        {...props}
      />
      <span className={styles.track} />
      <span>{label}</span>
    </label>
  )
}
