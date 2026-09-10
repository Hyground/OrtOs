import { beforeEach, describe, expect, it } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { SpecialtiesPage } from './SpecialtiesPage'

beforeEach(() => localStorage.clear())

describe('Especialidades', () => {
  it('permite crear, editar, buscar y eliminar una especialidad con persistencia', async () => {
    const user = userEvent.setup()
    const view = render(<SpecialtiesPage />)
    await user.click(screen.getByRole('button', { name: 'Nueva especialidad' }))
    let dialog = screen.getByRole('dialog')
    await user.type(within(dialog).getByLabelText('Nombre'), 'Periodoncia')
    await user.type(within(dialog).getByLabelText('Descripción'), 'Cuidado de las encías.')
    await user.click(within(dialog).getByRole('button', { name: 'Guardar' }))
    view.unmount()
    render(<SpecialtiesPage />)
    await user.click(screen.getByRole('button', { name: 'Editar Periodoncia' }))
    dialog = screen.getByRole('dialog')
    await user.clear(within(dialog).getByLabelText('Nombre'))
    await user.type(within(dialog).getByLabelText('Nombre'), 'Periodoncia clínica')
    await user.click(within(dialog).getByRole('button', { name: 'Guardar' }))
    await user.type(screen.getByLabelText('Buscar especialidad'), 'clinica')
    expect(screen.getByRole('button', { name: 'Editar Periodoncia clínica' })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Editar Ortodoncia' })).not.toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Eliminar Periodoncia clínica' }))
    await user.click(within(screen.getByRole('dialog')).getByRole('button', { name: 'Eliminar' }))
    expect(
      screen.queryByRole('button', { name: 'Editar Periodoncia clínica' }),
    ).not.toBeInTheDocument()
    expect(
      JSON.parse(localStorage.getItem('ortos.specialties.v1')).some(
        (item) => item.name === 'Periodoncia clínica',
      ),
    ).toBe(false)
  })

  it('rechaza nombres duplicados y campos compuestos solo por espacios', async () => {
    const user = userEvent.setup()
    render(<SpecialtiesPage />)
    await user.click(screen.getByRole('button', { name: 'Nueva especialidad' }))
    const dialog = within(screen.getByRole('dialog'))
    await user.type(dialog.getByLabelText('Nombre'), '  ORTODONCIA  ')
    await user.type(dialog.getByLabelText('Descripción'), 'Descripción de prueba.')
    await user.click(dialog.getByRole('button', { name: 'Guardar' }))
    expect(dialog.getByRole('alert')).toHaveTextContent('Ya existe una especialidad')
    await user.clear(dialog.getByLabelText('Nombre'))
    await user.type(dialog.getByLabelText('Nombre'), '   ')
    await user.click(dialog.getByRole('button', { name: 'Guardar' }))
    expect(dialog.getByRole('alert')).toHaveTextContent('Completa el nombre y la descripción.')
  })
})
