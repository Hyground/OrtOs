import { Link, Outlet } from 'react-router-dom'
import { paths } from '@/app/routes/paths'
import { Container } from './Container'
import { Footer } from './Footer'
import { SkipLink, MAIN_ID } from './SkipLink'
import styles from './Layout.module.css'

export function MinimalLayout() {
  return (
    <div className={styles.root}>
      <SkipLink />
      <header className={styles.minimalHeader}>
        <Link to={paths.home} className={styles.brand} aria-label="OrtOs, inicio">
          Ort<span>Os</span>
        </Link>
      </header>
      <main id={MAIN_ID} className={styles.main}>
        <Container>
          <Outlet />
        </Container>
      </main>
      <Footer />
    </div>
  )
}
