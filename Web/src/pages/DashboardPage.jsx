import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { PagePlaceholder } from '@/components/feedback/PagePlaceholder'

export function DashboardPage() {
  useDocumentTitle('Panel')
  return <PagePlaceholder title="Panel" />
}
