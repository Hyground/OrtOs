import { render, screen, within, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AppointmentHistoryPage } from './components/AppointmentHistoryPage'
import { appointmentSeed } from '@/features/appointments/mockData/appointments'
import { displayDate } from '@/features/clinical/mockStore'

const dataRows = () => within(screen.getByRole('table')).getAllByRole('row').slice(1)
const cells = (row) => within(row).getAllByRole('cell')

it.each(['Desde', 'Hasta (opcional)'])(
  'cierra el calendario con Enter tras escribir una fecha válida en %s',
  async (label) => {
    const user = userEvent.setup()
    render(<AppointmentHistoryPage />)
    const input = screen.getByLabelText(label)
    await user.click(
      screen.getByRole('button', { name: `Seleccionar fecha de ${label}`, exact: true }),
    )
    await user.keyboard('31082026{Enter}')
    expect(input).toHaveValue('31/08/2026')
    expect(screen.queryByRole('group', { name: `Calendario de ${label}` })).not.toBeInTheDocument()
    expect(input).toHaveFocus()
    if (label === 'Desde') expect(dataRows()).toHaveLength(8)
  },
)

it('no confirma una fecha inválida con Enter', async () => {
  const user = userEvent.setup()
  render(<AppointmentHistoryPage />)
  await user.click(screen.getByRole('button', { name: 'Seleccionar fecha de Desde', exact: true }))
  await user.keyboard('31022026{Enter}')
  expect(screen.getByRole('group', { name: 'Calendario de Desde' })).toBeInTheDocument()
  expect(screen.getByLabelText('Desde')).toHaveAttribute('aria-invalid', 'true')
  expect(screen.getByText('1-25 de 28 citas')).toBeInTheDocument()
})

it.each(['Desde', 'Hasta (opcional)'])(
  'agrega separadores al escribir o pegar en %s sin cambiar el diseño',
  async (label) => {
    const user = userEvent.setup()
    render(<AppointmentHistoryPage />)
    const input = screen.getByLabelText(label)
    await user.type(input, '31082026')
    expect(input).toHaveValue('31/08/2026')
    expect(input).not.toHaveAttribute('aria-invalid', 'true')
    await user.keyboard('{Backspace}')
    expect(input).toHaveValue('31/08/202')
    await user.keyboard('6')
    expect(input).toHaveValue('31/08/2026')
    await user.clear(input)
    await user.paste('12082026')
    expect(input).toHaveValue('12/08/2026')
    await user.clear(input)
    await user.type(input, '1545444654')
    expect(input).toHaveValue('15/45/4446')
    expect(input).toHaveAttribute('aria-invalid', 'true')
  },
)

it.each(['Desde', 'Hasta (opcional)'])(
  'abre el calendario en el espacio en blanco de %s y conserva la edición manual',
  async (label) => {
    const user = userEvent.setup()
    render(<AppointmentHistoryPage />)
    const input = screen.getByLabelText(label)
    await user.click(input)
    expect(screen.queryByRole('group', { name: `Calendario de ${label}` })).not.toBeInTheDocument()
    fireEvent.change(input, { target: { value: '31/08/2026' } })
    await user.click(
      screen.getByRole('button', { name: `Seleccionar fecha de ${label}`, exact: true }),
    )
    expect(screen.getByRole('group', { name: `Calendario de ${label}` })).toBeInTheDocument()
    expect(input).toHaveFocus()
    expect(input.selectionStart).toBe(0)
    expect(input.selectionEnd).toBe(10)
    await user.keyboard('12/08/2026')
    expect(input).toHaveValue('12/08/2026')
    expect(screen.getByRole('group', { name: `Calendario de ${label}` })).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: '15/08/2026', exact: true }))
    expect(input).toHaveValue('15/08/2026')
    expect(screen.queryByRole('group', { name: `Calendario de ${label}` })).not.toBeInTheDocument()
  },
)

it('muestra los contadores correctos, elimina las columnas financieras y conserva la hora', () => {
  render(<AppointmentHistoryPage />)
  for (const [label, count] of [
    ['Total de citas', 28],
    ['Completadas', 12],
    ['Pendientes', 11],
  ]) {
    expect(screen.getByText(label).parentElement).toHaveTextContent(String(count))
  }
  expect(screen.queryByRole('columnheader', { name: 'COSTO' })).not.toBeInTheDocument()
  expect(screen.queryByRole('columnheader', { name: 'PAGADO' })).not.toBeInTheDocument()
  const sorted = [...appointmentSeed].sort(
    (a, b) => b.date.localeCompare(a.date) || b.time.localeCompare(a.time),
  )
  dataRows().forEach((row, i) => {
    expect(cells(row)[4]).toHaveTextContent(displayDate(sorted[i].date))
    expect(cells(row)[5]).toHaveTextContent(sorted[i].time)
  })
})

it('muestra 25 citas por página y permite pasar a las siguientes', async () => {
  render(<AppointmentHistoryPage />)
  expect(dataRows()).toHaveLength(25)
  await userEvent.setup().click(screen.getByRole('button', { name: 'Página siguiente' }))
  expect(dataRows()).toHaveLength(3)
  expect(screen.getByText('26-28 de 28 citas')).toBeInTheDocument()
})

it('filtra un día y un rango inclusivo y limpia todos los filtros', async () => {
  const user = userEvent.setup()
  render(<AppointmentHistoryPage />)
  expect(screen.queryByLabelText('Buscar por fecha')).not.toBeInTheDocument()
  fireEvent.change(screen.getByLabelText('Desde'), { target: { value: '31/08/2026' } })
  expect(dataRows()).toHaveLength(8)
  fireEvent.change(screen.getByLabelText('Desde'), { target: { value: '11/08/2026' } })
  fireEvent.change(screen.getByLabelText('Hasta (opcional)'), { target: { value: '12/08/2026' } })
  expect(dataRows()).toHaveLength(2)
  expect(cells(dataRows()[0])[4]).toHaveTextContent(displayDate('2026-08-12'))
  expect(cells(dataRows()[1])[4]).toHaveTextContent(displayDate('2026-08-11'))
  fireEvent.change(screen.getByLabelText('Hasta (opcional)'), { target: { value: '' } })
  expect(dataRows()).toHaveLength(1)
  expect(cells(dataRows()[0])[4]).toHaveTextContent(displayDate('2026-08-11'))
  await user.click(screen.getByRole('button', { name: 'Limpiar' }))
  expect(screen.getByLabelText('Desde')).toHaveValue('')
  expect(screen.getByLabelText('Hasta (opcional)')).toHaveValue('')
  expect(screen.getByText('1-25 de 28 citas')).toBeInTheDocument()
})

it('rechaza un rango invertido y permite buscar por nombre y combinar con estado', async () => {
  const user = userEvent.setup()
  render(<AppointmentHistoryPage />)
  fireEvent.change(screen.getByLabelText('Desde'), { target: { value: '31/08/2026' } })
  fireEvent.change(screen.getByLabelText('Hasta (opcional)'), { target: { value: '01/08/2026' } })
  expect(screen.getByRole('alert')).toHaveTextContent('La fecha inicial')
  expect(screen.getByText('No se encontraron citas con estos filtros.')).toBeInTheDocument()
  await user.click(screen.getByRole('button', { name: 'Limpiar' }))
  const search = screen.getByRole('combobox', { name: 'Por paciente' })
  await user.click(search)
  expect(screen.getAllByRole('option').length).toBeGreaterThan(30)
  await user.type(search, 'María Fernanda')
  await user.click(screen.getByRole('option', { name: /María Fernanda.*3170626701302/ }))
  expect(dataRows()).toHaveLength(3)
  dataRows().forEach((row) => expect(cells(row)[3]).toHaveTextContent('María Fernanda'))
  await user.selectOptions(screen.getByLabelText('Por estado'), 'Completada')
  expect(dataRows()).toHaveLength(2)
})
