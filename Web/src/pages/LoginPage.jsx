import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { PagePlaceholder } from '@/components/feedback/PagePlaceholder'

export function LoginPage() {
  useDocumentTitle('Iniciar sesión')
  return <PagePlaceholder title="Iniciar sesión" />
}
