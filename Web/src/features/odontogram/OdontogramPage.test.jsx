import { beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen, within, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { AuthContext } from '@/features/auth/context/AuthContext'
import { ModuleAccess } from '@/app/routes/ModuleAccess'
import { paths } from '@/app/routes/paths'
import { OdontogramPage } from './OdontogramPage'
import { readOdontogram } from './odontogramStorage'
import { createOdontogramPDF } from './odontogramPdf'

vi.mock('./odontogramPdf', () => ({ createOdontogramPDF: vi.fn() }))

beforeEach(() => {
  localStorage.clear()
  vi.clearAllMocks()
})

async function choosePatient(user, dpi = '3170626701302') {
  const search = screen.getByRole('combobox', { name: 'Paciente' })
  await user.click(search)
  await user.type(search, dpi)
  await user.click(screen.getByRole('option', { name: new RegExp(dpi) }))
}

describe('Odontograma', () => {
  it('guarda superficies y notas por paciente, cancela cambios y conserva los datos al limpiar', async () => {
    const user = userEvent.setup()
    const view = render(<OdontogramPage />)
    expect(screen.getByRole('button', { name: 'PDF' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Diente 18' })).toBeDisabled()
    await choosePatient(user)
    expect(
      within(screen.getByRole('region', { name: 'Información del paciente' })).getByText(
        'Penicilina',
      ),
    ).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Diente 18' }))
    let dialog = within(screen.getByRole('dialog'))
    await user.click(dialog.getByLabelText('Caries'))
    await user.type(dialog.getByLabelText('Observación (opcional)'), 'Observación de prueba')
    await user.click(dialog.getByRole('button', { name: 'Cancelar' }))
    expect(readOdontogram('patient-1')).toEqual({})
    await user.click(screen.getByRole('button', { name: 'Diente 18' }))
    dialog = within(screen.getByRole('dialog'))
    expect(dialog.getByLabelText('Sin registro')).toBeChecked()
    expect(dialog.getByLabelText('Observación (opcional)')).toHaveValue('')
    await user.click(dialog.getByRole('button', { name: 'Superior: Sin registro' }))
    await user.click(dialog.getByLabelText('Caries'))
    await user.type(dialog.getByLabelText('Tratamiento indicado (opcional)'), 'Control de prueba')
    await user.type(dialog.getByLabelText('Observación (opcional)'), 'Nota persistida')
    await user.click(dialog.getByRole('button', { name: 'Guardar' }))
    expect(readOdontogram('patient-1')[18]).toMatchObject({
      faces: { top: 'caries', center: 'sinRegistro' },
      notes: 'Nota persistida',
    })
    await choosePatient(user, '123456780101')
    expect(screen.queryByText('Nota persistida')).not.toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Diente 55' }))
    dialog = within(screen.getByRole('dialog'))
    await user.click(dialog.getByLabelText('Prótesis'))
    await user.click(dialog.getByRole('button', { name: 'Guardar' }))
    expect(readOdontogram('patient-2')[55].faces.center).toBe('protesis')
    expect(readOdontogram('patient-1')[55]).toBeUndefined()
    await user.click(screen.getByRole('button', { name: 'Limpiar' }))
    expect(screen.getByRole('button', { name: 'PDF' })).toBeDisabled()
    view.unmount()
    render(<OdontogramPage />)
    await choosePatient(user)
    expect(screen.getByText('Nota persistida')).toBeInTheDocument()
  })

  it('descarga el PDF del paciente seleccionado y permite reintentar si falla', async () => {
    const user = userEvent.setup()
    const save = vi.fn()
    createOdontogramPDF.mockRejectedValueOnce(new Error('Error PDF')).mockResolvedValue({ save })
    render(<OdontogramPage />)
    await choosePatient(user)
    await user.click(screen.getByRole('button', { name: 'PDF' }))
    expect(await screen.findByRole('alert')).toHaveTextContent('No se pudo generar el PDF')
    await user.click(screen.getByRole('button', { name: 'PDF' }))
    await waitFor(() => expect(save).toHaveBeenCalledWith('Odontograma-EXP-2026-00128.pdf'))
    expect(createOdontogramPDF).toHaveBeenLastCalledWith(
      expect.objectContaining({ id: 'patient-1' }),
      {},
    )
  })

  it('protege datos ilegibles y no permite sobrescribirlos con un gráfico vacío', async () => {
    localStorage.setItem('ortos.odontogram.v1.patient-1', 'datos dañados')
    const user = userEvent.setup()
    render(<OdontogramPage />)
    await choosePatient(user)
    expect(screen.getByRole('alert')).toHaveTextContent('No se pudo cargar')
    expect(screen.getByRole('button', { name: 'Diente 18' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'PDF' })).toBeDisabled()
    expect(localStorage.getItem('ortos.odontogram.v1.patient-1')).toBe('datos dañados')
  })

  it.each(['odontologo', 'asistente', 'paciente'])('conserva la restricción actual para el rol %s', (role) => {
    render(
      <MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <AuthContext.Provider value={{ user: { role } }}>
          <ModuleAccess path={paths.odontogram}>
            <OdontogramPage />
          </ModuleAccess>
        </AuthContext.Provider>
      </MemoryRouter>,
    )
    expect(screen.getByRole('heading', { name: 'Acceso restringido' })).toBeInTheDocument()
    expect(screen.queryByRole('combobox')).not.toBeInTheDocument()
  })
})
