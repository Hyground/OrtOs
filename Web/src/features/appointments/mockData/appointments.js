export const dentists = ['Dra. Ana Morales', 'Dr. Carlos Pérez', 'Dra. Sofía Ramírez']
export const treatments = [
  'Ortodoncia - Fase 2',
  'Ortodoncia - Ajuste',
  'Limpieza dental',
  'Endodoncia',
  'Extracción',
  'Consulta general',
  'Radiografía',
  'Blanqueamiento',
]
export const appointmentSeed = Array.from({ length: 28 }, (_, i) => ({
  id: 'appointment-' + (i + 1),
  patientId: 'patient-' + ((i % 12) + 1),
  date: i < 8 ? '2026-08-31' : '2026-08-' + String(3 + (i % 25)).padStart(2, '0'),
  time:
    i < 8
      ? ['10:00', '10:30', '11:30', '12:30', '14:00', '15:00', '16:00', '17:30'][i]
      : String(9 + (i % 8)).padStart(2, '0') + ':00',
  duration: '60',
  dentist: dentists[i % 3],
  chair: 'Sillón ' + ((i % 3) + 1),
  treatment: treatments[i % 8],
  type: i % 2 ? 'Control / Revisión' : 'Tratamiento',
  priority: ['Media', 'Baja', 'Alta'][i % 3],
  reminder: '24',
  reason: 'Seguimiento de tratamiento',
  notes: '',
  status: i < 3 || (i >= 8 && i < 17) ? 'Completada' : i >= 23 ? 'Cancelada' : 'Pendiente',
}))
