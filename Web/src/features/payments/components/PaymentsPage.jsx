import { useMemo, useState } from 'react'
import { IconCreditCard, IconSearch } from '@/components/icons/icons'
import { Avatar, Banner } from '@/features/clinical/components'
import { TextField } from '@/components/ui/TextField/TextField'
import { Button } from '@/components/ui/Button/Button'
import { money, normalize, useClinic } from '@/features/clinical/mockStore'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { PatientAccount } from './PatientAccount'
import css from './Payments.module.css'

export function PaymentsPage() {
  useDocumentTitle('Pagos')
  const clinic = useClinic()
  const [query, setQuery] = useState('')
  const [selectedId, setSelectedId] = useState('patient-1')
  const selected = clinic.patients.find((patient) => patient.id === selectedId)
  const matches = useMemo(() => clinic.patients.filter((patient) => normalize(`${patient.name} ${patient.dpi} ${patient.folio}`).includes(normalize(query))).slice(0, 6), [clinic.patients, query])
  const totalReceived = clinic.payments.filter((payment) => payment.status === 'Completado').reduce((sum, payment) => sum + Number(payment.amount), 0)
  return <div className={css.paymentsPage}>
    <Banner title="MÓDULO DE PAGOS" description="Gestiona cuentas, cargos, abonos y planes de pago desde un solo lugar." Icon={IconCreditCard} metrics={[[money(totalReceived), 'Ingresos registrados'], [clinic.charges.filter((charge) => charge.status !== 'Pagado').length, 'Cargos pendientes'], [clinic.paymentPlans.filter((plan) => plan.status === 'Activo').length, 'Planes activos']]} />
    <section className={css.patientPicker}>
      <div className={css.searchBox}><IconSearch /><TextField label="Buscar paciente" type="search" placeholder="Nombre, DPI o expediente..." value={query} onChange={(event) => setQuery(event.target.value)} /></div>
      {query && <div className={css.searchResults}>{matches.map((patient) => <button type="button" key={patient.id} onClick={() => { setSelectedId(patient.id); setQuery('') }}><Avatar patient={patient} variant="initials" /><span><strong>{patient.name}</strong><small>{patient.dpi} · {patient.folio}</small></span></button>)}{!matches.length && <p>Sin coincidencias.</p>}</div>}
      {selected && <div className={css.selectedPatient}><Avatar patient={selected} variant="initials" /><div><strong>{selected.name}</strong><small>DPI {selected.dpi} · {selected.phone} · {selected.folio}</small></div><Button size="sm" variant="ghost" onClick={() => { setSelectedId(''); setQuery('') }}>Cambiar paciente</Button></div>}
    </section>
    {selected ? <PatientAccount patient={selected} /> : <section className={css.noPatient}><IconCreditCard /><h2>Selecciona un paciente</h2><p>Busca por nombre, DPI o expediente para abrir su cuenta financiera.</p></section>}
  </div>
}
