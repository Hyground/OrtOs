import { useClinic } from '@/features/clinical/mockStore'
export function usePatients() {
  return useClinic().patients
}
