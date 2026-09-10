import { useMemo,useState } from 'react'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { useClinic } from '@/features/clinical/mockStore'
import { useMessages } from '@/features/messages/messageStore'
import { notificationsFor } from './notificationData'
import { Modal } from '@/components/ui/Modal/Modal'
import { Button } from '@/components/ui/Button/Button'
import { IconBell,IconCalendar,IconCreditCard,IconMail } from '@/components/icons/icons'
import styles from './Notifications.module.css'
function readIds(key){try{const value=JSON.parse(localStorage.getItem(key)||'[]');return Array.isArray(value)?value:[]}catch{return []}}
export function Notifications(){
 const {user}=useAuth();const clinic=useClinic();const messages=useMessages()
 const items=useMemo(()=>notificationsFor(clinic,messages,user),[clinic,messages,user])
 const key='ortos.notifications.read.'+user?.id
 const [stored,setStored]=useState(()=>({key,ids:readIds(key)}))
 const ids=stored.key===key?stored.ids:readIds(key)
 const [open,setOpen]=useState(false);const [onlyUnread,setOnlyUnread]=useState(false)
 const unread=items.filter(n=>!ids.includes(n.id));const visible=onlyUnread?unread:items
 const mark=next=>{const value=[...new Set([...ids,...next])].slice(-1000);setStored({key,ids:value});try{localStorage.setItem(key,JSON.stringify(value))}catch{/* Read state remains available for this page. */}}
 return <><button type="button" className={styles.trigger} aria-label={'Notificaciones'+(unread.length?', '+unread.length+' sin leer':'')} title="Notificaciones" onClick={()=>setOpen(true)}><IconBell/>{unread.length>0&&<span>{unread.length>99?'99+':unread.length}</span>}</button><Modal open={open} size="wide" title="Notificaciones" onClose={()=>setOpen(false)}><div className={styles.toolbar}><p>{unread.length} sin leer · {items.length} notificaciones</p><label><input type="checkbox" checked={onlyUnread} onChange={e=>setOnlyUnread(e.target.checked)}/> Solo sin leer</label><Button size="sm" variant="ghost" disabled={!unread.length} onClick={()=>mark(items.map(n=>n.id))}>Marcar todas como leídas</Button></div><p className={styles.note}>Información calculada a partir de las citas, pagos y mensajes registrados en OrtOs.</p><ul className={styles.list}>{visible.map(n=>{const Icon=n.kind==='citas'?IconCalendar:n.kind==='pagos'?IconCreditCard:IconMail;return <li key={n.id} data-unread={!ids.includes(n.id)}><Icon/><div><strong>{n.title}</strong><p>{n.detail}</p><Button size="sm" variant="ghost" to={n.href} onClick={()=>{mark([n.id]);setOpen(false)}}>Ver {n.kind}</Button></div>{!ids.includes(n.id)&&<button type="button" className={styles.mark} aria-label={'Marcar como leída: '+n.title} onClick={()=>mark([n.id])}>✓</button>}</li>})}</ul>{!visible.length&&<p className={styles.empty}>{onlyUnread?'Estás al día. No tienes notificaciones sin leer.':'No hay notificaciones para tu cuenta.'}</p>}</Modal></>
}

