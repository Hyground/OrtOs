import { useState } from 'react'
import { IconCreditCard, IconEye, IconEdit, IconPrint, IconSearch } from '@/components/icons/icons'
import { Button } from '@/components/ui/Button/Button'
import { TextField } from '@/components/ui/TextField/TextField'
import { SelectField } from '@/components/ui/SelectField/SelectField'
import { Badge } from '@/components/ui/Badge/Badge'
import { Banner, Tabs, Pagination } from '@/features/clinical/components'
import { usePagination } from '@/features/clinical/tableHelpers'
import { useModuleDialogs } from '@/features/clinical/useModuleDialogs'
import { money, displayDate, normalize } from '@/features/clinical/mockStore'
import { usePatients } from '@/features/patients/hooks/usePatients'
import { PatientForm } from '@/features/patients/components/PatientForm'
import { RecordModal } from '@/features/records/components/RecordModal'
import { ReceiptModal } from './ReceiptModal'
import { PaymentForm } from './PaymentForm'
import { QuickPayment } from './QuickPayment'
import { PaymentsAnalytics } from './PaymentsAnalytics'
import { concepts, paymentMethods } from '../mockData/payments'
import { usePayments } from '../hooks/usePayments'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import styles from '@/features/clinical/Clinical.module.css'
import css from './Payments.module.css'
export function PaymentsPage() {
  useDocumentTitle('Pagos')
  const payments = usePayments()
  const patients = usePatients()
  const dialog = useModuleDialogs()
  const [tab, setTab] = useState('REGISTRO DE PAGOS')
  const [from, setFrom] = useState('2026-08-01')
  const [to, setTo] = useState('2026-08-31')
  const [concept, setConcept] = useState('')
  const [method, setMethod] = useState('')
  const [query, setQuery] = useState('')
  const [receipt, setReceipt] = useState(null)
  const person = (id) => patients.find((p) => p.id === id)
  const rows = payments
    .filter(
      (p) =>
        (!from || p.date >= from) &&
        (!to || p.date <= to) &&
        (!concept || p.concept === concept) &&
        (!method || p.method === method) &&
        normalize(
          person(p.patientId)?.name + ' ' + person(p.patientId)?.folio + ' ' + p.reference,
        ).includes(normalize(query)) &&
        (tab === 'PAGOS PENDIENTES'
          ? p.status === 'Pendiente'
          : tab === 'REGISTRO DE PAGOS'
            ? p.status === 'Completado'
            : true),
    )
    .sort((a, b) => b.date.localeCompare(a.date))
  const { page, setPage, visible } = usePagination(rows, 7)
  const month = (from || '2026-08-01').slice(0, 7)
  const monthly = payments.filter((p) => p.date.startsWith(month))
  const paid = monthly.filter((p) => p.status === 'Completado')
  const label = new Date(month + '-01T12:00:00')
    .toLocaleDateString('es-GT', { month: 'long', year: 'numeric' })
    .toUpperCase()
  const clear = () => {
    setFrom('')
    setTo('')
    setConcept('')
    setMethod('')
    setQuery('')
    setPage(1)
  }
  const saved = (payment) => {
    dialog.onSaved()
    setFrom(payment.date.slice(0, 7) + '-01')
    const date = new Date(payment.date + 'T12:00:00')
    setTo(
      payment.date.slice(0, 7) +
        '-' +
        new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate(),
    )
    setTab(payment.status === 'Pendiente' ? 'PAGOS PENDIENTES' : 'REGISTRO DE PAGOS')
    setConcept('')
    setMethod('')
    setQuery('')
    setPage(1)
  }
  return (
    <div className={styles.page}>
      <Banner
        title="MÓDULO DE PAGOS"
        description="Administra los ingresos, abonos y comprobantes de tu clínica en un solo lugar."
        Icon={IconCreditCard}
        metrics={[
          [
            money(
              paid
                .filter((p) => p.currency === 'GTQ')
                .reduce((sum, p) => sum + Number(p.amount), 0),
            ),
            'Total recibido (mes, GTQ)',
          ],
          [paid.length, 'Pagos registrados (mes)'],
          [monthly.filter((p) => p.status === 'Pendiente').length, 'Pendientes (mes)'],
          [new Set(paid.map((p) => p.patientId)).size, 'Pacientes con pagos'],
        ]}
        onNew={dialog.create}
        newLabel="NUEVO PAGO"
      />
      {dialog.notice && (
        <p role="status" className={styles.success}>
          {dialog.notice}
        </p>
      )}
      <section className={styles.card}>
        <Tabs
          items={['REGISTRO DE PAGOS', 'PAGOS PENDIENTES', 'TODOS LOS PAGOS', 'CATEGORÍAS']}
          value={tab}
          onChange={(v) => {
            setTab(v)
            setPage(1)
          }}
        />
        <form
          className={styles.filters}
          onSubmit={(e) => {
            e.preventDefault()
            setPage(1)
          }}
        >
          <TextField
            label="Desde"
            type="date"
            value={from}
            max={to || undefined}
            onChange={(e) => {
              setFrom(e.target.value)
              setPage(1)
            }}
          />
          <TextField
            label="Hasta"
            type="date"
            value={to}
            min={from || undefined}
            onChange={(e) => {
              setTo(e.target.value)
              setPage(1)
            }}
          />
          <SelectField
            label="Tipo"
            placeholder="Todos los tipos"
            options={concepts}
            value={concept}
            onChange={(e) => {
              setConcept(e.target.value)
              setPage(1)
            }}
          />
          <SelectField
            label="Método"
            placeholder="Todos los métodos"
            options={paymentMethods}
            value={method}
            onChange={(e) => {
              setMethod(e.target.value)
              setPage(1)
            }}
          />
          <TextField
            label="Buscar"
            type="search"
            icon={IconSearch}
            placeholder="Paciente, folio o referencia..."
            value={query}
            onChange={(e) => {
              setQuery(e.target.value)
              setPage(1)
            }}
          />
          <Button type="submit" size="sm">
            <IconSearch /> Buscar
          </Button>
          <Button size="sm" variant="ghost" onClick={clear}>
            Limpiar
          </Button>
        </form>
        {from && to && from > to && (
          <p className={styles.error} role="alert">
            La fecha inicial debe ser anterior a la fecha final.
          </p>
        )}
      </section>
      <div className={styles.split}>
        <section className={styles.card}>
          {tab === 'CATEGORÍAS' ? (
            <>
              <h2 className={styles.cardTitle}>RESUMEN POR CATEGORÍA</h2>
              <div className={styles.cardBody}>
                {concepts.map((c) => (
                  <div className={styles.metricRow} key={c}>
                    <button
                      className={styles.iconButton}
                      aria-label={'Filtrar ' + c}
                      onClick={() => {
                        setConcept(c)
                        setTab('TODOS LOS PAGOS')
                      }}
                    >
                      <IconSearch />
                    </button>
                    <span>
                      {c} · {rows.filter((p) => p.concept === c).length} pagos
                    </span>
                    <strong>
                      {money(
                        rows
                          .filter((p) => p.concept === c && p.currency === 'GTQ')
                          .reduce((sum, p) => sum + Number(p.amount), 0),
                      )}
                    </strong>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <>
              <div className={styles.tableScroll}>
                <table className={styles.table + ' ' + css.paymentTable}>
                  <colgroup>
                    {[10, 18, 13, 13, 13, 11, 10, 12].map((width, i) => (
                      <col key={i} style={{ width: width + '%' }} />
                    ))}
                  </colgroup>
                  <thead>
                    <tr>
                      {[
                        'FECHA',
                        'PACIENTE',
                        'CONCEPTO',
                        'TRATAMIENTO / CITA',
                        'MÉTODO',
                        'MONTO',
                        'ESTADO',
                        'ACCIONES',
                      ].map((h) => (
                        <th key={h} scope="col">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {visible.map((p) => (
                      <tr key={p.id}>
                        <td>{displayDate(p.date)}</td>
                        <td>
                          <strong>{person(p.patientId)?.name}</strong>
                          <small>{person(p.patientId)?.folio}</small>
                        </td>
                        <td>
                          {p.concept}
                          <small>{p.reference || 'Pago en clínica'}</small>
                        </td>
                        <td>{p.treatment || '—'}</td>
                        <td>
                          <IconCreditCard /> {p.method}
                        </td>
                        <td>
                          <strong>{money(p.amount, p.currency)}</strong>
                        </td>
                        <td>
                          <Badge>{p.status}</Badge>
                        </td>
                        <td>
                          <div className={styles.actions}>
                            <button
                              className={styles.iconButton}
                              aria-label={'Ver pago ' + p.receiptNumber}
                              onClick={() => setReceipt(p)}
                            >
                              <IconEye />
                            </button>
                            <button
                              className={styles.iconButton}
                              aria-label={'Editar pago ' + p.receiptNumber}
                              onClick={() => dialog.setEditing(p)}
                            >
                              <IconEdit />
                            </button>
                            <button
                              className={styles.iconButton}
                              aria-label={'Imprimir pago ' + p.receiptNumber}
                              onClick={() => setReceipt(p)}
                            >
                              <IconPrint />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {!rows.length && (
                  <p className={styles.empty}>No se encontraron pagos con estos filtros.</p>
                )}
              </div>
              <Pagination
                total={rows.length}
                page={page}
                onChange={setPage}
                size={7}
                noun="pagos"
              />
            </>
          )}
        </section>
        <PaymentsAnalytics payments={monthly} label={label} />
      </div>
      <QuickPayment onComplete={saved} onExpand={dialog.setEditing} />
      {dialog.open && (
        <PaymentForm
          payment={dialog.editing}
          onClose={dialog.close}
          onSaved={saved}
          onAdd={(form) => dialog.setAdding({ form })}
          onRecord={dialog.setRecord}
        />
      )}
      {dialog.adding && (
        <PatientForm
          onClose={() => dialog.setAdding(null)}
          onSaved={(p) => {
            dialog.adding.form.set('patientId', p.id)
            dialog.setAdding(null)
          }}
        />
      )}
      {dialog.record && (
        <RecordModal patient={dialog.record} onClose={() => dialog.setRecord(null)} />
      )}
      {receipt && (
        <ReceiptModal
          payment={receipt}
          patient={person(receipt.patientId)}
          onClose={() => setReceipt(null)}
        />
      )}
    </div>
  )
}
