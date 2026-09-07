import { Route, Routes } from 'react-router-dom'
import { PublicLayout } from '@/components/layout/PublicLayout'
import { MinimalLayout } from '@/components/layout/MinimalLayout'
import { PrivateLayout } from '@/components/layout/PrivateLayout'
import {
  HomePage,
  ServicesPage,
  SpecialistsPage,
  BookAppointmentPage,
  LoginPage,
  DashboardPage,
  NotFoundPage,
} from '@/pages'
import { ProtectedRoute } from './ProtectedRoute'
import { GuestRoute } from './GuestRoute'
import { paths } from './paths'

export function AppRouter() {
  return (
    <Routes>
      <Route element={<PublicLayout />}>
        <Route path={paths.home} element={<HomePage />} />
        <Route path={paths.services} element={<ServicesPage />} />
        <Route path={paths.specialists} element={<SpecialistsPage />} />
        <Route path={paths.bookAppointment} element={<BookAppointmentPage />} />
        <Route path={paths.notFound} element={<NotFoundPage />} />
      </Route>

      <Route element={<GuestRoute />}>
        <Route element={<MinimalLayout />}>
          <Route path={paths.login} element={<LoginPage />} />
        </Route>
      </Route>

      <Route element={<ProtectedRoute />}>
        <Route element={<PrivateLayout />}>
          <Route path={paths.dashboard} element={<DashboardPage />} />
        </Route>
      </Route>
    </Routes>
  )
}
