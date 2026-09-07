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
          onClick={() => setOpen((value) => !value)}
        >
          {open ? <IconClose /> : <IconMenu />}
          <span className={styles.srOnly}>Menú</span>
        </button>
      </div>

      <nav
        id="menu-movil"
        className={open ? `${styles.mobileNav} ${styles.mobileNavOpen}` : styles.mobileNav}
        aria-label="Principal"
        hidden={!open}
      >
        <ul>
          {navItems.map(({ to, label, Icon, end }) => (
            <li key={to}>
              <NavLink to={to} end={end} className={navLinkClass}>
                <Icon className={styles.icon} />
                {label}
              </NavLink>
            </li>
          ))}
        </ul>
        <Button to={paths.login} variant="outline" size="sm">
          <IconUser className={styles.icon} />
          Iniciar sesión
        </Button>
      </nav>
    </header>
  )
}
