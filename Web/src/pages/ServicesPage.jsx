import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { Container } from '@/components/layout/Container'
import { IconArrowRight, IconShield, IconSparkle, IconTooth } from '@/components/icons/icons'
import { useServices } from '@/features/services'
import styles from './ServicesPage.module.css'

const categoryIcons = {
  'Estética dental': IconSparkle,
  Prevención: IconShield,
}

function ServiceIcon({ category }) {
  const Icon = categoryIcons[category] ?? IconTooth
  return <Icon />
}

export function ServicesPage() {
  useDocumentTitle('Servicios')
  const { status, services } = useServices()

  return (
    <section className={styles.page}>
      <Container>
        <header className={styles.header}>
          <span className={styles.badge}>Servicios</span>
          <h1>Tratamientos y especialidades</h1>
          <p>
            Cuidamos tu sonrisa con un equipo especializado y tecnología de vanguardia, en un
            ambiente pensado para tu tranquilidad.
          </p>
        </header>

        {status === 'loading' ? (
          <div className={styles.grid} aria-hidden="true">
            {Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className={styles.skeleton} />
            ))}
          </div>
        ) : (
          <ul className={styles.grid}>
            {services.map((service) => (
              <li key={service.id} className={styles.card}>
                <span className={styles.cardIcon}>
                  <ServiceIcon category={service.category} />
                </span>
                <h2>{service.name}</h2>
                <p>{service.description}</p>
                <div className={styles.cardFoot}>
                  {service.category ? (
                    <span className={styles.chip}>{service.category}</span>
                  ) : (
                    <span />
                  )}
                  <IconArrowRight className={styles.arrow} />
                </div>
              </li>
            ))}
          </ul>
        )}
      </Container>
    </section>
  )
}
