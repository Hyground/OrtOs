import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { Button } from '@/components/ui/Button/Button'
import { IconCalendar } from '@/components/icons/icons'
import { paths } from '@/app/routes/paths'
import heroImage from '@/assets/hero-placeholder.svg'
import styles from './HomePage.module.css'

const stats = [
  { value: '+100k', label: 'Pacientes felices', tone: styles.tonePrimary },
  { value: '100%', label: 'Sin dolor', tone: styles.toneTeal },
  { value: '15+', label: 'Especialistas', tone: styles.toneInk },
]

export function HomePage() {
  useDocumentTitle('Inicio')

  return (
    <section className={styles.hero}>
      <div className={styles.inner}>
        <div className={styles.content}>
          <span className={styles.badge}>Tu clínica de confianza</span>

          <h1 className={styles.title}>
            La sonrisa <span>fresca y sana</span> que mereces.
          </h1>

          <p className={styles.lead}>
            En OrtOs combinamos odontología estética de vanguardia con un ambiente confortable en
            tonos celeste menta, diseñados para brindarte máxima paz y tranquilidad.
          </p>

          <div className={styles.actions}>
            <Button to={paths.bookAppointment} variant="primary">
              Agendar cita ahora
              <IconCalendar />
            </Button>
            <Button to={paths.services} variant="secondary">
              Explorar tratamientos
            </Button>
          </div>

          <ul className={styles.stats}>
            {stats.map(({ value, label, tone }) => (
              <li key={label}>
                <strong className={tone}>{value}</strong>
                <span>{label}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className={styles.media}>
          <img src={heroImage} alt="Atención odontológica en OrtOs" />
        </div>
      </div>
    </section>
  )
}
