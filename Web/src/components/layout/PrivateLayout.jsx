import { Link, Outlet } from 'react-router-dom'
import { paths } from '@/app/routes/paths'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { Container } from './Container'
import styles from './Layout.module.css'

export function PrivateLayout() {
  const { user, logout } = useAuth()

  return (
    <div className={styles.root}>
      <header className={styles.privateHeader}>
        <div className={styles.privateHeaderInner}>
          <Link to={paths.dashboard} className={styles.brand}>
            Ort<span>Os</span>
          </Link>
          <div className={styles.session}>
            {user?.displayName ? <span>{user.displayName}</span> : null}
            <button type="button" onClick={logout} className={styles.logout}>
              Cerrar sesión
            </button>
          </div>
        </div>
      </header>
      <main className={styles.main}>
        <Container>
          <Outlet />
        </Container>
      </main>
    </div>
  )
}
