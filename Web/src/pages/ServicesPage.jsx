import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { PagePlaceholder } from '@/components/feedback/PagePlaceholder'

export function ServicesPage() {
  useDocumentTitle('Servicios')
  return <PagePlaceholder title="Servicios" />
}
