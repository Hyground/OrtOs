import { Link } from 'react-router-dom'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { paths } from '@/app/routes/paths'
import { privateModules } from '@/app/routes/navigation'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { canAccess, roleLabels } from '@/features/auth/permissions'
import { IconCalendar, IconCheckCircle, IconClock, IconUser } from '@/components/icons/icons'
import styles from './DashboardPage.module.css'
import { PatientPortal } from '@/features/portal/PatientPortal'

const metrics = [
  { value: '24', label: 'Citas esta semana', tone: 'cyan' },
  { value: '5', label: 'Citas del dia', tone: 'teal' },
  { value: '12', label: 'Pacientes activos', tone: 'blue' },
]

const agenda = [
  { time: '09:00', patient: 'Maria Lopez', detail: 'Limpieza dental' },
  { time: '10:30', patient: 'Carlos Mendez', detail: 'Control de ortodoncia' },
  { time: '12:00', patient: 'Ana Rivera', detail: 'Evaluacion inicial' },
]

const operations = [
  'Confirmar citas pendientes de hoy.',
  'Revisar expedientes con tratamiento activo.',
  'Actualizar pagos y presupuestos recientes.',
]

export function DashboardPage() {
  useDocumentTitle('Panel')
  const { user } = useAuth()
  const isDentist = user?.role === 'odontologo'
  if (user?.role === 'paciente') return <PatientPortal />
  const modules = privateModules.filter((module) => canAccess(user, module.to))

  return (
    <section className={styles.page}>
      <header className={styles.hero}>
        <div className={styles.heroCopy}>
          <span className={styles.kicker}>
            {isDentist ? 'Panel del odontólogo' : 'Panel principal'}
          </span>
          <h1>Hola, {user?.displayName ?? 'Usuario'}</h1>
          <p>
            {isDentist
              ? 'Consulta pacientes y expedientes, organiza las citas y registra pagos desde tu espacio de trabajo.'
              : user?.role === 'admin'
                ? 'Administra los módulos de la clínica y las cuentas de acceso del equipo.'
                : 'Bienvenido a tu panel. Las funciones clínicas están reservadas al personal autorizado.'}
          </p>
        </div>

        <dl className={styles.metrics}>
          {metrics.map((metric) => (
            <div key={metric.label} data-tone={metric.tone}>
              <dt>{metric.label}</dt>
              <dd>{metric.value}</dd>
            </div>
          ))}
        </dl>
      </header>

      <div className={styles.contentGrid}>
        <section className={styles.modulesSection} aria-labelledby="modules-title">
          <div className={styles.sectionHead}>
            <div>
              <span>Modulo de gestion</span>
              <h2 id="modules-title">Areas de trabajo</h2>
            </div>
            {canAccess(user, paths.appointments) && (
              <Link to={paths.newAppointment} className={styles.quickLink}>
                Nueva cita
              </Link>
            )}
          </div>

          <ul className={styles.moduleGrid}>
            {modules.map((module) => {
              const Icon = module.Icon
              return (
                <li key={module.id}>
                  <Link
                    to={module.to}
                    className={[
                      styles.moduleCard,
                      module.tone === 'users' ? styles.usersCard : '',
                    ].join(' ')}
                  >
                    <span className={styles.moduleIcon} data-asset={module.assetName}>
                      {module.imageSrc ? <img src={module.imageSrc} alt="" /> : <Icon />}
                    </span>
                    <span className={styles.moduleText}>
                      <strong>{module.title}</strong>
                      <span>{module.description}</span>
                    </span>
                  </Link>
                </li>
              )
            })}
          </ul>
        </section>

        {canAccess(user, paths.appointments) && (
          <aside className={styles.sidePanel} aria-label="Resumen operativo">
            <article className={styles.todayCard}>
              <div className={styles.panelTitle}>
                <span className={styles.panelIcon}>
                  <IconCalendar />
                </span>
                <div>
                  <h2>Agenda de hoy</h2>
                  <p>Atenciones proximas</p>
                </div>
              </div>

              <ol className={styles.agendaList}>
                {agenda.map((item) => (
                  <li key={`${item.time}-${item.patient}`}>
                    <time>{item.time}</time>
                    <span>
                      <strong>{item.patient}</strong>
                      <small>{item.detail}</small>
                    </span>
                  </li>
                ))}
              </ol>
            </article>

            <article className={styles.opsCard}>
              <div className={styles.panelTitle}>
                <span className={styles.panelIcon}>
                  <IconClock />
                </span>
                <div>
                  <h2>Prioridades</h2>
                  <p>Seguimiento administrativo</p>
                </div>
              </div>

              <ul className={styles.opsList}>
                {operations.map((item) => (
                  <li key={item}>
                    <IconCheckCircle />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </article>

            <article className={styles.profileCard}>
              <IconUser />
              <span>
                <strong>{roleLabels[user?.role]}</strong>
                <small>Sesion de desarrollo activa</small>
              </span>
            </article>
          </aside>
        )}
      </div>
    </section>
  )
}
