import { useEffect, useRef, useState } from 'react'
import { IconChevronLeft, IconClose, IconMail, IconSend, IconUser } from '@/components/icons/icons'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { useClinic } from '@/features/clinical/mockStore'
import { sendMessage, useMessages } from '@/features/messages/messageStore'
import styles from './FloatingChat.module.css'

export function FloatingChat() {
  const { user } = useAuth()
  const { patients } = useClinic()
  const messages = useMessages()
  const [open, setOpen] = useState(false)
  const [mobileView, setMobileView] = useState('list')
  const [selectedId, setSelectedId] = useState(null)
  const [query, setQuery] = useState('')
  const [draft, setDraft] = useState('')
  const [error, setError] = useState('')
  const endRef = useRef(null)
  const panelRef = useRef(null)

  const conversations = patients
    .filter((patient) => user?.role !== 'paciente' || patient.id === user.patientId)
    .map((patient) => ({
      patient,
      lastMessage: messages.filter((message) => message.patientId === patient.id).at(-1),
    }))
    .sort(
      (a, b) =>
        (b.lastMessage?.createdAt ?? '').localeCompare(a.lastMessage?.createdAt ?? '') ||
        a.patient.name.localeCompare(b.patient.name),
    )
  const visibleConversations = conversations.filter(({ patient }) =>
    `${patient.name} ${patient.folio ?? ''}`.toLocaleLowerCase().includes(query.trim().toLocaleLowerCase()),
  )
  const current = conversations.find(({ patient }) => patient.id === selectedId)?.patient ?? conversations[0]?.patient
  const currentMessages = current
    ? messages.filter((message) => message.patientId === current.id)
    : []

  useEffect(() => {
    if (open && mobileView === 'conversation') endRef.current?.scrollIntoView?.({ block: 'end' })
  }, [open, mobileView, current?.id, messages])

  useEffect(() => {
    if (!open || !window.visualViewport) return undefined
    const viewport = window.visualViewport
    const updateViewport = () => {
      panelRef.current?.style.setProperty('--chat-visible-top', viewport.offsetTop + 'px')
      panelRef.current?.style.setProperty('--chat-visible-height', viewport.height + 'px')
    }
    updateViewport()
    viewport.addEventListener('resize', updateViewport)
    viewport.addEventListener('scroll', updateViewport)
    return () => {
      viewport.removeEventListener('resize', updateViewport)
      viewport.removeEventListener('scroll', updateViewport)
    }
  }, [open])

  useEffect(() => {
    if (!open) return undefined
    const onKeyDown = (event) => {
      if (event.key === 'Escape') {
        setOpen(false)
        setMobileView('list')
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [open])

  const close = () => {
    setOpen(false)
    setMobileView('list')
    setError('')
  }

  const selectConversation = (patientId) => {
    setSelectedId(patientId)
    setMobileView('conversation')
    setDraft('')
    setError('')
  }

  const handleSubmit = (event) => {
    event.preventDefault()
    if (!current || !draft.trim()) return
    try {
      sendMessage(user, current.id, draft)
      setDraft('')
      setError('')
    } catch (reason) {
      setError(reason.message)
    }
  }

  return (
    <div className={styles.root}>
      <button
        type="button"
        className={styles.trigger}
        aria-label={open ? 'Cerrar mensajes' : 'Abrir mensajes'}
        aria-expanded={open}
        onClick={() => (open ? close() : setOpen(true))}
      >
        <IconMail />
      </button>

      {open && (
        <section
          ref={panelRef}
          className={styles.panel}
          data-mobile-view={mobileView}
          aria-label="Mensajes de pacientes"
        >
          <header className={styles.header}>
            <button
              type="button"
              className={styles.backButton}
              aria-label="Volver a conversaciones"
              onClick={() => setMobileView('list')}
            >
              <IconChevronLeft />
            </button>
            <div>
              <span>Mensajes</span>
              <h2>{mobileView === 'conversation' ? current?.name ?? 'Conversación' : 'Conversaciones'}</h2>
            </div>
            <button type="button" className={styles.closeButton} aria-label="Cerrar mensajes" onClick={close}>
              <IconClose />
            </button>
          </header>

          <div className={styles.body}>
            <aside className={styles.conversations} aria-label="Conversaciones">
              <label className={styles.search}>
                <span className={styles.srOnly}>Buscar conversación</span>
                <input
                  type="search"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Buscar paciente o expediente"
                />
              </label>
              <div className={styles.conversationList}>
                {visibleConversations.map(({ patient, lastMessage }) => (
                  <button
                    key={patient.id}
                    type="button"
                    className={patient.id === current?.id ? styles.conversationActive : undefined}
                    onClick={() => selectConversation(patient.id)}
                  >
                    <span className={styles.avatar}><IconUser /></span>
                    <span className={styles.conversationText}>
                      <strong>{patient.name}</strong>
                      <small>{lastMessage?.text ?? 'Sin mensajes todavía'}</small>
                    </span>
                    {lastMessage && (
                      <time dateTime={lastMessage.createdAt}>
                        {new Date(lastMessage.createdAt).toLocaleDateString('es-GT', {
                          day: '2-digit',
                          month: '2-digit',
                        })}
                      </time>
                    )}
                  </button>
                ))}
                {!visibleConversations.length && <p className={styles.empty}>No se encontraron conversaciones.</p>}
              </div>
            </aside>

            <div className={styles.chatArea}>
              {current ? (
                <>
                  <div className={styles.chatTitle}>
                    <strong>{current.name}</strong>
                    <span>{current.folio}</span>
                  </div>
                  <ol className={styles.messages} aria-label="Mensajes de la conversación" aria-live="polite">
                    {currentMessages.map((message) => (
                      <li
                        key={message.id}
                        className={
                          (user?.role === 'paciente' ? message.from === 'patient' : message.from === 'clinic')
                            ? styles.messageOwn
                            : styles.messagePatient
                        }
                      >
                        <span>{message.text}</span>
                        <time dateTime={message.createdAt}>
                          {new Date(message.createdAt).toLocaleString('es-GT', {
                            dateStyle: 'short',
                            timeStyle: 'short',
                          })}
                        </time>
                      </li>
                    ))}
                    {!currentMessages.length && <li className={styles.empty}>Aún no hay mensajes.</li>}
                    <li ref={endRef} className={styles.scrollAnchor} aria-hidden="true" />
                  </ol>
                  <form className={styles.composer} onSubmit={handleSubmit}>
                    <label>
                      <span className={styles.srOnly}>Escribir mensaje</span>
                      <textarea
                        value={draft}
                        onChange={(event) => setDraft(event.target.value)}
                        placeholder="Escribe un mensaje..."
                        rows={2}
                        maxLength={2000}
                      />
                    </label>
                    <button type="submit" aria-label="Enviar mensaje" disabled={!draft.trim()}>
                      <IconSend />
                    </button>
                  </form>
                  {error && <p role="alert" className={styles.error}>{error}</p>}
                </>
              ) : (
                <p className={styles.empty}>No hay pacientes disponibles.</p>
              )}
            </div>
          </div>
        </section>
      )}
    </div>
  )
}
