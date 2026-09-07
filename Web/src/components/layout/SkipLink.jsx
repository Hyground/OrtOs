import styles from './SkipLink.module.css'

export const MAIN_ID = 'contenido'

export function SkipLink() {
  return (
    <a href={`#${MAIN_ID}`} className={styles.link}>
      Saltar al contenido
    </a>
  )
}
