import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { PagePlaceholder } from '@/components/feedback/PagePlaceholder'

export function BookAppointmentPage() {
  useDocumentTitle('Agendar cita')
  return <PagePlaceholder title="Agendar cita" />
}
