import { BrowserRouter } from 'react-router-dom'
import { AuthProvider } from '@/features/auth/context/AuthProvider'

export function AppProviders({ children }) {
  return (
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <AuthProvider>{children}</AuthProvider>
    </BrowserRouter>
  )
}
