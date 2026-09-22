import { paths } from '@/app/routes/paths'
export const roleLabels = {
  admin: 'Administrador',
  odontologo: 'Odontólogo',
  asistente: 'Asistente',
  paciente: 'Paciente',
}
export function canAccess(user, path) {
  if (!user) return false
  if (path === paths.dashboard) return true
  if (user.role === 'admin') return true
  if (path === paths.store) return user.role === 'asistente'
  return (
    (user.role === 'odontologo' || user.role === 'asistente') &&
    [
      paths.patients,
      paths.appointments,
      paths.payments,
      paths.store,
      paths.specialties,
      paths.odontogram,
      paths.reports,
    ].includes(path)
  )
}
