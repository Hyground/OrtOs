import { useMemo, useState } from 'react'
import { IconCreditCard } from '@/components/icons/icons'
import { Button } from '@/components/ui/Button/Button'
import { SelectField } from '@/components/ui/SelectField/SelectField'
import { TextField } from '@/components/ui/TextField/TextField'
import { SearchSelect } from '@/components/ui/SearchSelect/SearchSelect'
import { accountFor, addCharge, moneyRounded, normalize, registerAccountPayment, useClinic } from '@/features/clinical/mockStore'
import { readTreatments } from '@/features/treatments/treatmentsData'
import { PaymentModal } from '@/features/payments/components/AccountDialogs'
import { ReceiptModal } from './ReceiptModal'
import styles from './PaymentsCashier.module.css'

const newCustomCharge = () => ({ id: `custom-${crypto.randomUUID()}`, description: '', quantity: 1, unitPrice: '' })

export function PaymentsCashier() {
  const clinic = useClinic()
  const [patientId, setPatientId] = useState('')
  const [appointmentId, setAppointmentId] = useState('')
  const [query, setQuery] = useState('')
  const [cart, setCart] = useState([])
  const [payment, setPayment] = useState(null)
  const [receipt, setReceipt] = useState(null)
  const [notice, setNotice] = useState('')
  const [saving, setSaving] = useState(false)
  const patient = clinic.patients.find((item) => item.id === patientId)
  const account = patient ? accountFor(patient.id) : { balance: 0 }
  const appointments = useMemo(() => clinic.appointments.filter((item) => item.patientId === patientId && item.status !== 'Cancelada').sort((a, b) => b.date.localeCompare(a.date)), [clinic.appointments, patientId])
  const treatments = useMemo(() => readTreatments().filter((item) => item.active), [])
  const filtered = treatments.filter((item) => normalize(`${item.name} ${item.category}`).includes(normalize(query)))
  const total = cart.reduce((sum, item) => sum + Number(item.quantity || 0) * Number(item.unitPrice || 0), 0)

  const addTreatment = (treatment) => setCart((items) => {
    const existing = items.find((item) => item.treatmentId === treatment.id)
    return existing ? items.map((item) => item.id === existing.id ? { ...item, quantity: item.quantity + 1 } : item) : [...items, { id: `treatment-${treatment.id}`, treatmentId: treatment.id, description: treatment.name, quantity: 1, unitPrice: treatment.price }]
  })
  const update = (id, key, value) => setCart((items) => items.map((item) => item.id === id ? { ...item, [key]: value } : item))
  const remove = (id) => setCart((items) => items.filter((item) => item.id !== id))
  const saveCharges = async () => {
    if (!patient || !cart.length) return []
    if (cart.some((item) => !item.description.trim() || Number(item.quantity) <= 0 || Number(item.unitPrice) < 0)) throw new Error('Completa la descripción, cantidad y precio de cada cargo.')
    return Promise.all(cart.map((item) => addCharge({ patientId: patient.id, appointmentId: appointmentId || undefined, treatmentId: item.treatmentId, description: item.description.trim(), quantity: Number(item.quantity), unitPrice: Number(item.unitPrice) })))
  }
  const leavePending = async () => {
    setSaving(true)
    try { await saveCharges(); setNotice(`Cargos guardados. Quedan ${moneyRounded(total)} pendientes.`); setCart([]) } catch (error) { setNotice(error.message) } finally { setSaving(false) }
  }
  const beginPayment = async () => {
    setSaving(true)
    try { const charges = await saveCharges(); setPayment({ chargeIds: charges.map((charge) => charge.id), balance: charges.reduce((sum, charge) => sum + charge.subtotal, 0) }); setCart([]) } catch (error) { setNotice(error.message) } finally { setSaving(false) }
  }
  const completePayment = async (data) => {
    const registered = await registerAccountPayment({ ...data, chargeIds: payment.chargeIds, appointmentId: appointmentId || undefined, notes: data.notes || 'Pago registrado desde Pagos' })
    setPayment(null)
    setReceipt(registered)
    setNotice(`Pago registrado. Saldo de esta operación: ${moneyRounded(Math.max(0, payment.balance - data.amount))}.`)
  }

  return <div className={styles.page}>
    <section className={styles.hero}><IconCreditCard /><div><span>CAJA CLÍNICA</span><h1>Pagos</h1><p>Crea cargos y cobra desde una sola cuenta del paciente.</p></div><strong>{moneyRounded(total)}</strong></section>
    {notice && <p role="status" className={styles.storeNotice}>{notice}</p>}
    <section className={styles.patientStep}>
      <div className={styles.patientControl}><SearchSelect label="Paciente" placeholder="Buscar por nombre, DPI o expediente..." options={clinic.patients} value={patientId} onChange={(id) => { setPatientId(id); setAppointmentId(''); setCart([]); setNotice('') }} /></div>
      {patient ? <div className={styles.patientCard}><strong>{patient.name}</strong><small>{patient.dpi} · {patient.phone} · {patient.folio}</small><b>Saldo pendiente {moneyRounded(account.balance)}</b></div> : <div className={styles.patientEmpty}>Selecciona un paciente para iniciar una cuenta.</div>}
      {patient && <SelectField label="Cita relacionada (opcional)" placeholder="Sin cita relacionada" options={appointments.map((item) => ({ value: item.id, label: `#${item.id.replace(/\D/g, '') || item.id} · ${item.date} · ${item.treatment}` }))} value={appointmentId} onChange={(event) => setAppointmentId(event.target.value)} />}
    </section>
    <div className={styles.storeLayout}>
      <section className={styles.catalog}><header><div><h2>Tratamientos</h2><p>Catálogo existente de procedimientos y precios.</p></div><div className={styles.search}><TextField label="" aria-label="Buscar tratamiento" type="search" placeholder="Nombre o categoría..." value={query} onChange={(event) => setQuery(event.target.value)} /></div></header><div className={styles.catalogColumns}><span>Tratamiento</span><span>Duración</span><span>Precio</span></div><div className={styles.catalogGrid}>{filtered.map((treatment) => <button type="button" className={styles.product} key={treatment.id} disabled={!patient} onClick={() => addTreatment(treatment)}><div><h3>{treatment.name}</h3></div><small>{treatment.durationMin} min</small><strong>{moneyRounded(treatment.price)}</strong></button>)}{!filtered.length && <p className={styles.empty}>No hay tratamientos que coincidan.</p>}</div></section>
      <aside className={styles.cart}><header><div><span>CARGOS</span><h2>Carrito</h2></div><b>{cart.length} conceptos</b></header><div className={styles.cartItems}>{cart.map((item) => <article className={styles.cartItem} key={item.id}><div className={styles.chargeFields}><TextField label="Descripción" value={item.description} onChange={(event) => update(item.id, 'description', event.target.value)} /><TextField label="Cantidad" type="number" min="1" value={item.quantity} onChange={(event) => update(item.id, 'quantity', event.target.value)} /><TextField label="Precio unitario" type="number" min="0" value={item.unitPrice} onChange={(event) => update(item.id, 'unitPrice', event.target.value)} /></div><b>{moneyRounded(Number(item.quantity || 0) * Number(item.unitPrice || 0))}</b><button type="button" className={styles.remove} aria-label={`Eliminar ${item.description || 'cargo'}`} onClick={() => remove(item.id)}>×</button></article>)}{!cart.length && <div className={styles.emptyCart}><IconCreditCard /><strong>El carrito está vacío</strong><p>Agrega un tratamiento o un cargo personalizado.</p></div>}</div><footer className={styles.cartFooter}><Button type="button" variant="ghost" disabled={!patient} onClick={() => setCart((items) => [...items, newCustomCharge()])}>+ Cargo personalizado</Button><div><span>TOTAL</span><strong>{moneyRounded(total)}</strong></div><Button type="button" variant="ghost" disabled={!patient || !cart.length || saving} onClick={leavePending}>Dejar pendiente</Button><Button type="button" disabled={!patient || !cart.length || saving} onClick={beginPayment}>{saving ? 'Guardando…' : 'COBRAR'}</Button></footer></aside>
    </div>
    {payment && <PaymentModal patient={patient} balance={payment.balance} chargeIds={payment.chargeIds} appointmentId={appointmentId} onSave={completePayment} onClose={() => setPayment(null)} />}
    {receipt && <ReceiptModal payment={receipt} patient={patient} onClose={() => setReceipt(null)} />}
  </div>
}
