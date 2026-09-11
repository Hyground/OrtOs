import { IconChart } from '@/components/icons/icons'
import { Banner } from '@/features/clinical/components'
import { useAppointments } from '@/features/appointments/hooks/useAppointments'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import clinical from '@/features/clinical/Clinical.module.css'
import styles from './AppointmentSummaryPage.module.css'

const months = [
  'Enero',
  'Febrero',
  'Marzo',
  'Abril',
  'Mayo',
  'Junio',
  'Julio',
  'Agosto',
  'Septiembre',
  'Octubre',
  'Noviembre',
  'Diciembre',
]

const demoMonthlyTotals = [60, 45, 78, 30, 55, 15, 60, 44, 10, 5, 70, 65]
const colors = [
  '#4f7df0',
  '#a78bfa',
  '#f5bd67',
  '#fde05d',
  '#ee6b7a',
  '#df6fc1',
  '#58cfd0',
  '#60c47d',
  '#7aa342',
  '#8a9a16',
  '#e5a429',
  '#ffb06c',
]

export function AppointmentSummaryPage() {
  useDocumentTitle('Resumen de citas')
  const appointments = useAppointments()
  const max = Math.max(...demoMonthlyTotals)
  const completed = appointments.filter((appointment) => appointment.status === 'Completada').length
  const pending = appointments.filter((appointment) => appointment.status === 'Pendiente').length

  return (
    <div className={clinical.page}>
      <Banner
        title="RESUMEN GENERAL DE CITAS"
        description="Vista mensual de volumen de citas para seguimiento operativo de la clínica."
        Icon={IconChart}
        metrics={[
          [demoMonthlyTotals.reduce((total, value) => total + value, 0), 'Citas del año'],
          [Math.max(...demoMonthlyTotals), 'Mes más alto'],
        ]}
      />
      <section className={clinical.card} aria-labelledby="appointment-summary-title">
        <h2 id="appointment-summary-title" className={clinical.cardTitle}>
          GRÁFICA DE BARRAS MENSUAL
        </h2>
        <div className={styles.chartWrap}>
          <div className={styles.chart} role="list" aria-label="Citas por mes">
            {months.map((month, index) => (
              <div className={styles.barItem} role="listitem" key={month}>
                <button
                  type="button"
                  className={styles.bar}
                  style={{
                    height: `${(demoMonthlyTotals[index] / max) * 100}%`,
                    background: colors[index],
                  }}
                  aria-label={`${month}: ${demoMonthlyTotals[index]} citas`}
                  title={`${month}: ${demoMonthlyTotals[index]} citas`}
                />
                <span className={styles.barLabel}>{month}</span>
              </div>
            ))}
          </div>
        </div>
        <div className={styles.summaryGrid}>
          <div className={styles.summaryBox}>
            <strong>{appointments.length}</strong>
            <span>Citas registradas en demo</span>
          </div>
          <div className={styles.summaryBox}>
            <strong>{completed}</strong>
            <span>Completadas</span>
          </div>
          <div className={styles.summaryBox}>
            <strong>{pending}</strong>
            <span>Pendientes</span>
          </div>
          <div className={styles.summaryBox}>
            <strong>{appointments.length - completed - pending}</strong>
            <span>Canceladas</span>
          </div>
        </div>
      </section>
    </div>
  )
}
