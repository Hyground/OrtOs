import { env } from '@/config/env'
import styles from './Footer.module.css'

export function Footer() {
  return (
    <footer className={styles.root}>
      <div className={styles.inner}>
        <span>
          © {new Date().getFullYear()} {env.appName}
        </span>
      </div>
    </footer>
  )
}
