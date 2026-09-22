import { useMemo, useState } from 'react'
import { Button } from '@/components/ui/Button/Button'
import { Badge } from '@/components/ui/Badge/Badge'
import { Avatar, Tabs } from '@/features/clinical/components'
import { accountFor, addCharge, createPaymentPlan, displayDate, moneyRounded, registerAccountPayment, useClinic } from '@/features/clinical/mockStore'
import { ChargeModal, PaymentModal, PlanModal } from './AccountDialogs'
import css from './Payments.module.css'

const paidFor = (charge) => (charge.allocations || []).reduce((sum, allocation) => sum + Number(allocation.amount ?? allocation), 0)
const chargeStatus = (charge) => charge.status === 'Anulado' ? 'Anulado' : paidFor(charge) >= charge.subtotal ? 'Pagado' : paidFor(charge) ? 'Parcial' : 'Pendiente'

export function PatientAccount({ patient, appointment, compact = false }) {
  const clinic = useClinic(); const [tab, setTab] = useState('Resumen'); const [dialog, setDialog] = useState('')
  const account = accountFor(patient.id, appointment?.id)
  const appointments = useMemo(() => clinic.appointments.filter((item) => item.patientId === patient.id && item.status !== 'Cancelada').sort((a, b) => b.date.localeCompare(a.date)), [clinic.appointments, patient.id])
  const plans = clinic.paymentPlans.filter((plan) => plan.patientId === patient.id)
  const nextInstallment = plans.flatMap((plan) => plan.installments).filter((item) => item.status !== 'Pagada').sort((a, b) => a.dueDate.localeCompare(b.dueDate))[0]
  const add = async (data) => { await addCharge(data); setDialog('') }
  const pay = async (data) => { await registerAccountPayment({ ...data, appointmentId: appointment?.id }); setDialog('') }
  const plan = async (data) => { await createPaymentPlan(data); setDialog('') }
  const pending = account.charges.filter((charge) => chargeStatus(charge) !== 'Pagado' && charge.status !== 'Anulado')
  return <section className={[css.account, compact ? css.compactAccount : ''].filter(Boolean).join(' ')}>
    {!compact && <header className={css.accountHeader}><div className={css.patientIdentity}><Avatar patient={patient} variant="initials" /><div><h2>{appointment ? 'CUENTA DE LA CITA' : 'CUENTA DEL PACIENTE'}</h2><strong>{patient.name}</strong><small>{patient.dpi} · {patient.phone} · {patient.folio}</small>{appointment && <small>{displayDate(appointment.date)} · {appointment.time} · {appointment.dentist}</small>}</div></div><div className={css.headerActions}><Button size="sm" onClick={() => setDialog('charge')}>+ Agregar cargo</Button><Button size="sm" variant="ghost" onClick={() => setDialog('payment')}>Registrar pago</Button></div></header>}
    <div className={css.accountKpis}>
      <Metric label="Facturado" value={moneyRounded(account.total)} />
      <Metric label="Pagado" value={moneyRounded(account.paid)} tone="positive" />
      <Metric label="Pendiente" value={moneyRounded(account.balance)} tone={account.balance ? 'warning' : 'positive'} />
      <Metric label="Próximo pago" value={nextInstallment ? moneyRounded(nextInstallment.amount) : '—'} detail={nextInstallment ? displayDate(nextInstallment.dueDate) : 'Sin cuotas pendientes'} />
    </div>
    <Tabs items={['Resumen', 'Cargos', 'Pagos', 'Pendientes', 'Planes de pago']} value={tab} onChange={setTab} />
    <div className={css.accountBody}>
      {tab === 'Resumen' && <AccountSummary account={account} pending={pending} onCharge={() => setDialog('charge')} onPayment={() => setDialog('payment')} />}
      {tab === 'Cargos' && <ChargeList charges={account.charges} appointments={appointments} onAdd={() => setDialog('charge')} />}
      {tab === 'Pagos' && <PaymentList payments={account.payments} onAdd={() => setDialog('payment')} />}
      {tab === 'Pendientes' && <PendingList charges={pending} appointments={appointments} />}
      {tab === 'Planes de pago' && <Plans plans={plans} onAdd={() => setDialog('plan')} />}
    </div>
    {dialog === 'charge' && <ChargeModal patient={patient} appointments={appointments} appointmentId={appointment?.id} onSave={add} onClose={() => setDialog('')} />}
    {dialog === 'payment' && <PaymentModal patient={patient} balance={account.balance} onSave={pay} onClose={() => setDialog('')} />}
    {dialog === 'plan' && <PlanModal patient={patient} balance={account.balance} onSave={plan} onClose={() => setDialog('')} />}
  </section>
}

function Metric({ label, value, detail, tone }) { return <article className={[css.metric, tone ? css[tone] : ''].join(' ')}><span>{label}</span><strong>{value}</strong><small>{detail}</small></article> }
function AccountSummary({ account, pending, onCharge, onPayment }) { return <div className={css.summaryGrid}><section className={css.balanceCard}><span>CUENTA ACTUAL</span><div><small>Total cargos</small><strong>{moneyRounded(account.total)}</strong></div><div><small>Pagado</small><strong>{moneyRounded(account.paid)}</strong></div><hr /><div className={css.balanceTotal}><small>SALDO</small><strong>{moneyRounded(account.balance)}</strong></div>{!account.balance && <p>✓ Sin pagos pendientes</p>}</section><section className={css.summaryActions}><h3>{pending.length ? `${pending.length} cargos pendientes` : 'Cuenta al día'}</h3><p>{pending.length ? 'Registra un abono o agrega cargos de una cita.' : 'No hay saldos pendientes para este paciente.'}</p><Button onClick={onPayment} disabled={!account.balance}>Registrar pago</Button><Button variant="ghost" onClick={onCharge}>+ Agregar cargo</Button></section></div> }
function ChargeList({ charges, appointments, onAdd }) { const appointmentFor = (id) => appointments.find((item) => item.id === id); return <><div className={css.sectionHeading}><div><h3>CARGOS DE LA CUENTA</h3><p>Conceptos cobrados al paciente y su aplicación.</p></div><Button size="sm" onClick={onAdd}>+ Agregar cargo</Button></div><div className={css.ledger}>{charges.map((charge) => { const related = appointmentFor(charge.appointmentId); const paid = paidFor(charge); return <article className={css.chargeRow} key={charge.id}><div><strong>{charge.description}</strong><small>{displayDate(charge.date)} · {related ? `${related.treatment} · ${related.dentist}` : 'Sin cita relacionada'}</small></div><span>{charge.quantity} × {moneyRounded(charge.unitPrice)}</span><strong>{moneyRounded(charge.subtotal)}</strong><span>{moneyRounded(paid)}</span><Badge>{chargeStatus(charge)}</Badge></article> })}{!charges.length && <p className={css.empty}>Aún no hay cargos para esta cuenta.</p>}</div></> }
function PaymentList({ payments, onAdd }) { return <><div className={css.sectionHeading}><div><h3>PAGOS RECIBIDOS</h3><p>Solo dinero realmente recibido y aplicado.</p></div><Button size="sm" onClick={onAdd}>+ Registrar pago</Button></div><div className={css.ledger}>{payments.map((payment) => <article className={css.paymentRow} key={payment.id}><div><strong>{displayDate(payment.date)}</strong><small>{payment.reference || payment.receiptNumber || 'Pago en clínica'}</small></div><span>{payment.method}</span><strong>{moneyRounded(payment.amount)}</strong><Badge>{payment.status}</Badge></article>)}{!payments.length && <p className={css.empty}>No hay pagos aplicados todavía.</p>}</div></> }
function PendingList({ charges, appointments }) { const appointmentFor = (id) => appointments.find((item) => item.id === id); return <div className={css.pendingList}>{charges.map((charge) => { const paid = paidFor(charge); const related = appointmentFor(charge.appointmentId); return <article className={css.pendingCard} key={charge.id}><div><Badge>{chargeStatus(charge)}</Badge><h3>{charge.description}</h3><small>{related ? `Cita ${displayDate(related.date)}` : 'Cuenta general'}</small></div><dl><div><dt>Total</dt><dd>{moneyRounded(charge.subtotal)}</dd></div><div><dt>Pagado</dt><dd>{moneyRounded(paid)}</dd></div><div><dt>Pendiente</dt><dd>{moneyRounded(charge.subtotal - paid)}</dd></div></dl></article> })}{!charges.length && <p className={css.empty}>No existen pendientes.</p>}</div> }
function Plans({ plans, onAdd }) { return <><div className={css.sectionHeading}><div><h3>PLANES DE PAGO</h3><p>Financiamiento del saldo sin duplicar cargos.</p></div><Button size="sm" onClick={onAdd}>+ Crear plan de pago</Button></div><div className={css.planList}>{plans.map((plan) => { const paid = plan.installments.reduce((sum, installment) => sum + installment.paidAmount, 0); const progress = plan.financedAmount ? Math.min(100, paid / plan.financedAmount * 100) : 0; return <article className={css.planCard} key={plan.id}><header><div><Badge>{plan.status}</Badge><h3>{plan.name}</h3><small>Total {moneyRounded(plan.totalAmount)} · Anticipo {moneyRounded(plan.downPayment)}</small></div><strong>{plan.installmentCount} cuotas de {moneyRounded(plan.financedAmount / plan.installmentCount)}</strong></header><div className={css.progress}><span style={{ width: progress + '%' }} /></div><p>Pagado: <b>{moneyRounded(paid)}</b> / {moneyRounded(plan.financedAmount)}</p><div className={css.installments}>{plan.installments.map((installment) => <span key={installment.number}>#{installment.number} · {moneyRounded(installment.amount)} <Badge>{installment.status}</Badge></span>)}</div></article> })}{!plans.length && <p className={css.empty}>No hay planes de pago activos.</p>}</div></> }
