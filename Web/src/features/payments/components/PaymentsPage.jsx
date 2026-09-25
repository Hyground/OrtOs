import { useMemo, useState } from 'react'
import { IconCreditCard, IconSearch } from '@/components/icons/icons'
import { Avatar, Tabs } from '@/features/clinical/components'
import { TextField } from '@/components/ui/TextField/TextField'
import { moneyRounded, normalize, useClinic } from '@/features/clinical/mockStore'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { PatientAccount } from './PatientAccount'
import { PaymentsCashier } from './PaymentsCashier'
import css from './Payments.module.css'

const views = ['Caja', 'Cuenta']

export function PaymentsPage() {
  useDocumentTitle('Pagos')
  const clinic = useClinic()
  const [view, setView] = useState('Caja')
  const [query, setQuery] = useState('')
  const [selectedId, setSelectedId] = useState('patient-1')
  const selected = clinic.patients.find((patient) => patient.id === selectedId)
  const matches = useMemo(() => clinic.patients.filter((patient) => normalize(`${patient.name} ${patient.dpi} ${patient.folio}`).includes(normalize(query))).slice(0, 6), [clinic.patients, query])
  const totalReceived = clinic.payments.filter((payment) => payment.status === 'Completado').reduce((sum, payment) => sum + Number(payment.amount), 0)

  return <div className={css.paymentsPage}>
    <div className={css.workspaceNav}>
      <Tabs items={views} value={view} onChange={setView} />
      <p>{view === 'Caja' ? 'Crea cargos, deja saldo pendiente o registra el cobro.' : 'Consulta la cuenta, movimientos, pendientes y planes de pago.'}</p>
    </div>
    {view === 'Caja' ? <PaymentsCashier /> : <>
      <section className={css.financeMetrics}>
        <strong>{moneyRounded(totalReceived)}<small>Ingresos registrados</small></strong>
        <strong>{clinic.charges.filter((charge) => charge.status !== 'Pagado').length}<small>Cargos pendientes</small></strong>
        <strong>{clinic.paymentPlans.filter((plan) => plan.status === 'Activo').length}<small>Planes activos</small></strong>
      </section>
      <section className={css.patientPicker}>
        <div className={css.searchBox}><IconSearch /><TextField label="Buscar paciente" type="search" placeholder="Nombre, DPI o expediente..." value={query} onChange={(event) => setQuery(event.target.value)} /></div>
        {query && <div className={css.searchResults}>{matches.map((patient) => <button type="button" key={patient.id} onClick={() => { setSelectedId(patient.id); setQuery('') }}><Avatar patient={patient} variant="initials" /><span><strong>{patient.name}</strong><small>{patient.dpi} · {patient.folio}</small></span></button>)}{!matches.length && <p>Sin coincidencias.</p>}</div>}
      </section>
      {selected ? <PatientAccount patient={selected} /> : <section className={css.noPatient}><IconCreditCard /><h2>Selecciona un paciente</h2><p>Busca por nombre, DPI o expediente para abrir su cuenta financiera.</p></section>}
    </>}
  </div>
}
