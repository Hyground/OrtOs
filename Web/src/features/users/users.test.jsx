import { act, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { AuthContext } from '@/features/auth/context/AuthContext'
import { authService } from '@/features/auth/services/authService'
import { tokenStorage } from '@/lib/storage/tokenStorage'
import { ModuleAccess } from '@/app/routes/ModuleAccess'
import { paths } from '@/app/routes/paths'
import { DashboardPage } from '@/pages/DashboardPage'
import { UsersPage } from './components/UsersPage'
import { saveUser, deleteUser, findDevAccountByEmail } from './services/usersMockService'
const dentist = { id: 'dev-odontologo', displayName: 'Dra. Ana Morales', role: 'odontologo' }
const assistant = { id: 'dev-asistente', displayName: 'Asistente de Prueba', role: 'asistente' }
const admin = { id: 'dev-admin', displayName: 'Administrador OrtOs', role: 'admin' }
function mount(component, user) {
  return render(
    <MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <AuthContext.Provider value={{ user, status: 'authenticated' }}>
        {component}
      </AuthContext.Provider>
    </MemoryRouter>,
  )
}
afterEach(() => tokenStorage.clear())
it('inicia sesión como odontólogo y restaura el rol desde su token', async () => {
  const result = await authService.login({ email: 'odontologo@ortos.test', password: 'Odonto123' })
  expect(result.user).toMatchObject(dentist)
  expect(result.user).not.toHaveProperty('password')
  tokenStorage.set(result.token)
  expect(await authService.me()).toMatchObject(dentist)
})
it('el panel del odontólogo muestra solo sus tres módulos', () => {
  mount(<DashboardPage />, dentist)
  expect(screen.getByText('Panel del odontólogo')).toBeInTheDocument()
  expect(screen.getByRole('link', { name: /Paciente/ })).toHaveAttribute('href', paths.patients)
  expect(screen.getByRole('link', { name: /Citas/ })).toHaveAttribute('href', paths.appointments)
  expect(screen.getByRole('link', { name: /Pagos/ })).toHaveAttribute('href', paths.payments)
  expect(
    screen.queryByRole('link', { name: /Usuarios|Odontograma|Reporte/ }),
  ).not.toBeInTheDocument()
})
it('el panel del asistente muestra solo Pacientes, Citas y Pagos', () => {
  mount(<DashboardPage />, assistant)
  expect(screen.getByText('Panel del asistente')).toBeInTheDocument()
  expect(screen.getByRole('link', { name: /Paciente/ })).toHaveAttribute('href', paths.patients)
  expect(screen.getByRole('link', { name: /Citas/ })).toHaveAttribute('href', paths.appointments)
  expect(screen.getByRole('link', { name: /Pagos/ })).toHaveAttribute('href', paths.payments)
  expect(
    screen.queryByRole('link', { name: /Usuarios|Odontograma|Especialidades|Tratamiento|Reporte/ }),
  ).not.toBeInTheDocument()
})
it('bloquea el acceso directo del asistente a Usuarios y Odontograma', () => {
  mount(
    <ModuleAccess path={paths.users}>
      <div>Contenido privado de usuarios</div>
    </ModuleAccess>,
    assistant,
  )
  expect(screen.getByRole('heading', { name: 'Acceso restringido' })).toBeInTheDocument()
})
it('bloquea el acceso directo del odontólogo a Usuarios', () => {
  mount(
    <ModuleAccess path={paths.users}>
      <div>Contenido privado de usuarios</div>
    </ModuleAccess>,
    dentist,
  )
  expect(screen.getByRole('heading', { name: 'Acceso restringido' })).toBeInTheDocument()
  expect(screen.queryByText('Contenido privado de usuarios')).not.toBeInTheDocument()
})
it('el administrador crea una cuenta desde Usuarios y puede iniciar sesión con ella', async () => {
  tokenStorage.set('ortos-dev-token:dev-admin')
  const user = userEvent.setup()
  mount(<UsersPage />, admin)
  await user.click(screen.getByRole('button', { name: '+ NUEVO USUARIO' }))
  await user.type(screen.getByLabelText('Nombre completo *'), 'Dr. Luis Prueba')
  await user.type(screen.getByLabelText('Correo electrónico *'), 'luis.prueba@ortos.test')
  await user.type(screen.getByLabelText('Contraseña *'), 'Prueba123')
  await user.click(screen.getByRole('button', { name: 'Guardar usuario' }))
  await waitFor(() =>
    expect(screen.getByText('Usuario guardado correctamente.')).toBeInTheDocument(),
  )
  const session = await authService.login({
    email: 'luis.prueba@ortos.test',
    password: 'Prueba123',
  })
  expect(session.user.role).toBe('odontologo')
  const account = findDevAccountByEmail('luis.prueba@ortos.test')
  await act(async () => {
    await saveUser({ ...account, active: false })
  })
  await expect(authService.login({ email: account.email, password: 'Prueba123' })).rejects.toThrow()
  await act(async () => {
    await deleteUser(account.id)
  })
})
it('impide a un odontólogo crear usuarios y al administrador eliminar su propia cuenta', async () => {
  tokenStorage.set('ortos-dev-token:dev-odontologo')
  await expect(saveUser({})).rejects.toThrow('Solo un administrador')
  tokenStorage.set('ortos-dev-token:dev-admin')
  await expect(deleteUser('dev-admin')).rejects.toThrow('propia cuenta')
  await expect(saveUser({ ...admin, email: 'admin@ortos.test', active: false })).rejects.toThrow(
    'desactivar',
  )
})
