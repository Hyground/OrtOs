import { Link, Outlet } from 'react-router-dom'
import { env } from '@/config/env'
import { paths } from '@/app/routes/paths'
import { useAuth } from '@/features/auth/hooks/useAuth'
import styles from './Layout.module.css'

export function PrivateLayout() {
  const { user, logout } = useAuth()

  return (
    <div className={styles.root}>
      <header className={styles.privateHeader}>
        <div className={styles.privateHeaderInner}>
          <Link to={paths.dashboard} className={styles.brand}>
            {env.appName}
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
        <div className={styles.content}>
          <Outlet />
        </div>
      </main>
    </div>
  )
}
