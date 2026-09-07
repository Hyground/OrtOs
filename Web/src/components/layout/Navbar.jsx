import { NavLink } from 'react-router-dom'
import { env } from '@/config/env'
import { paths } from '@/app/routes/paths'
import styles from './Navbar.module.css'

const links = [
  { to: paths.home, label: 'Inicio', end: true },
  { to: paths.services, label: 'Servicios' },
  { to: paths.bookAppointment, label: 'Agendar cita' },
]

export function Navbar() {
  return (
    <header className={styles.root}>
      <div className={styles.inner}>
        <NavLink to={paths.home} className={styles.brand}>
          {env.appName}
        </NavLink>

        <nav aria-label="Principal">
          <ul className={styles.links}>
            {links.map((link) => (
              <li key={link.to}>
                <NavLink
                  to={link.to}
                  end={link.end}
                  className={({ isActive }) =>
                    isActive ? `${styles.link} ${styles.linkActive}` : styles.link
                  }
                >
                  {link.label}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        <NavLink to={paths.login} className={styles.login}>
          Iniciar sesión
        </NavLink>
      </div>
    </header>
  )
}
