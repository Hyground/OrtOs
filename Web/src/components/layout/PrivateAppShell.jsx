import { useState } from 'react'
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { paths } from '@/app/routes/paths'
import { patientMenuItems, privateMenuItems } from '@/app/routes/navigation'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { canAccess, roleLabels } from '@/features/auth/permissions'
import {
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
import { Notifications } from '@/features/notifications/Notifications'
import { ThemeControl } from '@/features/appearance/ThemeControl'
import { SkipLink, MAIN_ID } from './SkipLink'
import styles from './PrivateAppShell.module.css'

function menuClass(isActive) {
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
  const [search, setSearch] = useState('')
  const location = useLocation()
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const action = user?.role === 'paciente' ? null :
    location.pathname === paths.users
      ? { to: paths.users + '?nuevo=1', label: 'NUEVO USUARIO' }
      : location.pathname === paths.patients
        ? { to: paths.newPatient, label: 'NUEVO PACIENTE' }
        : location.pathname === paths.doctors
          ? { to: paths.doctors + '?nuevo=1', label: 'NUEVO MÉDICO' }
        : location.pathname === paths.payments
          ? { to: paths.newPayment, label: 'NUEVO PAGO' }
          : location.pathname === paths.summary || location.pathname === paths.appointmentHistory
            ? null
          : { to: paths.newAppointment, label: 'NUEVA CITA' }
  const workDate = formatWorkDate(new Date())
  const menuItems = user?.role === 'paciente' ? patientMenuItems : privateMenuItems
  const showGlobalSearch = location.pathname !== paths.summary

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
            {menuItems
              .filter((item) => user?.role === 'paciente' || canAccess(user, item.to))
              .map(({ to, label, Icon, end, tone, activePaths }) => (
                <li key={to}>
                  <NavLink
                    to={to}
                    end={end}
                    className={(state) =>
                      [
                        menuClass(state.isActive || activePaths?.includes(location.pathname)),
                        tone === 'users' ? styles.usersLink : '',
                      ].join(' ')
                    }
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
          <span
            className={styles.avatar}
            title={collapsed ? (user?.displayName ?? 'Admin') : undefined}
          >
            <IconUser />
          </span>
          <div className={styles.profileInfo}>
            <strong>{user?.displayName ?? 'Admin el OrtOs'}</strong>
            <span className={styles.profileStatus}>
              <span className={styles.statusDot} />
              En línea · {roleLabels[user?.role] ?? 'Usuario'}
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

          {showGlobalSearch ? (
            <form
              className={styles.searchBox}
              onSubmit={(event) => {
                event.preventDefault()
                navigate(paths.patients + '?q=' + encodeURIComponent(search))
              }}
            >
              <IconSearch />
              <label htmlFor="global-patient-search" className={styles.srOnly}>
                Buscar paciente, expediente o folio
              </label>
              <input
                id="global-patient-search"
                type="search"
                placeholder="Buscar paciente, expediente, folio cita..."
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />
            </form>
          ) : null}

          <div className={styles.dateBox}>
            <IconCalendar />
            <span>{workDate}</span>
          </div>

          {action ? <Button to={action.to} variant="primary" size="sm" className={styles.newButton}>
            <IconPlus />
            {action.label}
          </Button> : null}
          <div className={styles.topActions}>
            <ThemeControl />
            <FloatingChat placement="toolbar" />
            <Notifications />
          </div>
        </header>

        <main id={MAIN_ID} className={styles.main}>
          <Outlet />
        </main>
      </div>
    </div>
  )
}
