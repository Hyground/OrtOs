import { contact } from '@/config/contact'
import { IconFacebook, IconPhone, IconTikTok, IconWhatsApp } from '@/components/icons/icons'
import styles from './Footer.module.css'

const socialIcons = {
  whatsapp: IconWhatsApp,
  facebook: IconFacebook,
  tiktok: IconTikTok,
}

export function Footer() {
  return (
    <footer className={styles.root}>
      <div className={styles.inner}>
        <nav className={styles.links} aria-label="Enlaces del pie de página">
          {contact.legalLinks.map(({ id, href, label }) => (
            <a key={id} href={href}>
              {label}
            </a>
          ))}
        </nav>

        <p className={styles.copy}>
          copyright {new Date().getFullYear()} @ todos los derechos reservados
        </p>

        <div className={styles.contact}>
          <a href={contact.phoneHref} className={styles.phone}>
            <IconPhone />
            {contact.phoneLabel}
          </a>
          <div className={styles.social}>
            {contact.social.map(({ id, href, label }) => {
              const Icon = socialIcons[id]
              return (
                <a key={id} href={href} aria-label={label}>
                  <Icon />
                </a>
              )
            })}
          </div>
        </div>
      </div>
    </footer>
  )
}
