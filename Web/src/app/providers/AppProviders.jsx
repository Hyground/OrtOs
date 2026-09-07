import { BrowserRouter } from 'react-router-dom'
import { AuthProvider } from '@/features/auth/context/AuthProvider'
import { AuthDialogProvider } from '@/features/auth/context/AuthDialogProvider'
import { LoginModal } from '@/features/auth/components/LoginModal'

export function AppProviders({ children }) {
  return (
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <AuthProvider>
        <AuthDialogProvider>
          {children}
          <LoginModal />
        </AuthDialogProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}
