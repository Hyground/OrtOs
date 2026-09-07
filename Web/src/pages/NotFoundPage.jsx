import { Link } from 'react-router-dom'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { Container } from '@/components/layout/Container'
import { paths } from '@/app/routes/paths'
import styles from './NotFoundPage.module.css'

export function NotFoundPage() {
  useDocumentTitle('Página no encontrada')

  return (
    <Container>
      <div className={styles.root}>
        <h1>404</h1>
        <p>La página que buscás no existe.</p>
        <Link to={paths.home}>Volver al inicio</Link>
      </div>
    </Container>
  )
}
