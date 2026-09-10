import { render, screen, within, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { PaymentForm } from '@/features/payments/components/PaymentForm'
import { PatientForm } from '@/features/patients/components/PatientForm'
import { PatientsPage } from '@/features/patients/components/PatientsPage'
import { AppointmentsPage } from '@/features/appointments/components/AppointmentsPage'
import { PaymentsPage } from '@/features/payments/components/PaymentsPage'
import { validateEntry } from './useEntryForm'
import { saveRecord, getClinic } from './mockStore'
import { createRecordPDF } from '@/features/records/components/recordDocument'
const mount = (component) => render(<MemoryRouter>{component}</MemoryRouter>)
describe('Flujos clínicos', () => {
  it('autocompleta y reemplaza los datos al cambiar de paciente en pagos', async () => {
    const user = userEvent.setup()
    mount(
      <PaymentForm onClose={() => {}} onSaved={() => {}} onAdd={() => {}} onRecord={() => {}} />,
    )
    const search = screen.getByRole('combobox', { name: 'Paciente *' })
    await user.click(search)
    await user.type(search, '3170626701302')
    await user.click(screen.getByRole('option', { name: /María Fernanda/ }))
    expect(screen.getByLabelText('DPI')).toHaveValue('3170626701302')
    expect(screen.getByLabelText('Teléfono')).toHaveValue('5555-1234')
    expect(screen.getByLabelText('Expediente / Folio')).toHaveValue('EXP-2026-00128')
    await user.click(search)
    await user.type(search, '123456780101')
    await user.click(screen.getByRole('option', { name: /Juan Carlos/ }))
    expect(screen.getByLabelText('DPI')).toHaveValue('123456780101')
    expect(screen.getByLabelText('Teléfono')).toHaveValue('5555-5678')
    expect(screen.getByLabelText('Expediente / Folio')).toHaveValue('EXP-2026-004')
    await user.click(search)
    await user.type(search, 'nadie-encontrado')
    expect(screen.getByLabelText('DPI')).toHaveValue('')
    expect(screen.getByText('Sin pacientes encontrados')).toBeInTheDocument()
  })
  it('exige referencia en transferencias y rechaza montos inválidos', () => {
    const values = {
      patientId: 'patient-1',
      concept: 'Abono',
      date: '2026-09-10',
      amount: '-20',
      method: 'Transferencia bancaria',
      reference: '',
      currency: 'GTQ',
    }
    expect(validateEntry('payments', values)).toMatchObject({
      amount: expect.any(String),
      reference: expect.any(String),
    })
    expect(
      validateEntry('payments', { ...values, amount: '500.00', reference: 'TRX-38291' }),
    ).toEqual({})
  })
  it('guarda un paciente nuevo que queda disponible para otros módulos', async () => {
    const user = userEvent.setup()
    const saved = vi.fn()
    mount(<PatientForm onClose={() => {}} onSaved={saved} />)
    await user.type(screen.getByLabelText('Nombres *'), 'Paciente prueba')
    await user.type(screen.getByLabelText('Apellidos *'), 'Integración')
    fireEvent.change(screen.getByLabelText('Fecha de nacimiento *'), {
      target: { value: '1995-05-15' },
    })
    await user.type(screen.getByLabelText('Teléfono principal *'), '55551234')
    await user.click(screen.getByRole('button', { name: 'Guardar paciente' }))
    await waitFor(() => expect(saved).toHaveBeenCalledOnce())
    const record = saved.mock.calls[0][0]
    expect(getClinic().patients.find((p) => p.id === record.id).name).toBe(
      'Paciente prueba Integración',
    )
  })
  it('filtra la tabla y abre el expediente con dos páginas', async () => {
    const user = userEvent.setup()
    mount(<PatientsPage />)
    await user.type(screen.getByLabelText('Buscar paciente'), '3170626701302')
    expect(screen.getByText(/de 1 pacientes/)).toBeInTheDocument()
    await user.click(
      screen.getByRole('button', { name: 'Ver expediente de María Fernanda López García' }),
    )
    const modal = screen.getByRole('dialog', { name: 'EXPEDIENTE DEL PACIENTE - PDF' })
    expect(within(modal).getByText('Página 1 de 2')).toBeInTheDocument()
    await user.click(within(modal).getByRole('button', { name: 'Página siguiente del expediente' }))
    expect(within(modal).getByText('Página 2 de 2')).toBeInTheDocument()
  })
  it('cambia entre mes, semana y día y permite abrir una nueva cita', async () => {
    const user = userEvent.setup()
    mount(<AppointmentsPage />)
    await user.click(screen.getByRole('button', { name: 'Semana', exact: true }))
    expect(screen.getByRole('button', { name: 'Semana', exact: true })).toHaveAttribute(
      'aria-pressed',
      'true',
    )
    await user.click(screen.getByRole('button', { name: 'Día', exact: true }))
    expect(screen.getByText(/Agenda del/)).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: '+ Agendar cita' }))
    expect(screen.getByRole('dialog', { name: 'NUEVA CITA' })).toBeInTheDocument()
  })
  it('simula un error de guardado sin modificar los registros', async () => {
    const before = getClinic().payments.length
    await expect(
      saveRecord('payments', { patientId: 'patient-1' }, { fail: true }),
    ).rejects.toThrow('No se pudo guardar')
    expect(getClinic().payments).toHaveLength(before)
  })
  it('genera un archivo PDF real de dos páginas', async () => {
    const p = getClinic().patients.find((p) => p.id === 'patient-1')
    const pdf = await createRecordPDF(p, [])
    expect(pdf.getNumberOfPages()).toBe(2)
    expect(pdf.output()).toMatch(/^%PDF-/)
    expect(pdf.output()).toContain(p.folio)
  })
  it('filtra pagos pendientes y muestra el pago guardado desde el registro rápido', async () => {
    const user = userEvent.setup()
    mount(<PaymentsPage />)
    await user.click(screen.getByRole('tab', { name: 'PAGOS PENDIENTES' }))
    expect(screen.getAllByText('Pendiente').length).toBeGreaterThan(0)
    const quick = within(
      screen.getByRole('heading', { name: 'REGISTRO RÁPIDO DE PAGO' }).parentElement,
    )
    await user.selectOptions(quick.getByLabelText('Paciente *'), 'patient-1')
    await user.selectOptions(quick.getByLabelText('Concepto *'), 'Abono a tratamiento')
    await user.type(quick.getByLabelText('Monto * (Q)'), '123.45')
    await user.click(quick.getByRole('button', { name: 'Guardar pago' }))
    await waitFor(() =>
      expect(within(screen.getByRole('table')).getByText('Q 123.45')).toBeInTheDocument(),
    )
    expect(screen.getByRole('tab', { name: 'REGISTRO DE PAGOS' })).toHaveAttribute(
      'aria-selected',
      'true',
    )
  })
})
