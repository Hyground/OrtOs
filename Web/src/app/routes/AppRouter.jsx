import { Route, Routes } from 'react-router-dom'
import { PublicLayout } from '@/components/layout/PublicLayout'
import { PrivateLayout } from '@/components/layout/PrivateLayout'
import { privateModules } from './navigation'
import {
  HomePage,
  ServicesPage,
  SpecialistsPage,
  BookAppointmentPage,
  DashboardPage,
  PrivateModulePage,
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
          {privateModules.map((module) => (
            <Route
              key={module.id}
              path={module.to}
              element={<PrivateModulePage module={module} />}
            />
          ))}
        </Route>
      </Route>
    </Routes>
  )
}
