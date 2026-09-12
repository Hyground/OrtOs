import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useUsers, saveUser, deleteUser } from '../services/usersMockService'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { roleLabels } from '@/features/auth/permissions'
import { Button } from '@/components/ui/Button/Button'
import { TextField } from '@/components/ui/TextField/TextField'
import { SelectField } from '@/components/ui/SelectField/SelectField'
import { Modal } from '@/components/ui/Modal/Modal'
import { IconUsers, IconEdit, IconTrash, IconSearch } from '@/components/icons/icons'
import { CenterToast, Pagination, StatusToggle } from '@/features/clinical/components'
import { usePagination } from '@/features/clinical/tableHelpers'
import { normalize } from '@/features/clinical/mockStore'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import styles from '@/features/clinical/Clinical.module.css'
import css from './UsersPage.module.css'
const roles = Object.entries(roleLabels).map(([value, label]) => ({ value, label }))
function UserForm({ account, onClose, onSaved }) {
  const [values, setValues] = useState(
    account
      ? { ...account, password: '' }
      : { displayName: '', email: '', password: '', role: 'odontologo', active: true },
  )
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const set = (key, value) => setValues((v) => ({ ...v, [key]: value }))
  return (
    <Modal
      open
      size="wide"
      title={account ? 'EDITAR USUARIO' : 'NUEVO USUARIO'}
      onClose={() => {
        if (!busy) onClose()
      }}
    >
      <form
        className={styles.form}
        onSubmit={async (e) => {
          e.preventDefault()
          if (busy) return
          setBusy(true)
          setError('')
          try {
            await saveUser(values)
            onSaved()
          } catch (e) {
            setError(e.message)
          } finally {
            setBusy(false)
          }
        }}
      >
        <fieldset disabled={busy} className={styles.cols2}>
          <TextField
            label="Nombre completo *"
            required
            value={values.displayName}
            onChange={(e) => set('displayName', e.target.value)}
          />
          <TextField
            label="Correo electrónico *"
            type="email"
            required
            value={values.email}
            onChange={(e) => set('email', e.target.value)}
          />
          <SelectField
            label="Rol *"
            required
            options={roles}
            value={values.role}
            onChange={(e) => set('role', e.target.value)}
          />
          <SelectField
            label="Estado *"
            required
            options={['Activo', 'Inactivo']}
            value={values.active ? 'Activo' : 'Inactivo'}
            onChange={(e) => set('active', e.target.value === 'Activo')}
          />
          <TextField
            label={account ? 'Nueva contraseña (opcional)' : 'Contraseña *'}
            type="password"
            autoComplete="new-password"
            required={!account}
            minLength={8}
            value={values.password}
            onChange={(e) => set('password', e.target.value)}
          />
          <p className={styles.muted}>
            {account ? 'Deja la contraseña vacía para conservarla. ' : ''}El odontólogo y el
            asistente acceden únicamente a Pacientes, Citas y Pagos.
          </p>
        </fieldset>
        {error && (
          <p role="alert" className={styles.error}>
            {error}
          </p>
        )}
        <div className={styles.footer}>
          <Button variant="ghost" disabled={busy} onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" disabled={busy}>
            {busy ? 'Guardando…' : 'Guardar usuario'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
export function UsersPage() {
  useDocumentTitle('Usuarios')
  const users = useUsers()
  const { user } = useAuth()
  const [params, setParams] = useSearchParams()
  const [query, setQuery] = useState('')
  const [role, setRole] = useState('')
  const [status, setStatus] = useState('')
  const [editing, setEditing] = useState(null)
  const [remove, setRemove] = useState(null)
  const [notice, setNotice] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const [statusBusy, setStatusBusy] = useState('')
  const [statusNotice, setStatusNotice] = useState(null)
  const rows = users.filter(
    (u) =>
      normalize(u.displayName + ' ' + u.email).includes(normalize(query)) &&
      (!role || u.role === role) &&
      (!status || u.active === (status === 'Activo')),
  )
  const { page, setPage, visible } = usePagination(rows, 7)
  const close = () => {
    setEditing(null)
    setParams(
      (p) => {
        p.delete('nuevo')
        return p
      },
      { replace: true },
    )
  }
  useEffect(() => {
    if (!statusNotice) return undefined
    const timer = setTimeout(() => setStatusNotice(null), 2200)
    return () => clearTimeout(timer)
  }, [statusNotice])

  const toggleUserStatus = async (account) => {
    const nextActive = !account.active
    setStatusBusy(account.id)
    setError('')
    try {
      await saveUser({ ...account, active: nextActive, password: '' })
      setStatusNotice({ name: account.displayName, status: nextActive ? 'Activo' : 'Inactivo' })
    } catch (e) {
      setError(e.message)
    } finally {
      setStatusBusy('')
    }
  }
  return (
    <div className={styles.page + ' ' + css.page}>
      <header className={css.banner}>
        <div>
          <h1>
            <IconUsers /> USUARIOS
          </h1>
          <p>Administra las cuentas, los roles y el acceso al sistema.</p>
        </div>
        <div className={css.counts}>
          <span>
            <strong>{users.length}</strong>Usuarios
          </span>
          <span>
            <strong>{users.filter((u) => u.active).length}</strong>Activos
          </span>
        </div>
        <Button onClick={() => setParams({ nuevo: '1' })}>+ NUEVO USUARIO</Button>
      </header>
      {notice && (
        <p role="status" className={styles.success}>
          {notice}
        </p>
      )}
      <CenterToast notice={statusNotice} />
      <section className={styles.card}>
        <div className={styles.filters}>
          <TextField
            label="Buscar usuario"
            type="search"
            icon={IconSearch}
            value={query}
            onChange={(e) => {
              setQuery(e.target.value)
              setPage(1)
            }}
            placeholder="Nombre o correo..."
          />
          <SelectField
            label="Rol"
            placeholder="Todos los roles"
            options={roles}
            value={role}
            onChange={(e) => {
              setRole(e.target.value)
              setPage(1)
            }}
          />
          <SelectField
            label="Estado"
            placeholder="Todos los estados"
            options={['Activo', 'Inactivo']}
            value={status}
            onChange={(e) => {
              setStatus(e.target.value)
              setPage(1)
            }}
          />
        </div>
        <div className={styles.tableScroll}>
          <table className={styles.table}>
            <thead>
              <tr>
                {['USUARIO', 'CORREO', 'ROL', 'ACCESO', 'ESTADO', 'ACCIONES'].map((h) => (
                  <th key={h}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {visible.map((u) => (
                <tr key={u.id}>
                  <td>
                    <strong>{u.displayName}</strong>
                    {u.id === user.id && <small>Tu cuenta</small>}
                  </td>
                  <td>{u.email}</td>
                  <td>{roleLabels[u.role]}</td>
                  <td>
                    {u.role === 'admin'
                      ? 'Todos los módulos'
                      : u.role === 'odontologo' || u.role === 'asistente'
                        ? 'Pacientes · Citas · Pagos'
                        : 'Panel de paciente'}
                  </td>
                  <td>
                                        <StatusToggle
                      active={u.active}
                      disabled={statusBusy === u.id || u.id === user.id}
                      label={`Cambiar estado de ${u.displayName} a ${u.active ? 'Inactivo' : 'Activo'}`}
                      onToggle={() => toggleUserStatus(u)}
                    />
                  </td>
                  <td>
                    <div className={styles.actions}>
                      <button
                        className={styles.iconButton}
                        aria-label={'Editar ' + u.displayName}
                        onClick={() => setEditing(u)}
                      >
                        <IconEdit />
                      </button>
                      <button
                        className={styles.iconButton + ' ' + styles.danger}
                        disabled={u.id === user.id}
                        aria-label={'Eliminar ' + u.displayName}
                        onClick={() => {
                          setRemove(u)
                          setError('')
                        }}
                      >
                        <IconTrash />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!rows.length && <p className={styles.empty}>No se encontraron usuarios.</p>}
        </div>
        <Pagination total={rows.length} page={page} onChange={setPage} size={7} noun="usuarios" />
      </section>
      {(params.get('nuevo') === '1' || editing) && (
        <UserForm
          account={editing}
          onClose={close}
          onSaved={() => {
            close()
            setNotice('Usuario guardado correctamente.')
          }}
        />
      )}
      <Modal
        open={!!remove}
        title="Eliminar usuario"
        onClose={() => {
          if (!busy) setRemove(null)
        }}
      >
        <p>¿Eliminar la cuenta de {remove?.displayName}? Ya no podrá iniciar sesión.</p>
        {error && (
          <p role="alert" className={styles.error}>
            {error}
          </p>
        )}
        <div className={styles.footer}>
          <Button variant="ghost" disabled={busy} onClick={() => setRemove(null)}>
            Cancelar
          </Button>
          <Button
            disabled={busy}
            onClick={async () => {
              setBusy(true)
              try {
                await deleteUser(remove.id)
                setRemove(null)
                setNotice('Usuario eliminado.')
              } catch (e) {
                setError(e.message)
              } finally {
                setBusy(false)
              }
            }}
          >
            {busy ? 'Eliminando…' : 'Eliminar'}
          </Button>
        </div>
      </Modal>
    </div>
  )
}
