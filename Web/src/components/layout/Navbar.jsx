import { useEffect, useRef, useState } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { paths } from '@/app/routes/paths'
import { useAuthDialog } from '@/features/auth/hooks/useAuthDialog'
import { Button } from '@/components/ui/Button/Button'
import {
  IconCalendar,
  IconClose,
  IconHome,
  IconMenu,
  IconServices,
  IconSpecialist,
  IconUser,
} from '@/components/icons/icons'
import styles from './Navbar.module.css'

const navItems = [
  { to: paths.home, label: 'Inicio', Icon: IconHome, end: true },
  { to: paths.services, label: 'Servicio', Icon: IconServices },
  { to: paths.specialists, label: 'Especialista', Icon: IconSpecialist },
  { to: paths.bookAppointment, label: 'Agendar cita', Icon: IconCalendar },
]

function navLinkClass({ isActive }) {
  return isActive ? `${styles.link} ${styles.linkActive}` : styles.link
}

export function Navbar() {
  const [open, setOpen] = useState(false)
  const { pathname } = useLocation()
  const { open: openLogin } = useAuthDialog()
  const toggleRef = useRef(null)
  const drawerRef = useRef(null)
  const closeRef = useRef(null)

  useEffect(() => {
    setOpen(false)
  }, [pathname])

  useEffect(() => {
    if (!open) return undefined

    const drawer = drawerRef.current
    const trigger = toggleRef.current
    closeRef.current?.focus()
    document.body.style.overflow = 'hidden'

    const onKeyDown = (event) => {
      if (event.key === 'Escape') {
        setOpen(false)
        return
      }
      if (event.key !== 'Tab' || !drawer) return
      const focusables = drawer.querySelectorAll(
        'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])',
      )
      if (focusables.length === 0) return
      const first = focusables[0]
      const last = focusables[focusables.length - 1]
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first.focus()
      }
    }

    window.addEventListener('keydown', onKeyDown)
    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', onKeyDown)
      trigger?.focus()
    }
  }, [open])

  return (
    <header className={styles.root}>
      <div className={styles.inner}>
        <NavLink to={paths.home} className={styles.brand} aria-label="OrtOs, inicio">
          Ort<span>Os</span>
        </NavLink>

        <nav className={styles.desktopNav} aria-label="Principal">
          <ul className={styles.pill}>
            {navItems.map(({ to, label, Icon, end }) => (
              <li key={to}>
                <NavLink to={to} end={end} className={navLinkClass}>
                  <Icon className={styles.icon} />
                  {label}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        <Button variant="outline" size="sm" className={styles.desktopLogin} onClick={openLogin}>
          <IconUser className={styles.icon} />
          Iniciar sesión
        </Button>

        <button
          ref={toggleRef}
          type="button"
          className={styles.toggle}
          aria-expanded={open}
          aria-controls="menu-movil"
          aria-label="Abrir menú"
          onClick={() => setOpen(true)}
        >
          <IconMenu />
        </button>
      </div>

      <div
        className={open ? `${styles.scrim} ${styles.scrimOpen}` : styles.scrim}
        onClick={() => setOpen(false)}
        aria-hidden="true"
      />

      <nav
        ref={drawerRef}
        id="menu-movil"
        className={open ? `${styles.drawer} ${styles.drawerOpen}` : styles.drawer}
        aria-label="Principal"
        aria-hidden={!open}
      >
        <div className={styles.drawerHead}>
          <span className={styles.brand}>
            Ort<span>Os</span>
          </span>
          <button
            ref={closeRef}
            type="button"
            className={styles.close}
            aria-label="Cerrar menú"
            onClick={() => setOpen(false)}
            tabIndex={open ? 0 : -1}
          >
            <IconClose />
          </button>
        </div>

        <ul>
          {navItems.map(({ to, label, Icon, end }) => (
            <li key={to}>
              <NavLink to={to} end={end} className={navLinkClass} tabIndex={open ? 0 : -1}>
                <Icon className={styles.icon} />
                {label}
              </NavLink>
            </li>
          ))}
        </ul>

        <Button
          variant="outline"
          size="sm"
          className={styles.drawerLogin}
          tabIndex={open ? 0 : -1}
          onClick={() => {
            setOpen(false)
            openLogin()
          }}
        >
          <IconUser className={styles.icon} />
          Iniciar sesión
        </Button>
      </nav>
    </header>
  )
}
