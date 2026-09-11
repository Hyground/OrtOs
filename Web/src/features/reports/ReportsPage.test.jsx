import { beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen, within, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { AuthContext } from '@/features/auth/context/AuthContext'
import { ReportsPage } from './ReportsPage'
import { downloadReport } from './reportExport'

vi.mock('./reportExport', async (original) => ({ ...(await original()), downloadReport: vi.fn() }))
beforeEach(() => {
  localStorage.clear()
  vi.clearAllMocks()
})
function setup(role = 'admin') {
  return render(
    <MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <AuthContext.Provider value={{ user: { role, displayName: 'Cuenta de prueba' } }}>
        <ReportsPage />
      </AuthContext.Provider>
    </MemoryRouter>,
  )
}

describe('Pantalla de reportes', () => {
  it('muestra seis tarjetas, filtra, exporta toda la selección y permite volver', async () => {
    const user = userEvent.setup()
    setup()
    expect(
      within(screen.getByRole('region', { name: 'Áreas de trabajo · Reportes' })).getAllByRole(
        'button',
      ),
    ).toHaveLength(6)
    await user.click(screen.getByRole('button', { name: /Ingresos y pagos pendientes/ }))
    await user.selectOptions(screen.getByLabelText('Paciente'), 'patient-1')
    await user.click(screen.getByRole('button', { name: 'Excel' }))
    await waitFor(() =>
      expect(downloadReport).toHaveBeenCalledWith(
        expect.objectContaining({ id: 'income' }),
        'xlsx',
      ),
    )
    const report = downloadReport.mock.calls[0][0]
    expect(report.tables[0].rows).toHaveLength(1)
    expect(report.tables[0].rows[0][1]).toContain('María Fernanda')
    downloadReport.mockRejectedValueOnce(new Error('fallo'))
    await user.click(screen.getByRole('button', { name: 'PDF' }))
    expect(await screen.findByRole('alert')).toHaveTextContent('No se pudo generar')
    await user.click(screen.getByRole('button', { name: 'PDF' }))
    await waitFor(() => expect(screen.queryByRole('alert')).not.toBeInTheDocument())
    await user.click(screen.getByRole('button', { name: 'Volver a reportes' }))
    expect(screen.getByRole('button', { name: /Resumen general/ })).toBeInTheDocument()
  })

  it('requiere paciente para exportar odontograma y protege los datos ilegibles', async () => {
    const user = userEvent.setup()
    setup()
    await user.click(screen.getByRole('button', { name: /Estado dental por paciente/ }))
    expect(screen.getByRole('button', { name: 'PDF' })).toBeDisabled()
    localStorage.setItem('ortos.odontogram.v1.patient-1', 'roto')
    await user.selectOptions(screen.getByLabelText('Paciente'), 'patient-1')
    expect(screen.getByRole('alert')).toHaveTextContent('No se pudo leer')
    expect(screen.getByRole('button', { name: 'PDF' })).toBeDisabled()
    localStorage.removeItem('ortos.odontogram.v1.patient-1')
    await user.click(screen.getByRole('button', { name: 'Actualizar' }))
    expect(screen.getByRole('button', { name: 'PDF' })).toBeEnabled()
    await user.selectOptions(screen.getByLabelText('Dentadura'), 'temporary')
    await user.click(screen.getByRole('button', { name: 'PDF' }))
    expect(downloadReport).toHaveBeenCalledWith(
      expect.objectContaining({ filters: expect.arrayContaining(['Dentadura: Infantil']) }),
      'pdf',
    )
  })

  it('no ofrece datos ni exportación a un odontólogo sin vínculo', async () => {
    const user = userEvent.setup()
    setup('odontologo')
    await user.click(screen.getByRole('button', { name: /Resumen general/ }))
    expect(screen.getByText(/No se encontró un vínculo verificable/)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Excel' })).toBeDisabled()
    expect(screen.getByLabelText('Paciente').options).toHaveLength(1)
  })
})
