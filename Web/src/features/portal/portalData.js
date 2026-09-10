export function patientData(clinic,user){
 const patient=user?.role==='paciente'&&user.patientId?clinic.patients.find(p=>p.id===user.patientId):null
 return {patient,appointments:patient?clinic.appointments.filter(a=>a.patientId===patient.id):[],payments:patient?clinic.payments.filter(p=>p.patientId===patient.id):[]}
}

