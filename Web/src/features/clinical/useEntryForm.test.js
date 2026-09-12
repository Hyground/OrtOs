import { describe, expect, it } from 'vitest'
import { validateEntry } from './useEntryForm'
import { saveRecord } from './mockStore'

const base = {
  patientId: 'patient-1',
  dentist: 'Dra. Ana Morales',
  treatment: 'Consulta general',
  duration: '60',
}

describe('validateEntry - appointments', () => {
  it('rechaza un formato de hora inválido', () => {
    const errors = validateEntry('appointments', { ...base, date: '2099-01-01', time: '25:99' })
    expect(errors.time).toMatch(/hora válida/)
  })

  it('rechaza horarios fuera de 07:00-21:00', () => {
    const errors = validateEntry('appointments', { ...base, date: '2099-01-01', time: '06:30' })
    expect(errors.time).toMatch(/07:00 a 21:00/)
  })

  it('rechaza una fecha/hora en el pasado', () => {
    const errors = validateEntry('appointments', { ...base, date: '2020-01-01', time: '10:00' })
    expect(errors.time).toMatch(/pasado/)
  })

  it('permite editar una cita que ya estaba en el pasado sin moverla', async () => {
    const record = await saveRecord('appointments', { ...base, date: '2020-01-01', time: '09:00' })
    const errors = validateEntry('appointments', {
      ...base,
      id: record.id,
      date: '2020-01-01',
      time: '09:00',
    })
    expect(errors.time).toBeUndefined()
  })

  it('rechaza traslapes con el mismo odontólogo en la misma fecha', async () => {
    const future = '2099-06-15'
    await saveRecord('appointments', { ...base, date: future, time: '10:00', duration: '60' })
    const errors = validateEntry('appointments', {
      ...base,
      date: future,
      time: '10:30',
      duration: '30',
    })
    expect(errors.time).toMatch(/Ya existe una cita/)
  })

  it('permite horarios consecutivos que no se traslapan', async () => {
    const future = '2099-06-16'
    await saveRecord('appointments', { ...base, date: future, time: '10:00', duration: '60' })
    const errors = validateEntry('appointments', {
      ...base,
      date: future,
      time: '11:00',
      duration: '30',
    })
    expect(errors.time).toBeUndefined()
  })

  it('no traslapa con un odontólogo distinto en el mismo horario', async () => {
    const future = '2099-06-18'
    await saveRecord('appointments', { ...base, date: future, time: '10:00', duration: '60' })
    const errors = validateEntry('appointments', {
      ...base,
      dentist: 'Dr. Carlos Pérez',
      date: future,
      time: '10:00',
      duration: '60',
    })
    expect(errors.time).toBeUndefined()
  })

  it('ignora la propia cita al editar para el chequeo de traslape', async () => {
    const future = '2099-06-17'
    const record = await saveRecord('appointments', {
      ...base,
      date: future,
      time: '09:00',
      duration: '60',
    })
    const errors = validateEntry('appointments', {
      ...base,
      id: record.id,
      date: future,
      time: '09:00',
      duration: '60',
    })
    expect(errors.time).toBeUndefined()
  })
})
