import { useEffect } from 'react'
import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { useAuthDialog } from '@/features/auth/hooks/useAuthDialog'
import { PageLoader } from '@/components/feedback/PageLoader'
import { paths } from './paths'

export function ProtectedRoute() {
  const { status } = useAuth()
  const { open } = useAuthDialog()

  useEffect(() => {
    if (status === 'unauthenticated') open()
  }, [status, open])

  if (status === 'loading') return <PageLoader />

  if (status !== 'authenticated') {
    return <Navigate to={paths.home} replace />
  }

  return <Outlet />
}
