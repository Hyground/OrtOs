import { BrowserRouter } from 'react-router-dom'
import { AuthProvider } from '@/features/auth/context/AuthProvider'
import { AuthDialogProvider } from '@/features/auth/context/AuthDialogProvider'
import { LoginModal } from '@/features/auth/components/LoginModal'
import { ThemeProvider } from '@/features/appearance/ThemeProvider'

export function AppProviders({ children }) {
  return (
    <ThemeProvider><BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <AuthProvider>
        <AuthDialogProvider>
          {children}
          <LoginModal />
        </AuthDialogProvider>
      </AuthProvider>
    </BrowserRouter></ThemeProvider>
  )
}
