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
  const [mobileOpen, setMobileOpen] = useState(false)
  const [collapsed, setCollapsed] = useState(false)
  const { user, logout } = useAuth()
  const workDate = formatWorkDate(new Date())

  const closeMobile = () => setMobileOpen(false)
  const toggleCollapsed = () => setCollapsed((prev) => !prev)

  const sidebarClasses = [
    styles.sidebar,
    mobileOpen ? styles.sidebarMobileOpen : '',
    collapsed ? styles.sidebarCollapsed : '',
  ]
    .filter(Boolean)
    .join(' ')

  const shellClasses = [styles.shell, collapsed ? styles.shellCollapsed : '']
    .filter(Boolean)
    .join(' ')

  return (
    <div className={shellClasses}>
      <SkipLink />
      <aside className={sidebarClasses} aria-label="Menú administrativo">
        {/* ── Header: hamburger + name ───────────────── */}
        <div className={styles.brandRow}>
          {/* Hamburger toggle (always visible) */}
          <button
            type="button"
            className={styles.toggleBtn}
            onClick={toggleCollapsed}
            aria-label={collapsed ? 'Expandir menú' : 'Colapsar menú'}
            title={collapsed ? 'Expandir menú' : 'Colapsar menú'}
          >
            <IconMenu />
          </button>

          {/* Brand name (hides when collapsed) */}
          <NavLink
            to={paths.dashboard}
            className={styles.brand}
            aria-label="OrtOs, panel principal"
          >
            Ort<span>Os</span>
          </NavLink>

          {/* Mobile: close button */}
          <button
            type="button"
            className={styles.closeSidebar}
            aria-label="Cerrar menú"
            onClick={closeMobile}
          >
            <IconClose />
          </button>
        </div>

        <div className={styles.divider} />

        {/* ── Navigation ─────────────────────────────── */}
        <nav className={styles.sideNav}>
          <span className={styles.navKicker}>Panel principal</span>
          <ul>
            {privateMenuItems.map(({ to, label, Icon, end }) => (
              <li key={to}>
                <NavLink
                  to={to}
                  end={end}
                  className={menuClass}
                  onClick={closeMobile}
                  title={collapsed ? label : undefined}
                >
                  <span className={styles.menuIconWrap}>
                    <Icon />
                  </span>
                  <span className={styles.menuLabel}>{label}</span>
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        <div className={styles.divider} />

        {/* ── Profile ────────────────────────────────── */}
        <div className={styles.profile}>
          <span className={styles.avatar} title={collapsed ? (user?.displayName ?? 'Admin') : undefined}>
            <IconUser />
          </span>
          <div className={styles.profileInfo}>
            <strong>{user?.displayName ?? 'Admin el OrtOs'}</strong>
            <span className={styles.profileStatus}>
              <span className={styles.statusDot} />
              En línea
            </span>
          </div>
          <button type="button" onClick={logout} aria-label="Cerrar sesión" title="Cerrar sesión">
            <IconLogOut />
          </button>
        </div>
      </aside>

      {/* ── Scrim (mobile overlay) ────────────────── */}
      <button
        type="button"
        className={mobileOpen ? `${styles.scrim} ${styles.scrimOpen}` : styles.scrim}
        aria-label="Cerrar menú"
        onClick={closeMobile}
      />

      {/* ── Workspace ────────────────────────────── */}
      <div className={styles.workspace}>
        <header className={styles.topbar}>
          <button
            type="button"
            className={styles.mobileMenu}
            aria-label="Abrir menú"
            aria-expanded={mobileOpen}
            onClick={() => setMobileOpen(true)}
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
