import { useSyncExternalStore } from 'react'
let messages=[
 {id:'message-1',patientId:'patient-1',from:'clinic',text:'Bienvenida a OrtOs. Puedes consultar tus citas y comprobantes desde tu panel.',createdAt:'2026-08-30T15:00:00Z'},
 {id:'message-2',patientId:'patient-1',from:'patient',text:'Gracias. ¿Podrían indicarme cómo solicitar mi próxima revisión?',createdAt:'2026-08-30T15:15:00Z'},
 {id:'message-3',patientId:'patient-2',from:'patient',text:'Quisiera consultar las indicaciones para mi limpieza dental.',createdAt:'2026-08-29T16:00:00Z'}
]
const listeners=new Set()
const subscribe=fn=>{listeners.add(fn);return()=>listeners.delete(fn)}
export function useMessages(){return useSyncExternalStore(subscribe,()=>messages)}
export function sendMessage(user,patientId,text){
 if(!text.trim())throw new Error('Escribe un mensaje.')
 if(user?.role==='paciente'&&user.patientId!==patientId)throw new Error('Conversación no autorizada.')
 if(!['admin','odontologo','asistente','paciente'].includes(user?.role)||!patientId)throw new Error('Conversación no autorizada.')
 messages=[...messages,{id:crypto.randomUUID(),patientId,from:user.role==='paciente'?'patient':'clinic',text:text.trim(),createdAt:new Date().toISOString()}];listeners.forEach(fn=>fn())
}

