import { Route, Routes } from 'react-router-dom'
import { PublicLayout } from '@/components/layout/PublicLayout'
import { PrivateLayout } from '@/components/layout/PrivateLayout'
import { LandingPage } from '@/features/landing/pages/LandingPage'
import { ServicesPage } from '@/features/services/pages/ServicesPage'
import { BookAppointmentPage } from '@/features/appointments/pages/BookAppointmentPage'
import { LoginPage } from '@/features/auth/pages/LoginPage'
import { DashboardPage } from '@/features/dashboard/pages/DashboardPage'
import { NotFoundPage } from '@/pages/NotFoundPage'
import { ProtectedRoute } from './ProtectedRoute'
import { GuestRoute } from './GuestRoute'
import { paths } from './paths'

export function AppRouter() {
  return (
    <Routes>
      <Route element={<PublicLayout />}>
        <Route path={paths.home} element={<LandingPage />} />
        <Route path={paths.services} element={<ServicesPage />} />
        <Route path={paths.bookAppointment} element={<BookAppointmentPage />} />
      </Route>

      <Route element={<GuestRoute />}>
        <Route path={paths.login} element={<LoginPage />} />
      </Route>

      <Route element={<ProtectedRoute />}>
        <Route element={<PrivateLayout />}>
          <Route path={paths.dashboard} element={<DashboardPage />} />
        </Route>
      </Route>

      <Route path={paths.notFound} element={<NotFoundPage />} />
    </Routes>
  )
}
