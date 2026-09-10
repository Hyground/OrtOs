import { money } from '@/features/clinical/mockStore'
import { paymentMethods } from '../mockData/payments'
import styles from '@/features/clinical/Clinical.module.css'
import css from './Payments.module.css'
const colors = ['#22c55e', '#0284c7', '#f59e0b', '#ef4444', '#a78bfa']
export function PaymentsAnalytics({ payments, label }) {
  const completed = payments.filter((p) => p.status === 'Completado' && p.currency === 'GTQ')
  const pending = payments.filter((p) => p.status === 'Pendiente' && p.currency === 'GTQ')
  const total = completed.reduce((sum, p) => sum + Number(p.amount), 0)
  const methods = paymentMethods.map((name, i) => ({
    name,
    color: colors[i],
    amount: completed
      .filter((p) => p.method === name)
      .reduce((sum, p) => sum + Number(p.amount), 0),
  }))
  let previous = 0
  const stops = methods
    .map((m) => {
      const start = previous
      previous += total ? (m.amount / total) * 100 : 0
      return m.color + ' ' + start + '% ' + previous + '%'
    })
    .join(',')
  const categories = ['Ortodoncia', 'Consulta', 'Extracción', 'Blanqueamiento', 'Otros'].map(
    (name) => ({
      name,
      amount: completed
        .filter((p) =>
          name === 'Otros'
            ? !/Ortodoncia|Consulta|Extracción|Blanqueamiento/.test(p.treatment)
            : p.treatment.includes(name),
        )
        .reduce((sum, p) => sum + Number(p.amount), 0),
    }),
  )
  return (
    <aside className={styles.stack}>
      <section className={styles.card}>
        <h2 className={styles.cardTitle}>RESUMEN DEL MES - {label}</h2>
        <div className={styles.cardBody}>
          {[
            ['Total recibido', money(total)],
            ['Total pendiente', money(pending.reduce((sum, p) => sum + Number(p.amount), 0))],
            ['Pagos completados', completed.length],
            ['Pacientes con pagos', new Set(completed.map((p) => p.patientId)).size],
          ].map(([label, value]) => (
            <div className={styles.metricRow} key={label}>
              <span>{label}</span>
              <strong>{value}</strong>
            </div>
          ))}
          <p className={styles.muted}>Importes en GTQ. Otras monedas se consultan en la tabla.</p>
        </div>
      </section>
      <section className={styles.card}>
        <h2 className={styles.cardTitle}>MÉTODOS DE PAGO (MES)</h2>
        <div className={css.donutWrap}>
          <div
            className={css.donut}
            role="img"
            aria-label={
              'Distribución por método: ' +
              methods.map((m) => m.name + ' ' + money(m.amount)).join(', ')
            }
            style={{
              background: total ? 'conic-gradient(' + stops + ')' : 'var(--color-surface-alt)',
            }}
          />
          <div className={css.legend}>
            {methods.map((m) => (
              <div key={m.name}>
                <i style={{ background: m.color }} />
                <span>{m.name}</span>
                <strong>{total ? Math.round((m.amount / total) * 100) : 0}%</strong>
              </div>
            ))}
          </div>
        </div>
      </section>
      <section className={styles.card}>
        <h2 className={styles.cardTitle}>PAGOS POR CATEGORÍA (MES)</h2>
        <div className={styles.cardBody}>
          {categories.map((c) => (
            <div key={c.name}>
              <div className={css.barLabel}>
                <span>{c.name}</span>
                <strong>{money(c.amount)}</strong>
              </div>
              <div className={css.bar}>
                <span style={{ width: (total ? (c.amount / total) * 100 : 0) + '%' }} />
              </div>
            </div>
          ))}
        </div>
      </section>
    </aside>
  )
}
