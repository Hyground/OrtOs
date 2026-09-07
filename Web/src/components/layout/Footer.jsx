import { IconFacebook, IconPhone, IconTikTok, IconWhatsApp } from '@/components/icons/icons'
import styles from './Footer.module.css'

const PHONE_LABEL = '+502 7780-7713'
const PHONE_HREF = 'tel:+50277807713'

const pageLinks = [
  { href: '#contacto', label: 'contactos' },
  { href: '#politica', label: 'política' },
  { href: '#nosotros', label: 'sobre nosotros' },
]

const socialLinks = [
  { href: '#', label: 'WhatsApp', Icon: IconWhatsApp },
  { href: '#', label: 'Facebook', Icon: IconFacebook },
  { href: '#', label: 'TikTok', Icon: IconTikTok },
]

export function Footer() {
  return (
    <footer className={styles.root}>
      <div className={styles.inner}>
        <nav className={styles.links} aria-label="Enlaces del pie de página">
          {pageLinks.map(({ href, label }) => (
            <a key={label} href={href}>
              {label}
            </a>
          ))}
        </nav>

        <p className={styles.copy}>
          copyright {new Date().getFullYear()} @ todos los derechos reservados
        </p>

        <div className={styles.contact}>
          <a href={PHONE_HREF} className={styles.phone}>
            <IconPhone />
            {PHONE_LABEL}
          </a>
          <div className={styles.social}>
            {socialLinks.map(({ href, label, Icon }) => (
              <a key={label} href={href} aria-label={label}>
                <Icon />
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}
