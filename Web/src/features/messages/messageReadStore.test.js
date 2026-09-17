import { beforeEach, expect, it } from 'vitest'
import { incomingMessages, markConversationRead } from './messageReadStore'

beforeEach(() => localStorage.clear())

it('cuenta solo mensajes recibidos del usuario correspondiente', () => {
  const messages = [
    { id: 'clinic-1', patientId: 'patient-1', from: 'clinic' },
    { id: 'patient-1', patientId: 'patient-1', from: 'patient' },
    { id: 'clinic-2', patientId: 'patient-2', from: 'clinic' },
  ]

  expect(incomingMessages(messages, { role: 'paciente', patientId: 'patient-1' }).map((message) => message.id)).toEqual(['clinic-1'])
  expect(incomingMessages(messages, { role: 'admin' }).map((message) => message.id)).toEqual(['patient-1'])
})

it('guarda la lectura por usuario y por conversación', () => {
  const messages = [
    { id: 'a', patientId: 'patient-1', from: 'patient' },
    { id: 'b', patientId: 'patient-2', from: 'patient' },
    { id: 'c', patientId: 'patient-1', from: 'clinic' },
  ]
  markConversationRead({ id: 'admin-1', role: 'admin' }, 'patient-1', messages)

  expect(JSON.parse(localStorage.getItem('ortos.messages.read.admin-1'))).toEqual(['a'])
  expect(localStorage.getItem('ortos.messages.read.admin-2')).toBeNull()
})