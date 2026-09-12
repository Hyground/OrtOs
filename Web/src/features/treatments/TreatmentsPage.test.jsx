import { beforeEach, describe, expect, it } from 'vitest'
import { render, screen, within, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { TreatmentsPage } from './TreatmentsPage'

beforeEach(() => localStorage.clear())

describe('Tratamientos', () => {
  it('muestra las veces solicitado calculadas desde las citas existentes', () => {
    render(<TreatmentsPage />)
    const row = screen.getByRole('cell', { name: 'Limpieza dental' }).closest('tr')
    expect(within(row).getByText('4')).toBeInTheDocument()
  })

  it('permite crear, editar, buscar y eliminar un tratamiento con persistencia', async () => {
    const user = userEvent.setup()
    const view = render(<TreatmentsPage />)
    await user.click(screen.getByRole('button', { name: 'Nuevo tratamiento' }))
    let dialog = screen.getByRole('dialog')
    await user.type(within(dialog).getByLabelText('Nombre'), 'Pulido dental')
    await user.type(within(dialog).getByLabelText('Duración (minutos)'), '20')
    await user.type(within(dialog).getByLabelText('Precio (Q)'), '180')
    await user.click(within(dialog).getByRole('button', { name: 'Guardar' }))
    view.unmount()
    render(<TreatmentsPage />)
    await user.click(screen.getByRole('button', { name: 'Editar Pulido dental' }))
    dialog = screen.getByRole('dialog')
    await user.clear(within(dialog).getByLabelText('Nombre'))
    await user.type(within(dialog).getByLabelText('Nombre'), 'Pulido dental premium')
    await user.click(within(dialog).getByRole('button', { name: 'Guardar' }))
    await user.type(screen.getByLabelText('Buscar tratamiento'), 'premium')
    expect(
      screen.getByRole('button', { name: 'Editar Pulido dental premium' }),
    ).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Editar Limpieza dental' })).not.toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Eliminar Pulido dental premium' }))
    await user.click(within(screen.getByRole('dialog')).getByRole('button', { name: 'Eliminar' }))
    expect(
      screen.queryByRole('button', { name: 'Editar Pulido dental premium' }),
    ).not.toBeInTheDocument()
    expect(
      JSON.parse(localStorage.getItem('ortos.treatments.v1')).some(
        (item) => item.name === 'Pulido dental premium',
      ),
    ).toBe(false)
  })

  it('rechaza nombres duplicados y valores numéricos inválidos', async () => {
    const user = userEvent.setup()
    render(<TreatmentsPage />)
    await user.click(screen.getByRole('button', { name: 'Nuevo tratamiento' }))
    const dialogEl = screen.getByRole('dialog')
    const dialog = within(dialogEl)
    await user.type(dialog.getByLabelText('Nombre'), '  LIMPIEZA DENTAL  ')
    await user.clear(dialog.getByLabelText('Duración (minutos)'))
    await user.type(dialog.getByLabelText('Duración (minutos)'), '30')
    await user.type(dialog.getByLabelText('Precio (Q)'), '100')
    await user.click(dialog.getByRole('button', { name: 'Guardar' }))
    expect(dialog.getByRole('alert')).toHaveTextContent('Ya existe un tratamiento')
    await user.clear(dialog.getByLabelText('Nombre'))
    await user.type(dialog.getByLabelText('Nombre'), 'Nuevo procedimiento')
    await user.clear(dialog.getByLabelText('Duración (minutos)'))
    await user.type(dialog.getByLabelText('Duración (minutos)'), '0')
    // El input number es required/min en el navegador: un click normal queda bloqueado por
    // la validación nativa antes de llegar a nuestro mensaje, así que disparamos el submit
    // directamente para confirmar que el formulario también rechaza el valor.
    fireEvent.submit(dialogEl.querySelector('form'))
    expect(dialog.getByRole('alert')).toHaveTextContent('Ingresa una duración válida')
  })
})
