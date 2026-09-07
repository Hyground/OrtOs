import { Link } from 'react-router-dom'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { paths } from '@/app/routes/paths'

export function NotFoundPage() {
  useDocumentTitle('Página no encontrada')

  return (
    <section>
      <h1>404</h1>
      <p>La página que buscás no existe.</p>
      <Link to={paths.home}>Volver al inicio</Link>
    </section>
  )
}
