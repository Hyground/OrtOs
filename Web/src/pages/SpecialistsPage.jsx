import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { PagePlaceholder } from '@/components/feedback/PagePlaceholder'

export function SpecialistsPage() {
  useDocumentTitle('Especialistas')
  return <PagePlaceholder title="Especialistas" />
}
