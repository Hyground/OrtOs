import { Route, Routes } from 'react-router-dom'
import { PublicLayout } from '@/components/layout/PublicLayout'
import { PrivateLayout } from '@/components/layout/PrivateLayout'
import {
  HomePage,
  ServicesPage,
  SpecialistsPage,
  BookAppointmentPage,
  DashboardPage,
  NotFoundPage,
} from '@/pages'
import { ProtectedRoute } from './ProtectedRoute'
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

      <Route element={<ProtectedRoute />}>
        <Route element={<PrivateLayout />}>
          <Route path={paths.dashboard} element={<DashboardPage />} />
        </Route>
      </Route>
    </Routes>
  )
}
