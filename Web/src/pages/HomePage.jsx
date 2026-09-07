import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { Button } from '@/components/ui/Button/Button'
import { Carousel } from '@/components/ui/Carousel/Carousel'
import { IconCalendar } from '@/components/icons/icons'
import { paths } from '@/app/routes/paths'
import img1 from '@/assets/1.webp'
import img2 from '@/assets/2.webp'
import img3 from '@/assets/3.webp'
import img4 from '@/assets/4.webp'
import img5 from '@/assets/5.webp'
import styles from './HomePage.module.css'

const heroImages = [
  { src: img1, alt: 'Paciente y odontólogos durante una consulta en OrtOs' },
  { src: img2, alt: 'Odontólogo de OrtOs en el consultorio' },
  { src: img3, alt: 'Revisión dental a una paciente' },
  { src: img4, alt: 'Sonrisa sana después del tratamiento' },
  { src: img5, alt: 'Colocación de brackets' },
]

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

        <Carousel images={heroImages} className={styles.media} />
      </div>
    </section>
  )
}
