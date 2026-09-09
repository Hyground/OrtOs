import { useMemo, useState } from 'react'
import { IconClose, IconMail, IconSend, IconUser } from '@/components/icons/icons'
import styles from './FloatingChat.module.css'

const conversations = [
  {
    id: 'ana',
    name: 'Ana Rivera',
    subject: 'Consulta sobre cita',
    unread: 2,
    messages: [
      { id: 'm1', from: 'patient', text: 'Hola, necesito confirmar mi cita de hoy.' },
      {
        id: 'm2',
        from: 'admin',
        text: 'Hola Ana, con gusto. Su cita esta programada para las 10:30.',
      },
      { id: 'm3', from: 'patient', text: 'Perfecto, muchas gracias.' },
    ],
  },
  {
    id: 'carlos',
    name: 'Carlos Mendez',
    subject: 'Pago pendiente',
    unread: 1,
    messages: [
      { id: 'm1', from: 'patient', text: 'Podrian confirmarme el saldo de mi tratamiento?' },
      { id: 'm2', from: 'admin', text: 'Claro, reviso el expediente y le respondo en un momento.' },
    ],
  },
]

export function FloatingChat() {
  const [open, setOpen] = useState(false)
  const [activeId, setActiveId] = useState(conversations[0].id)
  const [draft, setDraft] = useState('')
  const [sentMessages, setSentMessages] = useState([])

  const activeConversation = conversations.find((conversation) => conversation.id === activeId)
  const activeSentMessages = sentMessages.filter((message) => message.conversationId === activeId)
  const unreadTotal = useMemo(
    () => conversations.reduce((total, conversation) => total + conversation.unread, 0),
    [],
  )

  const handleSubmit = (event) => {
    event.preventDefault()
    const text = draft.trim()
    if (!text) return
    setSentMessages((current) => [
      ...current,
      {
        id: `${activeId}-${Date.now()}`,
        conversationId: activeId,
        from: 'admin',
        text,
      },
    ])
    setDraft('')
  }

  return (
    <div className={styles.root}>
      {open ? (
        <section className={styles.panel} aria-label="Chat de pacientes">
          <header className={styles.header}>
            <div>
              <span>Mensajes</span>
              <h2>Chat con pacientes</h2>
            </div>
            <button type="button" aria-label="Cerrar chat" onClick={() => setOpen(false)}>
              <IconClose />
            </button>
          </header>

          <div className={styles.body}>
            <aside className={styles.conversations} aria-label="Conversaciones">
              {conversations.map((conversation) => (
                <button
                  key={conversation.id}
                  type="button"
                  className={conversation.id === activeId ? styles.conversationActive : undefined}
                  onClick={() => setActiveId(conversation.id)}
                >
                  <span className={styles.avatar}>
                    <IconUser />
                  </span>
                  <span>
                    <strong>{conversation.name}</strong>
                    <small>{conversation.subject}</small>
                  </span>
                  {conversation.unread ? <em>{conversation.unread}</em> : null}
                </button>
              ))}
            </aside>

            <div className={styles.chatArea}>
              <div className={styles.chatTitle}>
                <strong>{activeConversation.name}</strong>
                <span>En linea</span>
              </div>

              <ol className={styles.messages}>
                {[...activeConversation.messages, ...activeSentMessages].map((message) => (
                  <li
                    key={message.id}
                    className={message.from === 'admin' ? styles.messageOwn : styles.messagePatient}
                  >
                    {message.text}
                  </li>
                ))}
              </ol>

              <form className={styles.composer} onSubmit={handleSubmit}>
                <label>
                  <span className={styles.srOnly}>Responder mensaje</span>
                  <textarea
                    value={draft}
                    onChange={(event) => setDraft(event.target.value)}
                    placeholder="Escribir respuesta..."
                    rows={2}
                  />
                </label>
                <button type="submit" aria-label="Enviar mensaje" disabled={!draft.trim()}>
                  <IconSend />
                </button>
              </form>
            </div>
          </div>
        </section>
      ) : null}

      <button
        type="button"
        className={styles.bubble}
        aria-label={open ? 'Cerrar chat' : 'Abrir chat'}
        aria-expanded={open}
        onClick={() => setOpen((current) => !current)}
      >
        <IconMail />
        {unreadTotal ? <span>{unreadTotal}</span> : null}
      </button>
    </div>
  )
}
