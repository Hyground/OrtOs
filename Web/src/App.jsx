import { AppProviders } from '@/app/providers/AppProviders'
import { AppRouter } from '@/app/routes/AppRouter'

export default function App() {
  return (
    <AppProviders>
      <AppRouter />
    </AppProviders>
  )
}
