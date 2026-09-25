import { useState } from 'react'
import { Modal } from '@/components/ui/Modal/Modal'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog/ConfirmDialog'
import { Button } from '@/components/ui/Button/Button'
import { SelectField } from '@/components/ui/SelectField/SelectField'
import { TextField } from '@/components/ui/TextField/TextField'
import { moneyRounded } from '@/features/clinical/mockStore'
import { readTreatments } from '@/features/treatments/treatmentsData'
import styles from '@/features/clinical/Clinical.module.css'
import css from './Payments.module.css'

const roundToFive = (value) => Math.round(Number(value || 0) / 5) * 5
const methods = ['Efectivo', 'Tarjeta de crédito', 'Tarjeta de débito', 'Transferencia bancaria', 'Cheque']

function useCloseConfirmation(initial, current, onClose) {
  const [confirming, setConfirming] = useState(false)
  const requestClose = () => JSON.stringify(initial) === JSON.stringify(current) ? onClose() : setConfirming(true)
  const confirm = <ConfirmDialog open={confirming} title="¿Cerrar sin guardar?" message="Hay cambios sin guardar. ¿Deseas descartarlos?" confirmLabel="Cerrar sin guardar" cancelLabel="Seguir editando" danger onConfirm={onClose} onClose={() => setConfirming(false)} />
  return { requestClose, confirm }
}

export function ChargeModal({ patient, appointments, appointmentId = '', onSave, onClose }) {
  const initial = { description: '', quantity: 1, unitPrice: '', appointmentId }
  const [treatment, setTreatment] = useState('')
  const [form, setForm] = useState(initial)
  const { requestClose, confirm } = useCloseConfirmation(initial, { ...form, treatment }, onClose)
  const catalog = readTreatments().filter((item) => item.active)
  const subtotal = roundToFive(Number(form.quantity || 0) * Number(form.unitPrice || 0))
  const set = (key) => (event) => setForm((current) => ({ ...current, [key]: event.target.value }))
  const chooseTreatment = (id) => { const item = catalog.find((entry) => entry.id === id); setTreatment(id); if (item) setForm((current) => ({ ...current, treatmentId: item.id, description: item.name, unitPrice: item.price })) }
  return <><Modal open size="wide" title="AGREGAR CARGO" onClose={requestClose}><form className={styles.form + ' ' + css.dialogForm} onSubmit={(event) => { event.preventDefault(); onSave({ ...form, unitPrice: roundToFive(form.unitPrice), patientId: patient.id }) }}>
    <div className={css.choiceGrid}><section className={css.choiceCard}><h3>TRATAMIENTO / PROCEDIMIENTO</h3><SelectField label="Catálogo de tratamientos" options={catalog.map((item) => ({ value: item.id, label: `${item.name} · ${moneyRounded(item.price)}` }))} value={treatment} onChange={(event) => chooseTreatment(event.target.value)} /></section><section className={css.choiceCard}><h3>CARGO PERSONALIZADO</h3><p>Para un concepto extraordinario, escribe la descripción y el precio.</p></section></div>
    <div className={styles.cols2}><TextField label="Descripción *" value={form.description} onChange={set('description')} required /><SelectField label="Cita relacionada" placeholder="Sin cita relacionada" options={appointments.map((a) => ({ value: a.id, label: `${a.date} · ${a.time} · ${a.treatment}` }))} value={form.appointmentId} onChange={set('appointmentId')} disabled={!!appointmentId} /><TextField label="Cantidad *" type="number" min="1" step="1" value={form.quantity} onChange={set('quantity')} required /><TextField label="Precio unitario *" type="number" min="0" step="5" value={form.unitPrice} onChange={set('unitPrice')} required /></div>
    <div className={css.modalTotal}><span>Subtotal</span><strong>{moneyRounded(subtotal)}</strong></div><div className={css.dialogActions}><Button type="button" variant="ghost" onClick={requestClose}>Cancelar</Button><Button type="submit">Agregar cargo</Button></div>
  </form></Modal>{confirm}</>
}

export function PaymentModal({ patient, balance, chargeIds, appointmentId, onSave, onClose }) {
  const initial = { amount: '', method: 'Efectivo', reference: '', notes: '' }
  const [form, setForm] = useState(initial)
  const { requestClose, confirm } = useCloseConfirmation(initial, form, onClose)
  const amount = roundToFive(form.amount)
  const after = Math.max(0, balance - amount)
  const set = (key) => (event) => setForm((current) => ({ ...current, [key]: event.target.value }))
  const needsReference = /Tarjeta|Transferencia|Cheque/.test(form.method)
  return <><Modal open title="REGISTRAR PAGO" onClose={requestClose}><form className={styles.form + ' ' + css.dialogForm} onSubmit={(event) => { event.preventDefault(); onSave({ ...form, amount, patientId: patient.id, chargeIds, appointmentId }) }}>
    <div className={css.accountIdentity}><strong>{patient.name}</strong><span>Saldo pendiente: <b>{moneyRounded(balance)}</b></span>{chargeIds?.length > 1 && <small>Se aplicará primero a los {chargeIds.length} cargos seleccionados.</small>}</div><TextField label="Monto recibido *" type="number" min="5" max={balance} step="5" value={form.amount} onChange={set('amount')} onBlur={() => setForm((current) => ({ ...current, amount: roundToFive(current.amount) }))} required /><Button type="button" variant="ghost" size="sm" onClick={() => setForm((current) => ({ ...current, amount: balance }))}>Pagar saldo completo</Button><SelectField label="Método *" options={methods} value={form.method} onChange={set('method')} /><TextField label={`Referencia${needsReference ? ' *' : ''}`} value={form.reference} onChange={set('reference')} placeholder="REC-001 / TRX-123" required={needsReference} /><TextField label="Notas" value={form.notes} onChange={set('notes')} />
    <div className={css.paymentPreview}><span>Nuevo saldo</span><strong>{moneyRounded(after)}</strong></div><div className={css.dialogActions}><Button type="button" variant="ghost" onClick={requestClose}>Cancelar</Button><Button type="submit" disabled={!(amount > 0) || amount > balance}>Registrar pago</Button></div>
  </form></Modal>{confirm}</>
}

export function PlanModal({ patient, balance, onSave, onClose }) {
  const initial = { downPayment: 0, preset: '6', customCount: '', firstDueDate: '', name: 'Plan de pago' }
  const [form, setForm] = useState(initial)
  const { requestClose, confirm } = useCloseConfirmation(initial, form, onClose)
  const count = Number(form.preset === 'custom' ? form.customCount : form.preset)
  const financed = Math.max(0, balance - roundToFive(form.downPayment))
  const set = (key) => (event) => setForm((current) => ({ ...current, [key]: event.target.value }))
  return <><Modal open title="CREAR PLAN DE PAGO" onClose={requestClose}><form className={styles.form + ' ' + css.dialogForm} onSubmit={(event) => { event.preventDefault(); onSave({ ...form, patientId: patient.id, totalAmount: balance, downPayment: roundToFive(form.downPayment), installmentCount: count, financedAmount: financed }) }}>
    <TextField label="Nombre del plan" value={form.name} onChange={set('name')} /><TextField label="Saldo a financiar" readOnly value={moneyRounded(balance)} /><TextField label="Anticipo" type="number" min="0" max={balance} step="5" value={form.downPayment} onChange={set('downPayment')} /><div><span className={css.fieldLabel}>Número de cuotas</span><div className={css.installmentChoices}>{['3', '6', '9', '12', 'custom'].map((option) => <Button key={option} type="button" size="sm" variant={form.preset === option ? 'primary' : 'ghost'} onClick={() => setForm((current) => ({ ...current, preset: option }))}>{option === 'custom' ? 'Personalizada' : option}</Button>)}</div></div>{form.preset === 'custom' && <TextField label="Cuotas personalizadas" type="number" min="1" value={form.customCount} onChange={set('customCount')} required />}<TextField label="Fecha del primer pago" type="date" value={form.firstDueDate} onChange={set('firstDueDate')} required /><div className={css.paymentPreview}><span>Monto financiado · {count || 0} cuotas</span><strong>{moneyRounded(financed)} · {moneyRounded(financed / Math.max(count, 1))}</strong></div><div className={css.dialogActions}><Button type="button" variant="ghost" onClick={requestClose}>Cancelar</Button><Button type="submit" disabled={!count || !financed}>Crear plan</Button></div>
  </form></Modal>{confirm}</>
}
