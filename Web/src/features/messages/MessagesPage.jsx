import { useEffect, useRef, useState } from 'react'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { useClinic } from '@/features/clinical/mockStore'
import { sendMessage, useMessages } from './messageStore'
import { TextField } from '@/components/ui/TextField/TextField'
import { Button } from '@/components/ui/Button/Button'
import { IconMail, IconSend } from '@/components/icons/icons'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import css from './MessagesPage.module.css'
import styles from '@/features/clinical/Clinical.module.css'

export function MessagesPage() {
  useDocumentTitle('Mensajes')
  const { user } = useAuth()
  const clinic = useClinic()
  const all = useMessages()
  const patientRole = user.role === 'paciente'
  const [selected, setSelected] = useState(patientRole ? user.patientId : 'patient-1')
  const [query, setQuery] = useState('')
  const [draft, setDraft] = useState('')
  const [error, setError] = useState('')
  const end = useRef(null)
  const patientId = patientRole ? user.patientId : selected
  const people = clinic.patients.filter((patient) => (!patientRole || patient.id === user.patientId) && `${patient.name} ${patient.folio}`.toLowerCase().includes(query.toLowerCase()))
  const current = clinic.patients.find((patient) => patient.id === patientId)
  const messages = current ? all.filter((message) => message.patientId === patientId) : []

  useEffect(() => { end.current?.scrollIntoView?.({ block: 'nearest' }) }, [all, patientId])

  function submit(event) {
    event.preventDefault()
    try { sendMessage(user, patientId, draft); setDraft('') } catch (reason) { setError(reason.message) }
  }

  return <div className={styles.page}>
    <header><h1><IconMail /> {patientRole ? 'Mensajes con la clínica' : 'Mensajes de pacientes'}</h1><p className={styles.muted}>Conversaciones del entorno de demostración. No se envían mensajes fuera de esta aplicación.</p></header>
    <section className={css.layout}>
      {!patientRole && <aside className={css.people}><TextField label="Buscar conversación" type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Paciente o expediente..." /><div className={css.peopleList}>{people.slice(0, 50).map((patient) => <button key={patient.id} aria-pressed={patientId === patient.id} onClick={() => { setSelected(patient.id); setDraft(''); setError('') }}><strong>{patient.name}</strong><small>{patient.folio}</small></button>)}{!people.length && <p>No se encontraron pacientes.</p>}</div></aside>}
      <div className={css.chat}>
        <header className={css.chatHeader}><strong>{patientRole ? 'Recepción OrtOs' : current?.name ?? 'Selecciona una conversación'}</strong><small>{current?.folio}</small></header>
        <ol className={css.messages} aria-label="Mensajes de la conversación" aria-live="polite">{messages.map((message) => <li key={message.id} className={(patientRole ? message.from === 'patient' : message.from === 'clinic') ? css.own : css.received}><span>{message.text}</span><time dateTime={message.createdAt}>{new Date(message.createdAt).toLocaleString('es-GT', { dateStyle: 'short', timeStyle: 'short' })}</time></li>)}{!messages.length && <li className={css.empty}>{current ? 'Aún no hay mensajes.' : 'La cuenta aún no tiene un expediente vinculado.'}</li>}<li ref={end} aria-hidden="true" /></ol>
        <form className={css.composer} onSubmit={submit}><label><span>Mensaje</span><textarea rows={2} maxLength={2000} value={draft} onChange={(event) => setDraft(event.target.value)} disabled={!current} placeholder="Escribe tu mensaje..." /></label><Button type="submit" disabled={!current || !draft.trim()}><IconSend /> Enviar</Button></form>
        {error && <p role="alert">{error}</p>}
      </div>
    </section>
  </div>
}
