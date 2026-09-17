import { render, screen, within, waitFor, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { PaymentForm } from './components/PaymentForm'
import { PaymentsPage } from './components/PaymentsPage'
import { QuickPayment } from './components/QuickPayment'
import { QuickPatientSelect } from './components/QuickPatientSelect'
import { paymentSeed } from './mockData/payments'

const mount = (props = {}) =>
  render(
    <PaymentForm
      paymentPage
      onClose={vi.fn()}
      onSaved={vi.fn()}
      onAdd={vi.fn()}
      onRecord={vi.fn()}
      {...props}
    />,
  )

it('muestra los datos dentro del cuadro y los reemplaza al cambiar de paciente', async () => {
  const user = userEvent.setup()
  mount()
  const search = screen.getByRole('combobox', { name: 'Paciente *' })
  await user.click(search)
  await user.type(search, '3170626701302')
  await user.click(screen.getByRole('option', { name: /María Fernanda/ }))
  const card = screen.getByLabelText('Paciente seleccionado')
  expect(within(card).getByText('DPI: 3170626701302')).toBeInTheDocument()
  expect(within(card).getByText('Teléfono: 5555-1234')).toBeInTheDocument()
  expect(within(card).getByText('Expediente / Folio: EXP-2026-00128')).toBeInTheDocument()
  expect(screen.queryByLabelText('DPI')).not.toBeInTheDocument()
  await user.click(search)
  await user.type(search, '123456780101')
  await user.click(screen.getByRole('option', { name: /Juan Carlos/ }))
  expect(screen.getByText('DPI: 123456780101')).toBeInTheDocument()
  expect(screen.queryByText('DPI: 3170626701302')).not.toBeInTheDocument()
})

it('cierra un nuevo formulario vacío sin confirmar', async () => {
  const onClose = vi.fn()
  mount({ onClose })
  await userEvent.setup().click(screen.getByRole('button', { name: 'Cancelar' }))
  expect(onClose).toHaveBeenCalledOnce()
  expect(screen.queryByRole('dialog', { name: '¿Cerrar sin guardar?' })).not.toBeInTheDocument()
})

it('conserva el paciente y no reabre la búsqueda cuando el navegador devuelve el foco', async () => {
  const user = userEvent.setup()
  mount()
  const search = screen.getByRole('combobox', { name: 'Paciente *' })
  await user.click(search)
  await user.type(search, '3170626701302')
  await user.click(screen.getByRole('option', { name: /María Fernanda/ }))
  expect(search).toHaveValue('María Fernanda López García')
  fireEvent.blur(window)
  fireEvent.blur(search)
  fireEvent.focus(window)
  fireEvent.focus(search)
  expect(search).toHaveValue('María Fernanda López García')
  expect(search).toHaveAttribute('aria-expanded', 'false')
  expect(screen.queryByRole('listbox')).not.toBeInTheDocument()
  expect(screen.getByText('DPI: 3170626701302')).toBeInTheDocument()
  await user.click(search)
  expect(screen.getByRole('listbox')).toBeInTheDocument()
  await user.type(search, '123456780101')
  await user.click(screen.getByRole('option', { name: /Juan Carlos/ }))
  expect(screen.getByText('DPI: 123456780101')).toBeInTheDocument()
})

it.each(['Cancelar', 'Cerrar', 'Escape', 'Fondo'])(
  'confirma al cerrar con %s y conserva los datos al continuar',
  async (action) => {
    const user = userEvent.setup()
    const onClose = vi.fn()
    mount({ onClose })
    await user.type(screen.getByLabelText('Descripción / Notas'), 'Pago por registrar')
    if (action === 'Escape') await user.keyboard('{Escape}')
    else if (action === 'Fondo') await user.click(screen.getByRole('dialog').parentElement)
    else await user.click(screen.getByRole('button', { name: action, exact: true }))
    const confirmation = screen.getByRole('dialog', { name: '¿Cerrar sin guardar?' })
    expect(onClose).not.toHaveBeenCalled()
    await user.click(within(confirmation).getByRole('button', { name: 'Seguir editando' }))
    expect(screen.getByLabelText('Descripción / Notas')).toHaveValue('Pago por registrar')
    await user.click(screen.getByRole('button', { name: 'Cancelar' }))
    await user.click(screen.getByRole('button', { name: 'Cerrar sin guardar', exact: true }))
    expect(onClose).toHaveBeenCalledOnce()
  },
)

it('solo confirma el cierre de edición cuando hay cambios', async () => {
  const user = userEvent.setup()
  const onClose = vi.fn()
  mount({ payment: paymentSeed[0], onClose })
  await user.click(screen.getByRole('button', { name: 'Cancelar' }))
  expect(onClose).toHaveBeenCalledOnce()
  onClose.mockClear()
  await user.type(screen.getByLabelText('Descripción / Notas'), 'Cambio')
  await user.click(screen.getByRole('button', { name: 'Cancelar' }))
  expect(screen.getByRole('dialog', { name: '¿Cerrar sin guardar?' })).toBeInTheDocument()
  expect(onClose).not.toHaveBeenCalled()
  await user.click(screen.getByRole('button', { name: 'Seguir editando' }))
  await user.clear(screen.getByLabelText('Descripción / Notas'))
  await user.click(screen.getByRole('button', { name: 'Cancelar' }))
  expect(onClose).toHaveBeenCalledOnce()
})

it('conserva el formulario compartido usado fuera de Pagos', async () => {
  const onClose = vi.fn()
  mount({ paymentPage: false, onClose })
  expect(screen.getByLabelText('DPI')).toBeInTheDocument()
  await userEvent.setup().type(screen.getByLabelText('Descripción / Notas'), 'Nota')
  await userEvent.setup().click(screen.getByRole('button', { name: 'Cancelar' }))
  expect(onClose).toHaveBeenCalledOnce()
})

it('lista todos los pacientes en el registro rápido y permite buscarlos y elegir con teclado', async () => {
  const user = userEvent.setup()
  const options = Array.from({ length: 45 }, (_, i) => ({
    id: `p-${i}`,
    name: `Paciente ${i}`,
    dpi: `DPI-${i}`,
    folio: `EXP-${i}`,
  }))
  const onChange = vi.fn()
  render(<QuickPatientSelect options={options} value="" onChange={onChange} />)
  const search = screen.getByRole('combobox', { name: 'Paciente *' })
  await user.click(search)
  expect(screen.getAllByRole('option')).toHaveLength(45)
  await user.type(search, 'EXP-44')
  expect(screen.getAllByRole('option')).toHaveLength(1)
  await user.keyboard('{Enter}')
  expect(onChange).toHaveBeenLastCalledWith('p-44')
  expect(screen.queryByRole('listbox')).not.toBeInTheDocument()
})

it('busca y guarda un pago desde el registro rápido', async () => {
  const user = userEvent.setup()
  const onComplete = vi.fn()
  render(<QuickPayment onComplete={onComplete} onExpand={vi.fn()} />)
  await user.type(screen.getByRole('combobox', { name: 'Paciente *' }), '3170626701302')
  await user.click(screen.getByRole('option', { name: /María Fernanda/ }))
  await user.selectOptions(screen.getByLabelText('Concepto *'), 'Abono a tratamiento')
  await user.type(screen.getByLabelText('Monto * (Q)'), '123.45')
  await user.click(screen.getByRole('button', { name: 'Guardar pago' }))
  await waitFor(() => expect(onComplete).toHaveBeenCalledOnce())
  expect(onComplete.mock.calls[0][0]).toMatchObject({ patientId: 'patient-1', amount: 123.45 })
})

it('pagina los pagos de 25 en 25', async () => {
  const user = userEvent.setup()
  render(
    <MemoryRouter>
      <PaymentsPage />
    </MemoryRouter>,
  )
  await user.click(screen.getByRole('tab', { name: 'TODOS LOS PAGOS' }))
  expect(within(screen.getByRole('table')).getAllByRole('row')).toHaveLength(26)
  await user.click(screen.getByRole('button', { name: 'Página siguiente', exact: true }))
  expect(within(screen.getByRole('table')).getAllByRole('row').length).toBeLessThan(26)
  expect(screen.getByText(/26-\d+ de \d+ pagos/)).toBeInTheDocument()
})
