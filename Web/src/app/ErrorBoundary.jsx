import { Component } from 'react'
import styles from './ErrorBoundary.module.css'

export class ErrorBoundary extends Component {
  state = { hasError: false }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  componentDidCatch(error, info) {
    if (import.meta.env.DEV) {
      console.error(error, info)
    }
  }

  render() {
    if (!this.state.hasError) return this.props.children

    return (
      <div className={styles.root}>
        <div className={styles.card}>
          <h1>Algo salió mal</h1>
          <p>Ocurrió un error inesperado. Volvé a intentarlo.</p>
          <div className={styles.actions}>
            <button type="button" onClick={() => window.location.reload()}>
              Recargar
            </button>
            <a href="/">Ir al inicio</a>
          </div>
        </div>
      </div>
    )
  }
}
