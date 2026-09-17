import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { paths } from '@/app/routes/paths'
import { privateModules } from '@/app/routes/navigation'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { canAccess, roleLabels } from '@/features/auth/permissions'
import { IconCalendar, IconCheckCircle, IconClock, IconUser } from '@/components/icons/icons'
import styles from './DashboardPage.module.css'
import { PatientPortal } from '@/features/portal/PatientPortal'
import { Modal } from '@/components/ui/Modal/Modal'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog/ConfirmDialog'
import { useReviewInbox } from '@/features/clinical/reviewInboxStore'
import { useClinic, displayDate, money } from '@/features/clinical/mockStore'
import { IconCreditCard } from '@/components/icons/icons'

const metrics = [
  { value: '24', label: 'Semana', tone: 'cyan' },
  { value: '5', label: 'Día', tone: 'teal' },
  { value: '11', label: 'Pendientes', tone: 'blue' },
]

const agenda = [
  { time: '09:00', patient: 'Maria Lopez', detail: 'Limpieza dental' },
  { time: '10:30', patient: 'Carlos Mendez', detail: 'Control de ortodoncia' },
  { time: '12:00', patient: 'Ana Rivera', detail: 'Evaluacion inicial' },
]

const demoTasks = Array.from({ length: 50 }, (_, index) => ({
  id: 'demo-' + (index + 1),
  Icon: index % 2 === 0 ? IconCalendar : IconCreditCard,
  action: index % 2 === 0 ? 'Aprobar cita' : 'Verificar pago',
  title: (index % 2 === 0 ? 'Solicitud de cita' : 'Transferencia por verificar') + ' #' + (index + 1),
  detail: 'Ejemplo · No modifica datos reales',
}))

const operations = [
  'Confirmar citas pendientes de hoy.',
  'Revisar expedientes con tratamiento activo.',
  'Actualizar pagos y presupuestos recientes.',
]

export function DashboardPage() {
  useDocumentTitle('Panel')
  const { user } = useAuth()
  const reviewInbox = useReviewInbox()
  const clinic = useClinic()
  const [tasksOpen, setTasksOpen] = useState(false)
  const [demoResolved, setDemoResolved] = useState([])
  const [demoConfirming, setDemoConfirming] = useState(null)
  if (user?.role === 'paciente') return <PatientPortal />
  const modules = privateModules.filter((module) => canAccess(user, module.to))
  const patientName = (id) => clinic.patients.find((patient) => patient.id === id)?.name ?? 'Paciente'
  const tasks = [
    ...reviewInbox.appointmentRequests
      .filter((item) => item.status === 'Por aprobar' && canAccess(user, paths.appointments))
      .map((item) => ({
        id: item.id,
        Icon: IconCalendar,
        title: 'Aprobar cita de ' + patientName(item.patientId),
        detail: displayDate(item.date) + ' · ' + item.time + ' · ' + item.treatment,
        to: paths.appointments + '#solicitudes',
      })),
    ...reviewInbox.paymentReports
      .filter((item) => item.status === 'Por verificar' && canAccess(user, paths.payments))
      .map((item) => ({
        id: item.id,
        Icon: IconCreditCard,
        title: 'Verificar transferencia de ' + patientName(item.patientId),
        detail: money(item.amount) + ' · Ref. ' + item.reference,
        to: paths.payments + '#verificaciones',
      })),
  ]
  const visibleTasks = [...tasks, ...demoTasks.filter((item) => !demoResolved.includes(item.id))]
  const pendingWork = visibleTasks.length
  return (
    <section className={styles.page}>
      <header className={styles.hero}>
        <div className={styles.heroCopy}>
          <h1>Bienvenido, {user?.displayName ?? 'Usuario'}</h1>
        </div>

        <div className={styles.heroSummary}>
          <div className={styles.metricsBlock}>
            <h2>Citas</h2>
            <dl className={styles.metrics}>
              {metrics.map((metric) => (
                <div key={metric.label} data-tone={metric.tone}>
                  <dt>{metric.label}</dt>
                  <dd>{metric.value}</dd>
                </div>
              ))}
            </dl>
          </div>
          <button
            type="button"
            className={styles.taskLauncher}
            aria-label={'Tareas pendientes, ' + pendingWork}
            onClick={() => setTasksOpen(true)}
          >
            <span>Tareas pendientes</span>
            <strong data-empty={pendingWork === 0}>{pendingWork}</strong>
          </button>
        </div>
      </header>

      <Modal open={tasksOpen} size="review" title="Tareas pendientes" onClose={() => { setTasksOpen(false); setDemoConfirming(null) }}>
        <div className={styles.attentionPanel}>
          <p className={styles.taskIntro}>
            {tasks.length} reales · {pendingWork - tasks.length} de ejemplo. Selecciona una tarea para aprobarla o verificarla.
          </p>
          {visibleTasks.length ? (
            <ul className={styles.attentionGrid} aria-label="Tareas pendientes">
              {visibleTasks.map(({ id, Icon, title, detail, to, action }) => (
                <li key={id}>
                  {action ? (
                    <div className={styles.attentionLink}>
                      <Icon />
                      <span><strong>{title}</strong><small>{detail}</small></span>
                      <button type="button" className={styles.previewAction} onClick={() => setDemoConfirming({ id, title, action })}>{action}</button>
                    </div>
                  ) : (
                    <Link to={to} className={styles.attentionLink} onClick={() => setTasksOpen(false)}>
                      <Icon />
                      <span><strong>{title}</strong><small>{detail}</small></span>
                      <span className={styles.reviewAction}>{to === paths.appointments + '#solicitudes' ? 'Aprobar cita →' : 'Verificar pago →'}</span>
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          ) : (
            <p className={styles.taskEmpty}>Todo al día.</p>
          )}
        </div>
      </Modal>
      <ConfirmDialog
        open={!!demoConfirming}
        title={demoConfirming?.action ?? 'Confirmar tarea de ejemplo'}
        message={'¿Quieres marcar como resuelta esta tarea de ejemplo? No se modificará ninguna cita ni pago real.'}
        confirmLabel={demoConfirming?.action ?? 'Confirmar'}
        onClose={() => setDemoConfirming(null)}
        onConfirm={() => {
          if (demoConfirming) setDemoResolved((items) => [...items, demoConfirming.id])
          setDemoConfirming(null)
        }}
      />
      <div className={styles.contentGrid}>
        <section className={styles.modulesSection} aria-labelledby="modules-title">
          <div className={styles.sectionHead}>
            <div>
              <span>Modulo de gestion</span>
              <h2 id="modules-title">Areas de trabajo</h2>
            </div>
          </div>

          <ul className={styles.moduleGrid}>
            {modules.map((module) => {
              const Icon = module.Icon
              return (
                <li key={module.id}>
                  <Link
                    to={module.to}
                    className={styles.moduleCard}
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
