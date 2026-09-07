import { Container } from '@/components/layout/Container'
import styles from './PagePlaceholder.module.css'

export function PagePlaceholder({ title }) {
  return (
    <Container>
      <div className={styles.root}>
        <h1>{title}</h1>
        <p>Pendiente de diseño.</p>
      </div>
    </Container>
  )
}
