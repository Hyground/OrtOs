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
import { PatientsPage } from '@/features/patients/components/PatientsPage'
import { AppointmentsPage } from '@/features/appointments/components/AppointmentsPage'
import { PaymentsPage } from '@/features/payments/components/PaymentsPage'
import { UsersPage } from '@/features/users/components/UsersPage'
import { ModuleAccess } from './ModuleAccess'
import { PatientPortal } from '@/features/portal/PatientPortal'
import { MessagesPage } from '@/features/messages/MessagesPage'
import { SpecialtiesPage } from '@/features/specialties/SpecialtiesPage'
import { TreatmentsPage } from '@/features/treatments/TreatmentsPage'
import { CalendarPage } from '@/features/calendar/CalendarPage'
import { OdontogramPage } from '@/features/odontogram/OdontogramPage'
import { DoctorsPage } from '@/features/doctors/components/DoctorsPage'
import { AppointmentSummaryPage } from '@/features/reports/components/AppointmentSummaryPage'
import { AppointmentHistoryPage } from '@/features/appointmentHistory/components/AppointmentHistoryPage'

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
          <Route path={paths.dashboard} element={<PatientDashboard />} />
          {[paths.myAppointments, paths.myPayments, paths.myProfile, paths.myTreatment].map((path) => (
            <Route key={path} path={path} element={<PatientPortal />} />
          ))}
          <Route path={paths.messages} element={<MessagesPage />} />
          {privateModules.map((module) => (
            <Route
              key={module.id}
              path={module.to}
              element={
                <ModuleAccess path={module.to}>
                  {module.to === paths.patients ? (
                    <PatientsPage />
                  ) : module.to === paths.appointments ? (
                    <AppointmentsPage />
                  ) : module.to === paths.calendar ? (
                    <CalendarPage />
                  ) : module.to === paths.payments ? (
                    <PaymentsPage />
                  ) : module.to === paths.users ? (
                    <UsersPage />
                  ) : module.to === paths.specialties ? (
                    <SpecialtiesPage />
                  ) : module.to === paths.treatments ? (
                    <TreatmentsPage />
                  ) : module.to === paths.odontogram ? (
                    <OdontogramPage />
                  ) : module.to === paths.doctors ? (
                    <DoctorsPage />
                  ) : module.to === paths.summary ? (
                    <AppointmentSummaryPage />
                  ) : module.to === paths.appointmentHistory ? (
                    <AppointmentHistoryPage />
                  ) : (
                    <PrivateModulePage module={module} />
                  )}
                </ModuleAccess>
              }
            />
          ))}
        </Route>
      </Route>
    </Routes>
  )
}

function PatientDashboard() {
  return <DashboardPage />
}
