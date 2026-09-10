import { localDate } from '@/features/clinical/mockStore'
export const initialPayment = () => ({
  patientId: '',
  concept: '',
  treatment: '',
  date: localDate(),
  amount: '',
  currency: 'GTQ',
  method: 'Efectivo',
  reference: '',
  notes: '',
  receipt: true,
  status: 'Completado',
})
