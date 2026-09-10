export const concepts = ['Abono a tratamiento', 'Consulta general', 'Pago total', 'Radiografía']
export const paymentMethods = [
  'Efectivo',
  'Tarjeta de crédito',
  'Tarjeta de débito',
  'Transferencia bancaria',
  'Cheque',
]
export const paymentSeed = Array.from({ length: 128 }, (_, i) => ({
  id: 'payment-' + (i + 1),
  patientId: 'patient-' + ((i % 128) + 1),
  concept: ['Abono a tratamiento', 'Consulta general', 'Pago total', 'Radiografía'][i % 4],
  treatment: ['Ortodoncia - Fase 2', 'Consulta general', 'Limpieza dental', 'Radiografía'][i % 4],
  date: i < 8 ? '2026-08-' + String(31 - i).padStart(2, '0') : i < 36 ? '2026-08-15' : '2026-07-15',
  amount: i === 0 ? 500 : i === 7 ? 55015.54 : [500, 250, 800, 300, 450, 650, 500][i % 7],
  currency: 'GTQ',
  method: paymentMethods[i % 5],
  reference: i % 5 ? 'TRX-' + (38291 + i) : '',
  notes: '',
  receipt: true,
  receiptNumber: 'CP-2026-' + String(128 - i).padStart(6, '0'),
  status: i >= 8 && i < 36 ? 'Pendiente' : 'Completado',
}))
