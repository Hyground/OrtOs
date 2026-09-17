import { Modal } from '@/components/ui/Modal/Modal'
import { Button } from '@/components/ui/Button/Button'
import styles from './ConfirmDialog.module.css'

export function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = 'Confirmar',
  cancelLabel = 'Cancelar',
  danger = false,
  busy = false,
  error,
  onConfirm,
  onClose,
}) {
  return (
    <Modal open={open} title={title} onClose={() => !busy && onClose()}>
      <div className={styles.content}>
        <p className={styles.message}>{message}</p>
        {error && <p role="alert" className={styles.error}>{error}</p>}
        <div className={styles.actions}>
          <Button variant="ghost" disabled={busy} onClick={onClose}>{cancelLabel}</Button>
          <Button
            className={danger ? styles.danger : undefined}
            disabled={busy}
            onClick={onConfirm}
          >
            {confirmLabel}
          </Button>
        </div>
      </div>
    </Modal>
  )
}
