import { describe, expect, it } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { AuthContext } from '@/features/auth/context/AuthContext'
import { AuthDialogProvider } from '@/features/auth/context/AuthDialogProvider'
import { canAccess } from '@/features/auth/permissions'
import { AppRouter } from './AppRouter'
import { paths } from './paths'

const modules = [
  [paths.specialties, 'Especialidades'],
  [paths.odontogram, 'Odontograma'],
  [paths.reports, 'Reporte'],
]

function renderRole(role, route = paths.dashboard) {
  return render(
    <MemoryRouter
      initialEntries={[route]}
      future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
    >
      <AuthContext.Provider
        value={{
          user: { id: 'access-test', role, displayName: 'Prueba' },
          status: 'authenticated',
        }}
      >
        <AuthDialogProvider>
          <AppRouter />
        </AuthDialogProvider>
      </AuthContext.Provider>
    </MemoryRouter>,
  )
}

describe('Accesos a los modulos de gestion', () => {
  it.each(['admin', 'odontologo'])(
    'muestra los tres accesos en el menu y las tarjetas de %s',
    (role) => {
      renderRole(role)
      const areas = within(screen.getByRole('region', { name: 'Areas de trabajo' }))
      for (const [path, title] of modules) {
        const links = screen
          .getAllByRole('link')
          .filter((link) => link.getAttribute('href') === path)
        expect(links).toHaveLength(2)
        expect(areas.getByRole('link', { name: new RegExp(title) })).toHaveAttribute('href', path)
      }
    },
  )

  it.each(modules)('permite al odontologo abrir directamente %s', (path, title) => {
    renderRole('odontologo', path)
    expect(screen.getByRole('heading', { name: title, level: 1 })).toBeInTheDocument()
    expect(screen.queryByText('Acceso restringido')).not.toBeInTheDocument()
  })

  it('mantiene restringidos los demas modulos y el acceso del paciente', () => {
    for (const path of [
      paths.users,
      paths.doctors,
      paths.treatments,
      paths.summary,
      paths.calendar,
      paths.appointmentHistory,
    ]) {
      expect(canAccess({ role: 'odontologo' }, path)).toBe(false)
    }
    for (const [path] of modules) {
      expect(canAccess({ role: 'paciente' }, path)).toBe(false)
      expect(canAccess(null, path)).toBe(false)
    }
  })
})
