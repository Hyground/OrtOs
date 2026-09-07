import { Outlet } from 'react-router-dom'
import { Navbar } from './Navbar'
import { Footer } from './Footer'
import { SkipLink, MAIN_ID } from './SkipLink'
import styles from './Layout.module.css'

export function PublicLayout() {
  return (
    <div className={styles.root}>
      <SkipLink />
      <Navbar />
      <main id={MAIN_ID} className={styles.main}>
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}
