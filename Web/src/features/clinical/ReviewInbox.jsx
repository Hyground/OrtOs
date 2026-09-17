import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { Button } from '@/components/ui/Button/Button'
import { Modal } from '@/components/ui/Modal/Modal'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog/ConfirmDialog'
import { useClinic, displayDate, money } from './mockStore'
import {
  useReviewInbox,
  approveAppointmentRequest,
  rejectAppointmentRequest,
  approvePaymentReport,
  rejectPaymentReport,
} from './reviewInboxStore'
import styles from './ReviewInbox.module.css'

export function ReviewInbox({ kind, onApproved }) {
  const clinic = useClinic()
  const { hash } = useLocation()
  const inbox = useReviewInbox()
  const isAppointment = kind === 'appointments'
  const sectionId = isAppointment ? 'solicitudes' : 'verificaciones'
  const items = isAppointment ? inbox.appointmentRequests : inbox.paymentReports
  const pendingStatus = isAppointment ? 'Por aprobar' : 'Por verificar'
  const pending = items.filter((item) => item.status === pendingStatus)
  const [filter, setFilter] = useState('pending')
  const [open, setOpen] = useState(false)
  const [confirming, setConfirming] = useState(null)
  const [rejecting, setRejecting] = useState(null)
  const [reason, setReason] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const visible = filter === 'pending' ? pending : items
  const patientName = (id) => clinic.patients.find((patient) => patient.id === id)?.name ?? 'Paciente'
  const paymentFor = (id) => clinic.payments.find((payment) => payment.id === id)

  useEffect(() => {
    if (hash === '#' + sectionId) setOpen(true)
  }, [hash, sectionId])

  async function approve() {
    if (!confirming) return
    setBusy(true)
    setError('')
    try {
      const result = isAppointment
        ? await approveAppointmentRequest(confirming.id)
        : await approvePaymentReport(confirming.id)
      setConfirming(null)
      onApproved?.(result)
    } catch (failure) {
      setError(failure.message)
    } finally {
      setBusy(false)
    }
  }

  function reject(item) {
    try {
      if (isAppointment) rejectAppointmentRequest(item.id, reason)
      else rejectPaymentReport(item.id, reason)
      setRejecting(null)
      setReason('')
      setError('')
    } catch (failure) {
      setError(failure.message)
    }
  }

  return (
    <>
      <button
        type="button"
        className={styles.launcher}
        onClick={() => setOpen(true)}
        aria-label={(isAppointment ? 'Solicitudes de cita' : 'Pagos por verificar') + ', ' + pending.length + ' pendientes'}
      >
        <span>{isAppointment ? 'Solicitudes' : 'Por verificar'}</span>
        <strong>{pending.length}</strong>
      </button>
      <Modal open={open} size="review" title={isAppointment ? 'Solicitudes de cita' : 'Pagos por verificar'} onClose={() => setOpen(false)}>
        <section id={sectionId} className={styles.panel} aria-label={isAppointment ? 'Solicitudes de cita' : 'Pagos por verificar'}>
      <div className={styles.heading}>
        <div>
          <span className={styles.eyebrow}>Solicitudes desde la app · demostración</span>
          <h2>{isAppointment ? 'Solicitudes de cita' : 'Pagos por verificar'}</h2>
          <p>{isAppointment
            ? 'Aprobar crea la cita en el calendario. Hasta entonces, no ocupa el horario.'
            : 'Las transferencias se verifican aquí. Tarjeta requerirá una pasarela; efectivo se registra en clínica. Un reporte sin verificar no cuenta como ingreso.'}</p>
        </div>
        <span className={styles.count}>{pending.length} {isAppointment ? 'por aprobar' : 'por verificar'}</span>
      </div>

      <div className={styles.filters} aria-label="Filtrar solicitudes">
        <button type="button" aria-pressed={filter === 'pending'} onClick={() => setFilter('pending')}>Pendientes ({pending.length})</button>
        <button type="button" aria-pressed={filter === 'all'} onClick={() => setFilter('all')}>Todas ({items.length})</button>
      </div>

      {visible.length ? (
        <ul className={styles.list}>
          {visible.map((item) => {
            const payment = !isAppointment ? paymentFor(item.paymentId) : null
            return (
              <li key={item.id} className={styles.item}>
                <div className={styles.itemMain}>
                  <div className={styles.itemTop}>
                    <strong>{patientName(item.patientId)}</strong>
                    <span className={styles.status} data-pending={item.status === pendingStatus}>{item.status}</span>
                  </div>
                  <p>{isAppointment
                    ? displayDate(item.date) + ' · ' + item.time + ' · ' + item.dentist + ' · ' + item.treatment
                    : (payment?.concept ?? 'Pago') + ' · ' + money(item.amount, payment?.currency ?? 'GTQ') + ' · ' + item.method}</p>
                  {!isAppointment && <small>Referencia: {item.reference}</small>}
                  {item.reason && <small>Motivo: {item.reason}</small>}
                </div>
                {item.status === pendingStatus && (
                  <div className={styles.actions}>
                    <Button size="sm" onClick={() => { setError(''); setConfirming(item) }}>
                      {isAppointment ? 'Aprobar cita' : 'Verificar pago'}
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => { setError(''); setReason(''); setRejecting(item.id) }}>
                      Rechazar
                    </Button>
                  </div>
                )}
                {rejecting === item.id && (
                  <div className={styles.rejectForm}>
                    <label htmlFor={'reason-' + item.id}>Motivo del rechazo</label>
                    <textarea id={'reason-' + item.id} value={reason} onChange={(event) => setReason(event.target.value)} rows={2} maxLength={300} placeholder="Explica brevemente el motivo" />
                    {error && <p role="alert">{error}</p>}
                    <div>
                      <Button size="sm" variant="ghost" onClick={() => { setRejecting(null); setError('') }}>Volver</Button>
                      <Button size="sm" onClick={() => reject(item)}>Confirmar rechazo</Button>
                    </div>
                  </div>
                )}
              </li>
            )
          })}
        </ul>
      ) : (
        <p className={styles.empty}>No hay {isAppointment ? 'solicitudes de cita' : 'reportes de pago'} por revisar.</p>
      )}

        </section>
      </Modal>
      <ConfirmDialog
        open={!!confirming}
        title={isAppointment ? 'Aprobar solicitud de cita' : 'Verificar reporte de pago'}
        message={isAppointment
          ? '¿Estás seguro de aprobar esta solicitud y agregar la cita al calendario?'
          : '¿Confirmaste la transferencia y quieres registrar este pago como recibido?'}
        confirmLabel={isAppointment ? 'Aprobar cita' : 'Registrar pago'}
        busy={busy}
        error={error}
        onClose={() => { setConfirming(null); setError('') }}
        onConfirm={approve}
      />
    </>
  )
}