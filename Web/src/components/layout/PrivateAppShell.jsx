import { useState } from 'react'
import { NavLink, Outlet } from 'react-router-dom'
import { paths } from '@/app/routes/paths'
import { privateMenuItems } from '@/app/routes/navigation'
import { useAuth } from '@/features/auth/hooks/useAuth'
import {
  IconBell,
  IconCalendar,
  IconClose,
  IconLogOut,
  IconMenu,
  IconPlus,
  IconSearch,
  IconUser,
} from '@/components/icons/icons'
import { Button } from '@/components/ui/Button/Button'
import { FloatingChat } from '@/components/communication/FloatingChat'
import { SkipLink, MAIN_ID } from './SkipLink'
import styles from './PrivateAppShell.module.css'

function menuClass({ isActive }) {
  return isActive ? `${styles.menuLink} ${styles.menuLinkActive}` : styles.menuLink
}

function formatWorkDate(date) {
  return new Intl.DateTimeFormat('es-GT', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  })
    .format(date)
    .toUpperCase()
}

export function PrivateAppShell() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { user, logout } = useAuth()
  const workDate = formatWorkDate(new Date())

  const closeSidebar = () => setSidebarOpen(false)

  return (
    <div className={styles.shell}>
      <SkipLink />
      <aside
        className={sidebarOpen ? `${styles.sidebar} ${styles.sidebarOpen}` : styles.sidebar}
        aria-label="Menú administrativo"
      >
        <div className={styles.brandRow}>
          <NavLink
            to={paths.dashboard}
            className={styles.brand}
            aria-label="OrtOs, panel principal"
          >
            Ort<span>Os</span>
          </NavLink>
          <button
            type="button"
            className={styles.closeSidebar}
            aria-label="Cerrar menú"
            onClick={closeSidebar}
          >
            <IconClose />
          </button>
        </div>

        <nav className={styles.sideNav}>
          <span className={styles.navKicker}>Panel principal</span>
          <ul>
            {privateMenuItems.map(({ to, label, Icon, end }) => (
              <li key={to}>
                <NavLink to={to} end={end} className={menuClass} onClick={closeSidebar}>
                  <Icon />
                  <span>{label}</span>
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        <div className={styles.profile}>
          <span className={styles.avatar}>
            <IconUser />
          </span>
          <strong>{user?.displayName ?? 'Admin el OrtOs'}</strong>
          <span>En línea (Administrador)</span>
          <button type="button" onClick={logout} aria-label="Cerrar sesión">
            <IconLogOut />
          </button>
        </div>
      </aside>

      <button
        type="button"
        className={sidebarOpen ? `${styles.scrim} ${styles.scrimOpen}` : styles.scrim}
        aria-label="Cerrar menú"
        onClick={closeSidebar}
      />

      <div className={styles.workspace}>
        <header className={styles.topbar}>
          <button
            type="button"
            className={styles.mobileMenu}
            aria-label="Abrir menú"
            aria-expanded={sidebarOpen}
            onClick={() => setSidebarOpen(true)}
          >
            <IconMenu />
          </button>

          <label className={styles.searchBox}>
            <IconSearch />
            <span className={styles.srOnly}>Buscar</span>
            <input type="search" placeholder="Buscar paciente, expediente, folio cita ..." />
          </label>

          <div className={styles.dateBox}>
            <IconCalendar />
            <span>{workDate}</span>
          </div>

          <Button to={paths.appointments} variant="primary" size="sm" className={styles.newButton}>
            <IconPlus />
            Nueva cita
          </Button>

          <button type="button" className={styles.notification} aria-label="Notificaciones">
            <IconBell />
            <span aria-hidden="true">1</span>
          </button>
        </header>

        <main id={MAIN_ID} className={styles.main}>
          <Outlet />
        </main>
      </div>
      <FloatingChat />
    </div>
  )
}
