import { expect, it } from 'vitest'
import { notificationsFor } from './notificationData'

it('separa los avisos de citas y pagos de los mensajes', () => {
  const clinic = {
    patients: [{ id: 'patient-1', name: 'Paciente Uno' }],
    appointments: [{
      id: 'appointment-1',
      patientId: 'patient-1',
      date: '2099-01-01',
      time: '10:00',
      treatment: 'Control',
      status: 'Pendiente',
    }],
    payments: [{
      id: 'payment-1',
      patientId: 'patient-1',
      date: '2099-01-01',
      concept: 'Control',
      amount: 100,
      currency: 'GTQ',
      status: 'Pendiente',
    }],
  }

  const items = notificationsFor(clinic, { id: 'patient-1', role: 'paciente', patientId: 'patient-1' })
  expect(items.map((item) => item.kind)).toEqual(['citas', 'pagos'])
  expect(items.every((item) => !item.id.startsWith('message-'))).toBe(true)
})