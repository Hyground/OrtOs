import { useEffect, useRef, useState } from 'react'
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

const dayWords = [
  '',
  'uno',
  'dos',
  'tres',
  'cuatro',
  'cinco',
  'seis',
  'siete',
  'ocho',
  'nueve',
  'diez',
  'once',
  'doce',
  'trece',
  'catorce',
  'quince',
  'dieciséis',
  'diecisiete',
  'dieciocho',
  'diecinueve',
  'veinte',
  'veintiuno',
  'veintidós',
  'veintitrés',
  'veinticuatro',
  'veinticinco',
  'veintiséis',
  'veintisiete',
  'veintiocho',
  'veintinueve',
  'treinta',
  'treinta y uno',
]

function formatWorkDate(date) {
  return new Intl.DateTimeFormat('en-GB', {
    timeZone: 'America/Guatemala',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(date)
}

function formatWrittenDate(date) {
  const weekday = new Intl.DateTimeFormat('es-GT', { weekday: 'long' }).format(date)
  const weekdayCap = weekday.charAt(0).toUpperCase() + weekday.slice(1)
  const dayNum = date.getDate()
  const dayWord = dayWords[dayNum] || String(dayNum)
  const month = new Intl.DateTimeFormat('es-GT', { month: 'long' }).format(date).toLowerCase()
  return `${weekdayCap}, ${dayWord} de ${month}`
}

export function PrivateAppShell() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [collapsed, setCollapsed] = useState(() =>
    window.matchMedia?.('(min-width: 681px) and (max-width: 1040px)').matches ?? false,
  )

  useEffect(() => {
    const mediumScreen = window.matchMedia?.('(min-width: 681px) and (max-width: 1040px)')
    if (!mediumScreen) return undefined
    const onBreakpointChange = () => setCollapsed(mediumScreen.matches)
    mediumScreen.addEventListener('change', onBreakpointChange)
    return () => mediumScreen.removeEventListener('change', onBreakpointChange)
  }, [])
  const [search, setSearch] = useState('')
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false)
  const searchInputRef = useRef(null)
  const location = useLocation()
  const navigate = useNavigate()

  useEffect(() => {
    if (mobileSearchOpen) searchInputRef.current?.focus()
  }, [mobileSearchOpen])

  useEffect(() => {
    setMobileSearchOpen(false)
  }, [location.pathname])
  const { user, logout } = useAuth()
  const action =
    user?.role === 'paciente' ? null : { to: paths.newAppointment, label: 'NUEVA CITA' }
  const workDate = formatWorkDate(new Date())
  const menuItems = user?.role === 'paciente' ? patientMenuItems : privateMenuItems
  const isDashboardRoute =
    location.pathname === paths.dashboard ||
    location.pathname === '/panel/dashboard' ||
    location.pathname === '/panel/modulos'

  const showGlobalSearch =
    !isDashboardRoute &&
    location.pathname !== paths.summary &&
    !location.pathname.startsWith(paths.doctors) &&
    !location.pathname.startsWith(paths.specialties) &&
    !location.pathname.startsWith(paths.reports)

  const isSpecialtiesRoute = location.pathname.startsWith(paths.specialties)
  const showWrittenDate = isDashboardRoute || isSpecialtiesRoute
  const writtenDate = formatWrittenDate(new Date())

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
            aria-expanded={!collapsed}
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
              .map(({ to, label, Icon, end, activePaths }) => (
                <li key={to}>
                  <NavLink
                    to={to}
                    end={end}
                    className={(state) =>
                      menuClass(state.isActive || activePaths?.includes(location.pathname))
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
        <header className={mobileSearchOpen ? `${styles.topbar} ${styles.topbarSearchOpen}` : styles.topbar}>
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
            <button
              type="button"
              className={styles.mobileSearchButton}
              aria-label={mobileSearchOpen ? 'Cerrar búsqueda' : 'Buscar paciente'}
              aria-expanded={mobileSearchOpen}
              onClick={() => setMobileSearchOpen((current) => !current)}
            >
              <IconSearch />
            </button>
          ) : null}

          {showGlobalSearch ? (
            <form
              className={styles.searchBox}
              onSubmit={(event) => {
                event.preventDefault()
                setMobileSearchOpen(false)
                navigate(paths.patients + '?q=' + encodeURIComponent(search))
              }}
            >
              <IconSearch />
              <label htmlFor="global-patient-search" className={styles.srOnly}>
                Buscar paciente, expediente o folio
              </label>
              <input
                ref={searchInputRef}
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
            {showWrittenDate ? (
              <span className={styles.writtenDate}>{writtenDate}</span>
            ) : null}
          </div>

          {action ? <Button to={action.to} variant="primary" size="sm" className={styles.newButton}>
            <IconPlus />
            {action.label}
          </Button> : null}
          <div className={styles.topActions}>
            <ThemeControl />
            <FloatingChat />
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
