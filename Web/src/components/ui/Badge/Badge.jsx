import styles from './Badge.module.css'
export function Badge({ children, tone }) {
  const resolved =
    tone ??
    ({
      Activo: 'green',
      Completado: 'green',
      Completada: 'green',
      Baja: 'green',
      Media: 'amber',
      Alta: 'red',
      Pendiente: 'amber',
      Cancelada: 'red',
      Inactivo: 'gray',
    }[children] ||
      'blue')
  return <span className={styles.badge + ' ' + styles[resolved]}>{children}</span>
}
