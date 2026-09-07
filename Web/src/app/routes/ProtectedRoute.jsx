import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { PageLoader } from '@/components/feedback/PageLoader'
import { paths } from './paths'

export function ProtectedRoute() {
  const { status } = useAuth()
  const location = useLocation()

  if (status === 'loading') return <PageLoader />

  if (status !== 'authenticated') {
    return <Navigate to={paths.login} state={{ from: location }} replace />
  }

  return <Outlet />
}
