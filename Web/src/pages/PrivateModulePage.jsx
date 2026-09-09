import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import styles from './PrivateModulePage.module.css'

export function PrivateModulePage({ module }) {
  useDocumentTitle(module.title)
  const Icon = module.Icon

  return (
    <section className={styles.page}>
      <span className={styles.icon}>
        <Icon />
      </span>
      <div>
        <span className={styles.kicker}>Modulo en preparacion</span>
        <h1>{module.title}</h1>
        <p>{module.description}</p>
      </div>
    </section>
  )
}
