import { useMemo, useState } from 'react'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { useClinic } from '@/features/clinical/mockStore'
import { useReviewInbox } from '@/features/clinical/reviewInboxStore'
import { notificationsFor } from './notificationData'
import { Modal } from '@/components/ui/Modal/Modal'
import { Button } from '@/components/ui/Button/Button'
import { IconBell, IconCalendar, IconCreditCard } from '@/components/icons/icons'
import styles from './Notifications.module.css'

function readIds(key) {
  try {
    const value = JSON.parse(localStorage.getItem(key) || '[]')
    return Array.isArray(value) ? value : []
  } catch {
    return []
  }
}

export function Notifications() {
  const { user } = useAuth()
  const clinic = useClinic()
  const reviewInbox = useReviewInbox()
  const items = useMemo(() => notificationsFor(clinic, user, reviewInbox), [clinic, user, reviewInbox])
  const key = 'ortos.notifications.read.' + user?.id
  const [stored, setStored] = useState(() => ({ key, ids: readIds(key) }))
  const ids = stored.key === key ? stored.ids : readIds(key)
  const [open, setOpen] = useState(false)
  const [filter, setFilter] = useState('all')
  const taskMode = user?.role !== 'paciente'
  const unread = taskMode ? items : items.filter((item) => !ids.includes(item.id))
  const visible = filter === 'unread' ? unread : items

  const mark = (next) => {
    const value = [...new Set([...ids, ...next])].slice(-1000)
    setStored({ key, ids: value })
    try {
      localStorage.setItem(key, JSON.stringify(value))
    } catch {
      // The current page can still track read items without local storage.
    }
  }

  return (
    <>
      <button
        type="button"
        className={styles.trigger}
        aria-label={'Notificaciones' + (unread.length ? ', ' + unread.length + (taskMode ? ' pendientes' : ' sin leer') : '')}
        title="Notificaciones"
        onClick={() => setOpen(true)}
      >
        <IconBell />
        {unread.length > 0 && <span className={styles.badge}>{unread.length > 99 ? '99+' : unread.length}</span>}
      </button>

      <Modal open={open} size="notifications" title="Notificaciones" onClose={() => setOpen(false)}>
        <div className={styles.summary}>
          <span className={styles.summaryIcon}><IconBell /></span>
          <div>
            <strong>{unread.length ? unread.length + (taskMode ? ' tareas pendientes' : ' avisos sin leer') : 'Todo al día'}</strong>
            <p>{taskMode ? 'Solicitudes que necesitan una decisión.' : 'Avisos de citas y pagos registrados.'}</p>
          </div>
        </div>

        <div className={styles.toolbar}>
          <div className={styles.filters} aria-label="Filtrar notificaciones">
            <button type="button" className={filter === 'all' ? styles.filterActive : ''} aria-pressed={filter === 'all'} onClick={() => setFilter('all')}>
              Todas <span>{items.length}</span>
            </button>
            <button type="button" className={filter === 'unread' ? styles.filterActive : ''} aria-pressed={filter === 'unread'} onClick={() => setFilter('unread')}>
              {taskMode ? 'Pendientes' : 'Sin leer'} <span>{unread.length}</span>
            </button>
          </div>
          {!taskMode && unread.length > 0 && (
            <button type="button" className={styles.markAll} onClick={() => mark(unread.map((item) => item.id))}>
              Marcar todas como leídas
            </button>
          )}
        </div>

        {visible.length ? (
          <ul className={styles.list}>
            {visible.map((item) => {
              const Icon = item.kind === 'citas' ? IconCalendar : IconCreditCard
              const isUnread = taskMode || !ids.includes(item.id)
              return (
                <li key={item.id} className={styles.item} data-unread={isUnread}>
                  <span className={styles.itemIcon} data-kind={item.kind}><Icon /></span>
                  <div className={styles.itemBody}>
                    <div className={styles.itemHeading}>
                      <strong>{item.title}</strong>
                      {isUnread && <span className={styles.unreadLabel}>{taskMode ? 'Requiere atención' : 'Nuevo'}</span>}
                    </div>
                    <p>{item.detail}</p>
                    <div className={styles.itemActions}>
                      <Button size="sm" variant="ghost" to={item.href} onClick={() => { if (!taskMode) mark([item.id]); setOpen(false) }}>
                        Ver {item.kind === 'citas' ? 'cita' : 'pago'}
                      </Button>
                      {!taskMode && isUnread && (
                        <button type="button" className={styles.mark} onClick={() => mark([item.id])}>
                          Marcar como leída
                        </button>
                      )}
                    </div>
                  </div>
                </li>
              )
            })}
          </ul>
        ) : (
          <div className={styles.empty}>
            <IconBell />
            <strong>{filter === 'unread' ? taskMode ? 'No hay tareas pendientes' : 'No hay avisos sin leer' : 'No hay notificaciones'}</strong>
            <p>{filter === 'unread' ? taskMode ? 'Ya atendiste todas las solicitudes.' : 'Ya revisaste todos tus avisos.' : 'Los avisos de citas y pagos aparecerán aquí.'}</p>
          </div>
        )}
      </Modal>
    </>
  )
}