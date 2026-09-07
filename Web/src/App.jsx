import { ErrorBoundary } from '@/app/ErrorBoundary'
import { AppProviders } from '@/app/providers/AppProviders'
import { AppRouter } from '@/app/routes/AppRouter'

export default function App() {
  return (
    <ErrorBoundary>
      <AppProviders>
        <AppRouter />
      </AppProviders>
    </ErrorBoundary>
  )
}
