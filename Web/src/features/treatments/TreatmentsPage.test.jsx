import { beforeEach, describe, expect, it } from 'vitest'
import { render, screen, within, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { TreatmentsPage } from './TreatmentsPage'

beforeEach(() => localStorage.clear())

describe('Tratamientos', () => {
  it('abre las acciones al pulsar la fila y no al cambiar el estado', async () => {
    const user = userEvent.setup()
    render(<TreatmentsPage />)
    const options = screen.getByRole('button', { name: 'Opciones de Limpieza dental' })
    await user.click(screen.getByRole('cell', { name: 'Limpieza dental' }))
    expect(options).toHaveAttribute('aria-expanded', 'true')
    expect(screen.getByRole('button', { name: 'Editar' })).toBeInTheDocument()
    expect(
      screen.queryByText('Seguimiento y ajustes del aparato de ortodoncia en fase avanzada.'),
    ).not.toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Cambiar estado de Limpieza dental' }))
    expect(options).toHaveAttribute('aria-expanded', 'true')
    expect(screen.getByRole('dialog', { name: 'Desactivar tratamiento' })).toBeInTheDocument()
    await user.click(within(screen.getByRole('dialog', { name: 'Desactivar tratamiento' })).getByRole('button', { name: 'Cancelar' }))
    await user.click(screen.getByRole('cell', { name: 'Limpieza dental' }))
    expect(options).toHaveAttribute('aria-expanded', 'false')
  })
  it('abre el formulario de categoría y vuelve al tratamiento sin perder datos', async () => {
    const user = userEvent.setup()
    const view = render(<TreatmentsPage />)
    await user.click(screen.getByRole('button', { name: 'Nuevo tratamiento' }))
    const treatmentDialog = screen.getByRole('dialog', { name: 'Nuevo tratamiento' })
    await user.type(within(treatmentDialog).getByLabelText('Nombre'), 'Control periodontal')
    await user.click(
      within(treatmentDialog).getByRole('button', { name: 'Crear categoría desde tratamiento' }),
    )
    const categoryDialog = screen.getByRole('dialog', { name: 'Crear categoría' })
    expect(document.querySelectorAll('[aria-modal="true"]')[1]).toBe(categoryDialog)
    const categoryName = within(categoryDialog).getByLabelText('Nombre de categoría')
    await user.type(categoryName, 'ortodoncia')
    await user.click(within(categoryDialog).getByRole('button', { name: 'Crear categoría' }))
    expect(within(categoryDialog).getByRole('alert')).toHaveTextContent('Ya existe una categoría')
    await user.clear(categoryName)
    await user.type(categoryName, 'Periodoncia')
    await user.click(within(categoryDialog).getByRole('button', { name: 'Crear categoría' }))
    expect(screen.queryByRole('dialog', { name: 'Crear categoría' })).not.toBeInTheDocument()
    expect(within(treatmentDialog).getByLabelText('Categoría')).toHaveValue('Periodoncia')
    expect(within(treatmentDialog).getByLabelText('Nombre')).toHaveValue('Control periodontal')
    await user.type(within(treatmentDialog).getByLabelText('Precio (Q)'), '250')
    await user.click(within(treatmentDialog).getByRole('button', { name: 'Guardar' }))
    view.unmount()
    render(<TreatmentsPage />)
    const row = screen.getByRole('cell', { name: 'Control periodontal' }).closest('tr')
    expect(within(row).getByRole('cell', { name: 'Periodoncia' })).toBeInTheDocument()
  })
  it('crea categorías, evita duplicados y actualiza tratamientos al renombrar', async () => {
    const user = userEvent.setup()
    const view = render(<TreatmentsPage />)
    await user.click(screen.getByRole('button', { name: 'Categorías' }))
    const dialog = screen.getByRole('dialog', { name: 'Categorías de tratamientos' })
    const name = within(dialog).getByLabelText('Nombre de categoría')
    await user.type(name, 'Periodoncia')
    await user.click(within(dialog).getByRole('button', { name: 'Crear categoría' }))
    expect(within(dialog).getByText('Periodoncia')).toBeInTheDocument()
    await user.type(name, 'periodoncia')
    await user.click(within(dialog).getByRole('button', { name: 'Crear categoría' }))
    expect(within(dialog).getByRole('alert')).toHaveTextContent('Ya existe una categoría')

    await user.click(within(dialog).getByRole('button', { name: 'Renombrar Ortodoncia' }))
    await user.clear(name)
    await user.type(name, 'Ortodoncia clínica')
    await user.click(within(dialog).getByRole('button', { name: 'Guardar cambios' }))
    expect(screen.getAllByRole('cell', { name: 'Ortodoncia clínica' }).length).toBeGreaterThan(0)
    expect(
      within(dialog).getByRole('button', { name: 'Eliminar Ortodoncia clínica' }),
    ).toBeDisabled()
    expect(JSON.parse(localStorage.getItem('ortos.treatmentCategories.v1'))).toContain(
      'Ortodoncia clínica',
    )
    expect(
      JSON.parse(localStorage.getItem('ortos.treatments.v1')).some(
        (item) => item.category === 'Ortodoncia clínica',
      ),
    ).toBe(true)
    view.unmount()
    render(<TreatmentsPage />)
    await user.click(screen.getByRole('button', { name: 'Nuevo tratamiento' }))
    const select = within(screen.getByRole('dialog')).getByLabelText('Categoría')
    expect(within(select).getByRole('option', { name: 'Periodoncia' })).toBeInTheDocument()
    expect(within(select).getByRole('option', { name: 'Ortodoncia clínica' })).toBeInTheDocument()
  })
  it('permite cambiar y conservar el estado ON/OFF', async () => {
    const user = userEvent.setup()
    const view = render(<TreatmentsPage />)
    const toggle = screen.getByRole('button', { name: 'Cambiar estado de Limpieza dental' })
    expect(toggle).toHaveAttribute('aria-pressed', 'true')
    expect(screen.queryByText('Veces solicitado')).not.toBeInTheDocument()
    await user.click(toggle)
    expect(toggle).toHaveAttribute('aria-pressed', 'true')
    const confirmation = screen.getByRole('dialog', { name: 'Desactivar tratamiento' })
    await user.click(within(confirmation).getByRole('button', { name: 'Desactivar' }))
    expect(toggle).toHaveAttribute('aria-pressed', 'false')
    view.unmount()
    render(<TreatmentsPage />)
    expect(
      screen.getByRole('button', { name: 'Cambiar estado de Limpieza dental' }),
    ).toHaveAttribute('aria-pressed', 'false')
  })
  it('permite crear, editar, buscar y eliminar un tratamiento con persistencia', async () => {
    const user = userEvent.setup()
    const view = render(<TreatmentsPage />)
    await user.click(screen.getByRole('button', { name: 'Nuevo tratamiento' }))
    let dialog = screen.getByRole('dialog')
    expect(within(dialog).queryByLabelText('Descripción')).not.toBeInTheDocument()
    await user.type(within(dialog).getByLabelText('Nombre'), 'Pulido dental')
    await user.selectOptions(within(dialog).getByLabelText('Categoría'), 'Ortodoncia')
    await user.clear(within(dialog).getByLabelText('Duración (minutos)'))
    await user.type(within(dialog).getByLabelText('Duración (minutos)'), '20')
    await user.type(within(dialog).getByLabelText('Precio (Q)'), '180')
    await user.click(within(dialog).getByRole('button', { name: 'Guardar' }))
    view.unmount()
    render(<TreatmentsPage />)
    await user.click(screen.getByRole('button', { name: 'Opciones de Pulido dental' }))
    await user.click(screen.getByRole('button', { name: 'Editar' }))
    dialog = screen.getByRole('dialog')
    await user.clear(within(dialog).getByLabelText('Nombre'))
    await user.type(within(dialog).getByLabelText('Nombre'), 'Pulido dental premium')
    await user.click(within(dialog).getByRole('button', { name: 'Guardar' }))
    await user.type(screen.getByLabelText('Buscar tratamiento'), 'premium')
    expect(
      screen.getByRole('button', { name: 'Opciones de Pulido dental premium' }),
    ).toBeInTheDocument()
    expect(
      screen.queryByRole('button', { name: 'Opciones de Limpieza dental' }),
    ).not.toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: 'Opciones de Pulido dental premium' }),
    ).toHaveAttribute('aria-expanded', 'true')
    await user.click(screen.getByRole('button', { name: 'Eliminar' }))
    await user.click(within(screen.getByRole('dialog')).getByRole('button', { name: 'Eliminar' }))
    expect(
      screen.queryByRole('button', { name: 'Opciones de Pulido dental premium' }),
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
    await user.selectOptions(dialog.getByLabelText('Categoría'), 'Ortodoncia')
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
