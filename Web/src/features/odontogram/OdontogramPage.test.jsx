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
  await user.paste(dpi)
  await user.click(screen.getByRole('option', { name: new RegExp(dpi) }))
}

describe('Odontograma', () => {
  it('guarda superficies y notas por paciente, cancela cambios y conserva los datos al limpiar', async () => {
    const user = userEvent.setup()
    const view = render(<OdontogramPage />)
    expect(screen.queryByText('Sin registro')).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'PDF' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Diente 18' })).toBeDisabled()
    expect(screen.getAllByRole('button', { name: /^Diente / })).toHaveLength(32)
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
    await user.click(dialog.getByRole('button', { name: 'Cerrar' }))
    expect(readOdontogram('patient-1')).toEqual({})
    await user.click(screen.getByRole('button', { name: 'Diente 18' }))
    dialog = within(screen.getByRole('dialog'))
    expect(dialog.getByLabelText('Sano')).toBeChecked()
    expect(dialog.getByLabelText('Observación (opcional)')).toHaveValue('')
    await user.click(dialog.getByRole('button', { name: 'Superior: Sano' }))
    await user.click(dialog.getByLabelText('Caries'))
    await user.type(dialog.getByLabelText('Tratamiento indicado (opcional)'), 'Control de prueba')
    await user.type(dialog.getByLabelText('Observación (opcional)'), 'Nota persistida')
    await user.click(dialog.getByRole('button', { name: 'Guardar' }))
    expect(readOdontogram('patient-1')[18]).toMatchObject({
      faces: { top: 'caries', center: 'sano' },
      notes: 'Nota persistida',
    })
    await choosePatient(user, '123456780101')
    expect(screen.queryByText('Nota persistida')).not.toBeInTheDocument()
    await user.click(screen.getByRole('switch', { name: 'Dentadura infantil' }))
    expect(screen.queryByRole('button', { name: 'Diente 18' })).not.toBeInTheDocument()
    expect(screen.getAllByRole('button', { name: /^Diente / })).toHaveLength(20)
    await user.click(screen.getByRole('button', { name: 'Diente 55' }))
    dialog = within(screen.getByRole('dialog'))
    await user.click(dialog.getByLabelText('Tratamiento'))
    await user.click(dialog.getByRole('button', { name: 'Guardar' }))
    expect(readOdontogram('patient-2')[55].faces.center).toBe('tratamiento')
    expect(readOdontogram('patient-1')[55]).toBeUndefined()
    await user.click(screen.getByRole('button', { name: 'Limpiar' }))
    expect(screen.getByRole('button', { name: 'PDF' })).toBeDisabled()
    view.unmount()
    render(<OdontogramPage />)
    await choosePatient(user)
    expect(screen.getAllByText('Nota persistida').length).toBeGreaterThan(0)
  })

  it('limpia el borrador completo y solo lo guarda al confirmar', async () => {
    const user = userEvent.setup()
    const tooth = {
      faces: {
        top: 'caries',
        center: 'caries',
        left: 'tratamiento',
        right: 'sano',
        bottom: 'sano',
      },
      treatment: 'Control',
      notes: 'Nota',
    }
    localStorage.setItem('ortos.odontogram.v1.patient-1', JSON.stringify({ 18: tooth }))
    render(<OdontogramPage />)
    await choosePatient(user)
    const summary = screen.getByLabelText('Resumen de dientes')
    expect(within(summary).getByText('Caries').parentElement).toHaveTextContent('1')
    expect(within(summary).getByText('Sano').parentElement).toHaveTextContent('31')
    expect(within(screen.getByRole('table')).queryByText('Sano')).not.toBeInTheDocument()
    expect(within(summary).getByLabelText('Caries: 1 dientes')).toHaveTextContent('1')
    expect(within(summary).getByLabelText('Sano: 31 dientes')).toHaveTextContent('31')
    await user.click(screen.getByRole('button', { name: 'Diente 18' }))
    let dialog = within(screen.getByRole('dialog'))
    await user.click(dialog.getByRole('button', { name: 'Limpiar' }))
    expect(dialog.getByLabelText('Sano')).toBeChecked()
    expect(dialog.getByLabelText('Tratamiento indicado (opcional)')).toHaveValue('')
    expect(dialog.getByLabelText('Observaci\u00f3n (opcional)')).toHaveValue('')
    expect(readOdontogram('patient-1')[18]).toEqual(tooth)
    await user.click(dialog.getByRole('button', { name: 'Cerrar' }))
    await user.click(screen.getByRole('button', { name: 'Diente 18' }))
    dialog = within(screen.getByRole('dialog'))
    expect(dialog.getByLabelText('Caries')).toBeChecked()
    await user.click(dialog.getByRole('button', { name: 'Limpiar' }))
    await user.click(dialog.getByRole('button', { name: 'Guardar' }))
    expect(Object.values(readOdontogram('patient-1')[18].faces)).toEqual(Array(5).fill('sano'))
    expect(within(summary).getByText('Sano').parentElement).toHaveTextContent('32')
    expect(screen.queryByRole('table')).not.toBeInTheDocument()
    await user.click(screen.getByRole('switch'))
    expect(screen.getByRole('switch')).toHaveTextContent('Infantil')
    expect(within(summary).queryByText('Pr\u00f3tesis')).not.toBeInTheDocument()
    expect(within(summary).getByText('Sano').parentElement).toHaveTextContent('20')
    expect(
      screen.getByRole('heading', { name: 'Cuadrante 1 (Superior derecho)' }),
    ).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Diente 55' }))
    expect(
      within(screen.getByRole('dialog')).queryByLabelText('Pr\u00f3tesis'),
    ).not.toBeInTheDocument()
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
      undefined,
      'permanent',
    )
  })

  it('convierte estados antiguos a sano y conserva hallazgos al cambiar dentadura', async () => {
    const legacy = {
      faces: {
        top: 'caries',
        left: 'sinRegistro',
        center: 'sinRegistro',
        right: 'sano',
        bottom: 'sinRegistro',
      },
      treatment: 'Control',
      notes: 'Registro anterior',
    }
    localStorage.setItem('ortos.odontogram.v1.patient-1', JSON.stringify({ 18: legacy }))
    const user = userEvent.setup()
    render(<OdontogramPage />)
    await choosePatient(user)
    expect(readOdontogram('patient-1')[18]).toMatchObject({
      faces: { top: 'caries', center: 'sano' },
      notes: 'Registro anterior',
    })
    await user.click(screen.getByRole('switch'))
    expect(screen.queryByText('Registro anterior')).not.toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Diente 55' }))
    await user.click(screen.getByLabelText('Caries'))
    await user.click(screen.getByRole('button', { name: 'Guardar' }))
    await user.click(screen.getByRole('switch'))
    expect(screen.getAllByText('Registro anterior').length).toBeGreaterThan(0)
    expect(readOdontogram('patient-1')[55].faces.center).toBe('caries')
    expect(readOdontogram('patient-1')[18].faces.top).toBe('caries')
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

  it.each(['paciente'])('conserva la restricción actual para el rol %s', (role) => {
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
