import { useState } from 'react'
import { Modal } from '@/components/ui/Modal/Modal'
import { Button } from '@/components/ui/Button/Button'
import { SelectField } from '@/components/ui/SelectField/SelectField'
import { TextField } from '@/components/ui/TextField/TextField'
import { money } from '@/features/clinical/mockStore'
import styles from '@/features/clinical/Clinical.module.css'
import css from './Payments.module.css'

const catalog = [
  ['Consulta general', 150], ['Ortodoncia - Ajuste', 250], ['Limpieza dental', 350],
  ['Radiografía', 120], ['Extracción', 450], ['Cambio de hules', 75],
]

export function ChargeModal({ patient, appointments, appointmentId = '', onSave, onClose }) {
  const [treatment, setTreatment] = useState('')
  const [form, setForm] = useState({ description: '', quantity: 1, unitPrice: '', appointmentId })
  const subtotal = Number(form.quantity || 0) * Number(form.unitPrice || 0)
  const chooseTreatment = (value) => {
    const item = catalog.find(([name]) => name === value)
    setTreatment(value)
    if (item) setForm((current) => ({ ...current, description: item[0], unitPrice: item[1] }))
  }
  const set = (key) => (event) => setForm((current) => ({ ...current, [key]: event.target.value }))
  return <Modal open size="wide" title="AGREGAR CARGO" onClose={onClose}>
    <form className={styles.form + ' ' + css.dialogForm} onSubmit={(event) => { event.preventDefault(); onSave({ ...form, patientId: patient.id }) }}>
      <div className={css.choiceGrid}>
        <section className={css.choiceCard}><h3>TRATAMIENTO / PROCEDIMIENTO</h3><SelectField label="Catálogo de tratamientos" options={catalog.map(([name, price]) => ({ value: name, label: `${name} · ${money(price)}` }))} value={treatment} onChange={(event) => chooseTreatment(event.target.value)} /></section>
        <section className={css.choiceCard}><h3>CARGO PERSONALIZADO</h3><p>Para un concepto extraordinario, escribe la descripción y el precio.</p></section>
      </div>
      <div className={styles.cols2}>
        <TextField label="Descripción *" value={form.description} onChange={set('description')} required />
        <SelectField label="Cita relacionada" placeholder="Sin cita relacionada" options={appointments.map((a) => ({ value: a.id, label: `${a.date} · ${a.time} · ${a.treatment}` }))} value={form.appointmentId} onChange={set('appointmentId')} disabled={!!appointmentId} />
        <TextField label="Cantidad *" type="number" min="1" step="1" value={form.quantity} onChange={set('quantity')} required />
        <TextField label="Precio unitario *" type="number" min="0" step="0.01" value={form.unitPrice} onChange={set('unitPrice')} required />
      </div>
      <div className={css.modalTotal}><span>Subtotal</span><strong>{money(subtotal)}</strong></div>
      <div className={css.dialogActions}><Button type="button" variant="ghost" onClick={onClose}>Cancelar</Button><Button type="submit">Agregar cargo</Button></div>
    </form>
  </Modal>
}

export function PaymentModal({ patient, balance, onSave, onClose }) {
  const [form, setForm] = useState({ amount: '', method: 'Efectivo', reference: '', notes: '' })
  const amount = Number(form.amount || 0); const after = Math.max(0, balance - amount)
  const set = (key) => (event) => setForm((current) => ({ ...current, [key]: event.target.value }))
  return <Modal open title="REGISTRAR PAGO" onClose={onClose}>
    <form className={styles.form + ' ' + css.dialogForm} onSubmit={(event) => { event.preventDefault(); onSave({ ...form, patientId: patient.id }) }}>
      <div className={css.accountIdentity}><strong>{patient.name}</strong><span>Saldo pendiente: <b>{money(balance)}</b></span></div>
      <TextField label="Monto recibido *" type="number" min="0.01" max={balance} step="0.01" value={form.amount} onChange={set('amount')} required />
      <Button type="button" variant="ghost" size="sm" onClick={() => setForm((current) => ({ ...current, amount: balance }))}>Pagar saldo completo</Button>
      <SelectField label="Método *" options={['Efectivo', 'Tarjeta de crédito', 'Tarjeta de débito', 'Transferencia bancaria', 'Cheque']} value={form.method} onChange={set('method')} />
      <TextField label="Referencia" value={form.reference} onChange={set('reference')} placeholder="REC-001 / TRX-123" />
      <TextField label="Notas" value={form.notes} onChange={set('notes')} />
      <div className={css.paymentPreview}><span>Nuevo saldo</span><strong>{money(after)}</strong></div>
      <div className={css.dialogActions}><Button type="button" variant="ghost" onClick={onClose}>Cancelar</Button><Button type="submit">Registrar pago</Button></div>
    </form>
  </Modal>
}

export function PlanModal({ patient, balance, onSave, onClose }) {
  const [form, setForm] = useState({ downPayment: 0, installmentCount: 6, firstDueDate: '', name: 'Plan de pago' })
  const financed = Math.max(0, balance - Number(form.downPayment || 0)); const installment = form.installmentCount ? financed / Number(form.installmentCount) : 0
  const set = (key) => (event) => setForm((current) => ({ ...current, [key]: event.target.value }))
  return <Modal open title="CREAR PLAN DE PAGO" onClose={onClose}>
    <form className={styles.form + ' ' + css.dialogForm} onSubmit={(event) => { event.preventDefault(); onSave({ ...form, patientId: patient.id, totalAmount: balance, financedAmount: financed }) }}>
      <TextField label="Nombre del plan" value={form.name} onChange={set('name')} />
      <TextField label="Saldo a financiar" readOnly value={money(balance)} />
      <TextField label="Anticipo" type="number" min="0" max={balance} step="0.01" value={form.downPayment} onChange={set('downPayment')} />
      <TextField label="Número de cuotas" type="number" min="1" value={form.installmentCount} onChange={set('installmentCount')} />
      <TextField label="Fecha del primer pago" type="date" value={form.firstDueDate} onChange={set('firstDueDate')} required />
      <div className={css.paymentPreview}><span>Monto financiado · {form.installmentCount} cuotas</span><strong>{money(financed)} · {money(installment)}</strong></div>
      <div className={css.dialogActions}><Button type="button" variant="ghost" onClick={onClose}>Cancelar</Button><Button type="submit">Crear plan</Button></div>
    </form>
  </Modal>
}
