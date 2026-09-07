import { Outlet } from 'react-router-dom'
import { Navbar } from './Navbar'
import { Footer } from './Footer'
import styles from './Layout.module.css'

export function PublicLayout() {
  return (
    <div className={styles.root}>
      <Navbar />
      <main className={styles.main}>
        <div className={styles.content}>
          <Outlet />
        </div>
      </main>
      <Footer />
    </div>
  )
}
