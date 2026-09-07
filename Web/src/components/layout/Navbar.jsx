import { useEffect, useState } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { paths } from '@/app/routes/paths'
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

  useEffect(() => {
    setOpen(false)
  }, [pathname])

  useEffect(() => {
    if (!open) return undefined
    const onKeyDown = (event) => {
      if (event.key === 'Escape') setOpen(false)
    }
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', onKeyDown)
    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', onKeyDown)
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

        <Button to={paths.login} variant="outline" size="sm" className={styles.desktopLogin}>
          <IconUser className={styles.icon} />
          Iniciar sesión
        </Button>

        <button
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
          to={paths.login}
          variant="outline"
          size="sm"
          className={styles.drawerLogin}
          tabIndex={open ? 0 : -1}
        >
          <IconUser className={styles.icon} />
          Iniciar sesión
        </Button>
      </nav>
    </header>
  )
}
