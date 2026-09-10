import { paths } from '@/app/routes/paths'
import { localDate,displayDate,money } from '@/features/clinical/mockStore'
export function notificationsFor(clinic,messages,user){
 if(!user)return []
 const personal=user.role==='paciente'
 if(personal&&!user.patientId)return []
 if(!['admin','odontologo','paciente'].includes(user.role))return []
 const appointments=clinic.appointments.filter(a=>(!personal||a.patientId===user.patientId)&&a.status==='Pendiente').sort((a,b)=>(a.date+a.time).localeCompare(b.date+b.time))
 const payments=clinic.payments.filter(p=>!personal||p.patientId===user.patientId)
 const incoming=messages.filter(m=>(!personal||m.patientId===user.patientId)&&m.from===(personal?'clinic':'patient'))
 const items=[]
 for(const a of appointments){const name=clinic.patients.find(p=>p.id===a.patientId)?.name??'Paciente';items.push({id:'appointment-'+a.id+'-'+a.date+'-'+a.time,title:(a.date>=localDate()?'Cita programada':'Cita pendiente de actualizar'),detail:(personal?'':name+' · ')+displayDate(a.date)+' '+a.time+' · '+a.treatment,href:personal?paths.myAppointments:paths.appointments+'?fecha='+a.date,kind:'citas'})}
 for(const p of payments.filter(p=>p.status==='Pendiente')){items.push({id:'pending-'+p.id+'-'+p.amount,title:'Pago pendiente',detail:(personal?'':(clinic.patients.find(a=>a.id===p.patientId)?.name??'Paciente')+' · ')+p.concept+' · '+money(p.amount,p.currency),href:personal?paths.myPayments:paths.payments+'?estado=Pendiente',kind:'pagos'})}
 for(const p of [...payments].filter(p=>p.status==='Completado').sort((a,b)=>b.date.localeCompare(a.date)).slice(0,3)){items.push({id:'paid-'+p.id+'-'+p.amount,title:'Pago registrado',detail:displayDate(p.date)+' · '+p.concept+' · '+money(p.amount,p.currency),href:personal?paths.myPayments:paths.payments+'?mes='+p.date.slice(0,7),kind:'pagos'})}
 for(const m of incoming){items.unshift({id:'message-'+m.id,title:personal?'Mensaje de la clínica':'Mensaje de '+(clinic.patients.find(p=>p.id===m.patientId)?.name??'paciente'),detail:m.text,href:paths.messages+'?paciente='+m.patientId,kind:'mensajes'})}
 return items
}

