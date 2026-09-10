import { useState } from 'react'
import { useLocation,Link } from 'react-router-dom'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { useClinic,localDate,displayDate,money } from '@/features/clinical/mockStore'
import { patientData } from './portalData'
import { paths } from '@/app/routes/paths'
import { Button } from '@/components/ui/Button/Button'
import { Badge } from '@/components/ui/Badge/Badge'
import { ReceiptModal } from '@/features/payments/components/ReceiptModal'
import { Avatar } from '@/features/clinical/components'
import { IconCalendar,IconCreditCard,IconUser,IconTooth,IconMail } from '@/components/icons/icons'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import styles from '@/features/clinical/Clinical.module.css'
import css from './PatientPortal.module.css'
export function PatientPortal(){
 const {user}=useAuth();const clinic=useClinic();const {pathname}=useLocation();const [receipt,setReceipt]=useState(null)
 const {patient,appointments,payments}=patientData(clinic,user)
 const today=localDate();const next=appointments.filter(a=>a.date>=today&&a.status==='Pendiente').sort((a,b)=>(a.date+a.time).localeCompare(b.date+b.time))[0]
 const pending=payments.filter(p=>p.status==='Pendiente');const paid=payments.filter(p=>p.status==='Completado')
 const title=pathname===paths.myAppointments?'Mis citas':pathname===paths.myPayments?'Mis pagos':pathname===paths.myProfile?'Mi perfil':pathname===paths.myTreatment?'Mi tratamiento':'Mi espacio de paciente'
 useDocumentTitle(title)
 if(!patient)return <section className={styles.cardBody}><h1>Mi espacio de paciente</h1><p>Tu cuenta todavía no tiene un expediente vinculado. Contacta a la clínica para completar tu registro.</p></section>
 const home=pathname===paths.dashboard
 return <div className={styles.page}><header className={css.hero}><Avatar patient={patient}/><div><span>PORTAL DEL PACIENTE</span><h1>{home?'Hola, '+patient.names:title}</h1><p>{patient.folio} · OrtOs Clínica Odontológica</p></div><Button to={paths.messages}><IconMail/> Contactar a la clínica</Button></header>
 {home?<><div className={css.grid}><section className={styles.card}><h2 className={styles.cardTitle}><IconCalendar/> PRÓXIMA CITA</h2><div className={styles.cardBody}>{next?<><h3>{displayDate(next.date)} · {next.time}</h3><p>{next.treatment}</p><p>{next.dentist}</p><Badge>{next.status}</Badge></>:<><h3>Sin citas próximas</h3><p>Escribe a la clínica para solicitar tu siguiente cita.</p></>}<Button to={paths.myAppointments} variant="ghost" size="sm">Ver mis citas</Button></div></section><section className={styles.card}><h2 className={styles.cardTitle}><IconTooth/> TRATAMIENTO ACTIVO</h2><div className={styles.cardBody}><h3>{patient.treatment}</h3><p>Consulta tus atenciones y el profesional que te acompaña.</p><Button to={paths.myTreatment} variant="ghost" size="sm">Ver tratamiento</Button></div></section><section className={styles.card}><h2 className={styles.cardTitle}><IconCreditCard/> MIS PAGOS</h2><div className={styles.cardBody}><h3>{money(paid.filter(p=>p.currency==='GTQ').reduce((sum,p)=>sum+Number(p.amount),0))}</h3><p>Pagos completados en GTQ · {pending.length} pagos pendientes</p><Button to={paths.myPayments} variant="ghost" size="sm">Ver pagos y comprobantes</Button></div></section></div><section className={styles.card}><h2 className={styles.cardTitle}>MI INFORMACIÓN</h2><div className={styles.cardBody}><p>Revisa tus datos de contacto para recibir las indicaciones de la clínica.</p><Link to={paths.myProfile}>Ver mi perfil →</Link></div></section></>:null}
 {pathname===paths.myAppointments&&<section className={styles.card}><h2 className={styles.cardTitle}>MI HISTORIAL DE CITAS</h2><div className={styles.tableScroll}><table className={styles.table}><thead><tr>{['FECHA','HORA','PROCEDIMIENTO','ODONTÓLOGO','ESTADO'].map(h=><th key={h}>{h}</th>)}</tr></thead><tbody>{[...appointments].sort((a,b)=>b.date.localeCompare(a.date)).map(a=><tr key={a.id}><td>{displayDate(a.date)}</td><td>{a.time}</td><td>{a.treatment}</td><td>{a.dentist}</td><td><Badge>{a.status}</Badge></td></tr>)}</tbody></table>{!appointments.length&&<p className={styles.empty}>No tienes citas registradas.</p>}</div><p className={styles.cardBody}>Para agendar, cambiar o cancelar una cita, <Link to={paths.messages}>contacta a la clínica</Link>.</p></section>}
 {pathname===paths.myPayments&&<section className={styles.card}><h2 className={styles.cardTitle}>MIS PAGOS Y COMPROBANTES</h2><div className={styles.tableScroll}><table className={styles.table}><thead><tr>{['FECHA','CONCEPTO','MONTO','MÉTODO','ESTADO','COMPROBANTE'].map(h=><th key={h}>{h}</th>)}</tr></thead><tbody>{[...payments].sort((a,b)=>b.date.localeCompare(a.date)).map(p=><tr key={p.id}><td>{displayDate(p.date)}</td><td>{p.concept}</td><td>{money(p.amount,p.currency)}</td><td>{p.method}</td><td><Badge>{p.status}</Badge></td><td>{p.receipt?<Button size="sm" variant="ghost" onClick={()=>setReceipt(p)}>Ver comprobante</Button>:'No emitido'}</td></tr>)}</tbody></table>{!payments.length&&<p className={styles.empty}>No tienes pagos registrados.</p>}</div></section>}
 {pathname===paths.myProfile&&<section className={styles.card}><h2 className={styles.cardTitle}><IconUser/> MIS DATOS</h2><dl className={css.profile}>{[['Nombre',patient.name],['DPI',patient.dpi],['Fecha de nacimiento',displayDate(patient.birthDate)],['Teléfono',patient.phone],['Correo de contacto',patient.email],['Dirección',patient.address],['Municipio',patient.municipality],['Correo de acceso',user.email]].map(([label,value])=><div key={label}><dt>{label}</dt><dd>{value||'No registrado'}</dd></div>)}</dl><p className={styles.cardBody}>Si tus datos cambiaron, solicita su actualización por <Link to={paths.messages}>Mensajes</Link>.</p></section>}
 {pathname===paths.myTreatment&&<section className={styles.card}><h2 className={styles.cardTitle}>MI TRATAMIENTO</h2><div className={styles.cardBody}><h3>{patient.treatment}</h3><p>Estado del expediente: <Badge>{patient.status}</Badge></p><h3>Atenciones completadas</h3>{appointments.filter(a=>a.status==='Completada').map(a=><div className={styles.metricRow} key={a.id}><span>{displayDate(a.date)} · {a.treatment}</span><strong>{a.dentist}</strong></div>)}{!appointments.some(a=>a.status==='Completada')&&<p>Todavía no hay atenciones completadas en tu expediente.</p>}<p>Para indicaciones clínicas personalizadas, comunícate con tu odontólogo.</p></div></section>}
 {receipt&&<ReceiptModal payment={receipt} patient={patient} onClose={()=>setReceipt(null)}/>}
 </div>
}

