import { useClinic } from '@/features/clinical/mockStore'
export function useAppointments() {
  return useClinic().appointments
}
