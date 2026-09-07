import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { PageLoader } from '@/components/feedback/PageLoader'
import { paths } from './paths'

export function GuestRoute() {
  const { status } = useAuth()

  if (status === 'loading') return <PageLoader />

  if (status === 'authenticated') {
    return <Navigate to={paths.dashboard} replace />
  }

  return <Outlet />
}
