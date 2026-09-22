import { useMemo, useState } from 'react'
import { Modal } from '@/components/ui/Modal/Modal'
import { Button } from '@/components/ui/Button/Button'
import { TextField } from '@/components/ui/TextField/TextField'
import { SelectField } from '@/components/ui/SelectField/SelectField'
import { Tabs } from '@/features/clinical/components'
import { accountFor, addCharge, createPaymentPlan, money, registerAccountPayment, useClinic } from '@/features/clinical/mockStore'
import { treatments } from '@/features/appointments/mockData/appointments'
import styles from '@/features/clinical/Clinical.module.css'

export function PatientAccountModal({ patient, appointment, onClose }) {
  const [tab, setTab] = useState('RESUMEN'); const [notice, setNotice] = useState('')
  const [charge, setCharge] = useState({ description: '', quantity: 1, unitPrice: '' })
  const [amount, setAmount] = useState(''); const [method, setMethod] = useState('Efectivo')
  const [plan, setPlan] = useState({ financedAmount: '', installmentCount: 6 })
  const clinic = useClinic()
  const account = useMemo(() => accountFor(patient.id, appointment?.id), [patient.id, appointment?.id, notice])
  const saveCharge = async (e) => { e.preventDefault(); try { await addCharge({ ...charge, patientId: patient.id, appointmentId: appointment?.id }); setCharge({ description: '', quantity: 1, unitPrice: '' }); setNotice('Cargo agregado a la cuenta.'); } catch (error) { setNotice(error.message) } }
  const pay = async (e) => { e.preventDefault(); try { await registerAccountPayment({ patientId: patient.id, appointmentId: appointment?.id, amount, method, reference: '' }); setAmount(''); setNotice('Abono registrado y aplicado.'); } catch (error) { setNotice(error.message) } }
  const savePlan = async (e) => { e.preventDefault(); try { await createPaymentPlan({ patientId: patient.id, ...plan }); setNotice('Plan de pago creado.'); } catch (error) { setNotice(error.message) } }
  const paid = (c) => (c.allocations || []).reduce((sum, n) => sum + n, 0)
  return <Modal open size="wide" title={appointment ? 'CUENTA DE LA CITA' : 'CUENTA / PAGOS'} onClose={onClose}>
    <div className={styles.stack}>
      <section className={styles.quickPatient}><div><strong>{patient.name}</strong><small>{appointment ? `${appointment.date} · ${appointment.treatment}` : patient.folio}</small></div></section>
      {notice && <p className={styles.success}>{notice}</p>}
      <div className={styles.metrics}>
        <div><strong>{money(account.total)}</strong><small>Total facturado</small></div><div><strong>{money(account.paid)}</strong><small>Total pagado</small></div><div><strong>{money(account.balance)}</strong><small>{account.balance ? 'Saldo pendiente' : 'Sin pagos pendientes'}</small></div><div><strong>—</strong><small>Próximo pago</small></div>
      </div>
      <Tabs items={['RESUMEN', 'CARGOS', 'PAGOS', 'PENDIENTES', 'PLANES DE PAGO']} value={tab} onChange={setTab} />
      {(tab === 'RESUMEN' || tab === 'CARGOS' || tab === 'PENDIENTES') && <section className={styles.cardBody}>
        <div className={styles.tableScroll}><table className={styles.table}><thead><tr><th>CONCEPTO</th><th>CITA</th><th>TOTAL</th><th>PAGADO</th><th>SALDO</th><th>ESTADO</th></tr></thead><tbody>{account.charges.map((c) => <tr key={c.id}><td>{c.description}</td><td>{appointment ? appointment.date : c.appointmentId ? 'Cita asociada' : '—'}</td><td>{money(c.subtotal)}</td><td>{money(paid(c))}</td><td>{money(c.subtotal - paid(c))}</td><td>{c.status}</td></tr>)}</tbody></table>{!account.charges.length && <p className={styles.empty}>No hay cargos registrados.</p>}</div>
      </section>}
      {tab === 'PAGOS' && <p className={styles.empty}>Los abonos aparecen en el historial general de pagos con su comprobante.</p>}
      {tab === 'PLANES DE PAGO' && <section className={styles.cardBody}><form className={styles.filters} onSubmit={savePlan}><TextField label="Saldo a financiar" type="number" min="0.01" max={account.balance} step="0.01" value={plan.financedAmount} onChange={(e) => setPlan((p) => ({ ...p, financedAmount: e.target.value }))} required/><TextField label="Cuotas" type="number" min="1" value={plan.installmentCount} onChange={(e) => setPlan((p) => ({ ...p, installmentCount: e.target.value }))} required/><Button type="submit">Crear plan</Button></form>{clinic.paymentPlans.filter((p) => p.patientId === patient.id).map((p) => <div className={styles.metricRow} key={p.id}><span>Activo · {p.installmentCount} cuotas</span><strong>{money(p.financedAmount)}</strong><small>{p.installments.map((i) => `#${i.number} ${money(i.amount)}`).join(' · ')}</small></div>)}</section>}
      <section className={styles.cardBody}><h3>Agregar cargo</h3><form className={styles.filters} onSubmit={saveCharge}><SelectField label="Catálogo" placeholder="Cargo personalizado" options={treatments} value="" onChange={(e) => setCharge((c) => ({ ...c, description: e.target.value }))}/><TextField label="Descripción" value={charge.description} onChange={(e) => setCharge((c) => ({ ...c, description: e.target.value }))} required/><TextField label="Cantidad" type="number" min="1" value={charge.quantity} onChange={(e) => setCharge((c) => ({ ...c, quantity: e.target.value }))}/><TextField label="Precio unitario" type="number" min="0" step="0.01" value={charge.unitPrice} onChange={(e) => setCharge((c) => ({ ...c, unitPrice: e.target.value }))} required/><Button type="submit">+ Agregar cargo</Button></form></section>
      <section className={styles.cardBody}><h3>Registrar abono</h3><form className={styles.filters} onSubmit={pay}><TextField label="Monto recibido" type="number" min="0.01" step="0.01" value={amount} onChange={(e) => setAmount(e.target.value)} required/><SelectField label="Método" options={['Efectivo','Tarjeta','Transferencia']} value={method} onChange={(e) => setMethod(e.target.value)}/><Button type="submit">Registrar abono</Button></form></section>
    </div>
  </Modal>
}
