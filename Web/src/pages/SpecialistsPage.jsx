import { useMemo, useState } from 'react'
import { IconMedical, IconSpecialist, IconTooth } from '@/components/icons/icons'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import img1 from '@/assets/1.webp'
import img2 from '@/assets/2.webp'
import img3 from '@/assets/3.webp'
import img4 from '@/assets/4.webp'
import styles from './SpecialistsPage.module.css'

const filters = ['Todos', 'Ortodoncia', 'Cirugia oral', 'Estetica dental', 'Odontopediatria']

const specialists = [
  {
    id: 'ortodoncia',
    name: 'Dra. Elena Gomez',
    specialty: 'Ortodoncia',
    focus: 'Alineadores transparentes, brackets esteticos y seguimiento de mordida.',
    image: img1,
    tags: ['Invisalign', 'Brackets', 'Mordida'],
  },
  {
    id: 'cirugia',
    name: 'Dr. Carlos Mendoza',
    specialty: 'Cirugia oral',
    focus: 'Extracciones, implantes y cirugia guiada con planificacion digital.',
    image: img2,
    tags: ['Implantes', 'Cirugia 3D', 'Sedacion'],
  },
  {
    id: 'estetica',
    name: 'Dra. Sofia Ramirez',
    specialty: 'Estetica dental',
    focus: 'Diseno de sonrisa, carillas, blanqueamiento y rehabilitacion estetica.',
    image: img4,
    tags: ['Carillas', 'Blanqueamiento', 'Diseno'],
  },
  {
    id: 'pediatria',
    name: 'Dra. Maria Lopez',
    specialty: 'Odontopediatria',
    focus: 'Atencion preventiva y tratamientos amigables para ninos y adolescentes.',
    image: img3,
    tags: ['Ninos', 'Prevencion', 'Sellantes'],
  },
]

export function SpecialistsPage() {
  useDocumentTitle('Especialistas')
  const [active, setActive] = useState('Todos')
  const visible = useMemo(
    () => (active === 'Todos' ? specialists : specialists.filter((item) => item.specialty === active)),
    [active],
  )

  return (
    <main className={styles.page}>
      <section className={styles.hero}>
        <div>
          <span className={styles.eyebrow}>Cuerpo medico certificado</span>
          <h1>Especialistas en salud bucal</h1>
          <p>
            Un equipo cercano y preparado para orientarte con confianza desde la primera evaluacion.
          </p>
        </div>
      </section>

      <section className={styles.filters} aria-label="Filtrar especialistas por area">
        {filters.map((filter) => (
          <button
            key={filter}
            type="button"
            className={active === filter ? styles.activeFilter : ''}
            onClick={() => setActive(filter)}
          >
            {filter}
          </button>
        ))}
      </section>

      <section className={styles.grid} aria-label="Especialistas disponibles">
        {visible.map((specialist) => (
          <article className={styles.card} key={specialist.id}>
            <div className={styles.photoWrap}>
              <img src={specialist.image} alt={specialist.name} />
            </div>

            <div className={styles.cardBody}>
              <div className={styles.heading}>
                <span>{specialist.specialty}</span>
                <h2>{specialist.name}</h2>
              </div>
              <p>{specialist.focus}</p>

              <div className={styles.tags}>
                {specialist.tags.map((tag) => <span key={tag}>{tag}</span>)}
              </div>
            </div>
          </article>
        ))}
      </section>

      <section className={styles.summaryBand}>
        <div>
          <IconSpecialist />
          <strong>Equipo multidisciplinario</strong>
          <span>Casos evaluados por el area clinica adecuada.</span>
        </div>
        <div>
          <IconTooth />
          <strong>Tratamientos integrales</strong>
          <span>Ortodoncia, estetica, implantes, cirugia y cuidado preventivo.</span>
        </div>
        <div>
          <IconMedical />
          <strong>Atencion documentada</strong>
          <span>Seguimiento ordenado desde diagnostico hasta control.</span>
        </div>
      </section>
    </main>
  )
}