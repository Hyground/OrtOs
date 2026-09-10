import { useClinic } from '@/features/clinical/mockStore'
export function usePayments() {
  return useClinic().payments
}
