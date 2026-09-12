import { useMemo, useState } from 'react'
import qrcode from 'qrcode-generator'
import {
  IconCalendar,
  IconCheckCircle,
  IconClock,
  IconDownload,
  IconMedical,
  IconPrint,
} from '@/components/icons/icons'
import { Button } from '@/components/ui/Button/Button'
import { SelectField } from '@/components/ui/SelectField/SelectField'
import { TextAreaField } from '@/components/ui/TextAreaField/TextAreaField'
import { TextField } from '@/components/ui/TextField/TextField'
import { dentists } from '@/features/appointments/mockData/appointments'
import { useAppointments } from '@/features/appointments/hooks/useAppointments'
import { displayDate, localDate } from '@/features/clinical/mockStore'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import styles from './BookAppointmentPage.module.css'

const chairs = ['Sillon 1', 'Sillon 2', 'Sillon 3']
const workHours = ['09:00', '10:00', '11:00', '12:00', '14:00', '15:00', '16:00', '17:00']
const dayNames = ['Dom', 'Lun', 'Mar', 'Mie', 'Jue', 'Vie', 'Sab']
const confirmationOptions = [
  { value: 'WhatsApp', label: 'WhatsApp' },
  { value: 'Llamada', label: 'Llamada' },
]
const emptyPatient = { names: '', surnames: '', dpi: '', phone: '', email: '' }
const emptyBooking = {
  date: '',
  time: '',
  dentist: '',
  chair: '',
  confirmation: 'WhatsApp',
  reason: '',
}
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function addDays(date, days) {
  const value = new Date(date + 'T12:00:00')
  value.setDate(value.getDate() + days)
  return value.toISOString().slice(0, 10)
}

function dayLabel(date) {
  const value = new Date(date + 'T12:00:00')
  return {
    dayName: dayNames[value.getDay()],
    dayNumber: String(value.getDate()).padStart(2, '0'),
    month: value.toLocaleDateString('es-GT', { month: 'short' }).replace('.', ''),
  }
}

function slotAvailable(appointments, date, time) {
  for (const dentist of dentists) {
    const dentistBusy = appointments.some(
      (appointment) =>
        appointment.date === date &&
        appointment.time === time &&
        appointment.dentist === dentist &&
        appointment.status !== 'Cancelada',
    )
    const usedChairs = appointments
      .filter(
        (appointment) =>
          appointment.date === date && appointment.time === time && appointment.status !== 'Cancelada',
      )
      .map((appointment) => appointment.chair)
    const chair = chairs.find((item) => !usedChairs.includes(item))

    if (!dentistBusy && chair) return { available: true, dentist, chair }
  }

  return { available: false, dentist: '', chair: '' }
}

function buildCalendarDays(appointments) {
  const today = localDate()
  return Array.from({ length: 21 }, (_, index) => {
    const date = addDays(today, index)
    const availableTimes = workHours.filter((time) => slotAvailable(appointments, date, time).available)
    return { date, count: availableTimes.length, ...dayLabel(date) }
  })
}

function buildTimeSlots(appointments, date) {
  if (!date) return []
  return workHours.map((time) => ({ time, ...slotAvailable(appointments, date, time) }))
}

function requestCode() {
  return 'ORT-' + localDate().replaceAll('-', '') + '-' + Math.random().toString(36).slice(2, 7).toUpperCase()
}

function QrCode({ value }) {
  const qr = useMemo(() => {
    const code = qrcode(0, 'M')
    code.addData(value)
    code.make()
    return code
  }, [value])
  const count = qr.getModuleCount()

  return (
    <svg className={styles.qr} viewBox={`-4 -4 ${count + 8} ${count + 8}`} role="img" aria-label="Codigo QR de solicitud">
      <rect x="-4" y="-4" width={count + 8} height={count + 8} fill="white" />
      {Array.from({ length: count * count }, (_, index) =>
        qr.isDark(Math.floor(index / count), index % count) ? (
          <rect key={index} x={index % count} y={Math.floor(index / count)} width="1" height="1" fill="black" />
        ) : null,
      )}
    </svg>
  )
}

async function createReceiptDocument(receipt) {
  const { jsPDF } = await import('jspdf')
  const doc = new jsPDF({ unit: 'mm', format: 'a4' })
  const patientName = receipt.name || [receipt.names, receipt.surnames].filter(Boolean).join(' ')
  const generatedAt = new Date().toLocaleString('es-GT', { dateStyle: 'medium', timeStyle: 'short' })
  const appointmentDate = displayDate(receipt.date)
  const navy = [12, 24, 43]
  const blue = [2, 132, 199]
  const blueDark = [3, 105, 161]
  const sky = [224, 242, 254]
  const ink = [15, 23, 42]
  const textColor = [51, 65, 85]
  const muted = [100, 116, 139]
  const border = [203, 213, 225]
  const panel = [248, 250, 252]

  const safeText = (value, fallback = 'No registrado') => String(value || fallback)
  const writeText = (value, x, y, maxWidth, maxLines = 2, fontSize = 10) => {
    doc.setFontSize(fontSize)
    const lines = doc.splitTextToSize(safeText(value), maxWidth)
    const visible = lines.slice(0, maxLines)
    if (lines.length > maxLines) {
      const lastLine = visible[visible.length - 1]
      visible[visible.length - 1] = lastLine.length > 5 ? lastLine.slice(0, lastLine.length - 3) + '...' : lastLine
    }
    doc.text(visible, x, y, { lineHeightFactor: 1.12 })
  }

  const field = (label, value, x, y, width, height = 24, maxLines = 2, fontSize = 10) => {
    doc.setFillColor(...panel)
    doc.setDrawColor(226, 232, 240)
    doc.roundedRect(x, y, width, height, 3, 3, 'FD')
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(7.2)
    doc.setTextColor(...muted)
    doc.text(label.toUpperCase(), x + 4, y + 6)
    doc.setTextColor(...ink)
    writeText(value, x + 4, y + 14, width - 8, maxLines, fontSize)
  }

  const sectionTitle = (title, x, y) => {
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(9.5)
    doc.setTextColor(...blueDark)
    doc.text(title.toUpperCase(), x, y)
    doc.setDrawColor(...sky)
    doc.setLineWidth(0.8)
    doc.line(x, y + 3, 192, y + 3)
  }

  doc.setProperties({ title: 'Comprobante de solicitud ' + receipt.code, author: 'OrtOs' })
  doc.setFillColor(255, 255, 255)
  doc.rect(0, 0, 210, 297, 'F')

  doc.setFillColor(...navy)
  doc.rect(0, 0, 52, 297, 'F')
  doc.setFillColor(...blue)
  doc.rect(52, 0, 4, 297, 'F')
  doc.setFillColor(...sky)
  doc.roundedRect(14, 18, 28, 28, 6, 6, 'F')
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(18)
  doc.setTextColor(...blueDark)
  doc.text('O', 28, 37, { align: 'center' })

  doc.setTextColor(255, 255, 255)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(16)
  doc.text('OrtOs', 14, 62)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8.5)
  doc.setTextColor(203, 213, 225)
  doc.text('Comprobante de', 14, 70)
  doc.text('solicitud de cita', 14, 75)

  doc.setDrawColor(71, 85, 105)
  doc.line(14, 92, 40, 92)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(7.5)
  doc.setTextColor(148, 163, 184)
  doc.text('CODIGO', 14, 107)
  doc.setTextColor(255, 255, 255)
  writeText(receipt.code, 14, 116, 29, 2, 9)

  const qr = qrcode(0, 'M')
  qr.addData(receipt.code)
  qr.make()
  const count = qr.getModuleCount()
  const size = 24
  const unit = size / count
  const qrX = 14
  const qrY = 136
  doc.setFillColor(255, 255, 255)
  doc.roundedRect(qrX - 3, qrY - 3, size + 6, size + 6, 3, 3, 'F')
  doc.setFillColor(...ink)
  for (let row = 0; row < count; row += 1) {
    for (let col = 0; col < count; col += 1) {
      if (qr.isDark(row, col)) doc.rect(qrX + col * unit, qrY + row * unit, unit, unit, 'F')
    }
  }
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(7)
  doc.setTextColor(203, 213, 225)
  doc.text('Validacion rapida', 14, 169)

  doc.setTextColor(148, 163, 184)
  doc.setFontSize(7.5)
  doc.text('Generado', 14, 258)
  doc.setTextColor(226, 232, 240)
  writeText(generatedAt, 14, 266, 29, 3, 7.2)

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(21)
  doc.setTextColor(...ink)
  doc.text('Solicitud recibida', 68, 28)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9.2)
  doc.setTextColor(...muted)
  doc.text('Comprobante con los datos enviados por el paciente.', 68, 37, { maxWidth: 88 })

  doc.setFillColor(...sky)
  doc.roundedRect(154, 21, 38, 12, 6, 6, 'F')
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(7.5)
  doc.setTextColor(...blueDark)
  doc.text('PENDIENTE', 173, 29, { align: 'center' })

  doc.setFillColor(...blue)
  doc.roundedRect(68, 52, 124, 48, 5, 5, 'F')
  doc.setTextColor(255, 255, 255)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(8.2)
  doc.text('FECHA SOLICITADA', 78, 66)
  writeText(appointmentDate, 78, 78, 70, 2, 13)
  doc.setFontSize(8.2)
  doc.text('HORA', 160, 66)
  doc.setFontSize(20)
  doc.text(receipt.time, 160, 82, { maxWidth: 24 })

  sectionTitle('Datos del paciente', 68, 119)
  field('Nombre completo', patientName, 68, 129, 80, 25, 2, 9.7)
  field('DPI', receipt.dpi, 154, 129, 38, 25, 1, 10.2)
  field('Telefono', receipt.phone, 68, 159, 58, 23, 1, 10.2)
  field('Correo', receipt.email, 132, 159, 60, 23, 2, 8.8)

  sectionTitle('Datos de la cita', 68, 199)
  field('Fecha', appointmentDate, 68, 209, 58, 25, 2, 8.8)
  field('Hora', receipt.time, 132, 209, 28, 25, 1, 10.2)
  field('Confirmar por', receipt.confirmation, 166, 209, 26, 25, 1, 8.8)

  doc.setFillColor(255, 255, 255)
  doc.setDrawColor(...border)
  doc.roundedRect(68, 247, 124, 25, 4, 4, 'FD')
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(8)
  doc.setTextColor(...muted)
  doc.text('MOTIVO DE LA VISITA', 76, 257)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(...textColor)
  writeText(receipt.reason, 76, 266, 108, 1, 9.2)

  doc.setFillColor(255, 251, 235)
  doc.setDrawColor(253, 230, 138)
  doc.roundedRect(68, 278, 124, 10, 4, 4, 'FD')
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(120, 53, 15)
  writeText('Pendiente hasta que la clinica contacte al paciente y confirme disponibilidad.', 74, 284, 112, 1, 7.3)

  return doc
}
async function downloadReceipt(receipt) {
  const doc = await createReceiptDocument(receipt)
  doc.save(receipt.code + '.pdf')
}

async function printReceipt(receipt) {
  const doc = await createReceiptDocument(receipt)
  const blob = doc.output('blob')
  const url = URL.createObjectURL(blob)
  const frame = document.createElement('iframe')

  frame.style.position = 'fixed'
  frame.style.right = '0'
  frame.style.bottom = '0'
  frame.style.width = '0'
  frame.style.height = '0'
  frame.style.border = '0'
  frame.onload = () => {
    setTimeout(() => {
      frame.contentWindow?.focus()
      frame.contentWindow?.print()
      setTimeout(() => {
        URL.revokeObjectURL(url)
        frame.remove()
      }, 60000)
    }, 300)
  }

  document.body.appendChild(frame)
  frame.src = url
}

export function BookAppointmentPage() {
  useDocumentTitle('Agendar cita')
  const appointments = useAppointments()
  const [step, setStep] = useState(1)
  const [patient, setPatient] = useState(emptyPatient)
  const [booking, setBooking] = useState(emptyBooking)
  const [receipt, setReceipt] = useState(null)

  const days = useMemo(() => buildCalendarDays(appointments), [appointments])
  const slots = useMemo(() => buildTimeSlots(appointments, booking.date), [appointments, booking.date])
  const selectedDay = days.find((day) => day.date === booking.date)
  const fullName = [patient.names, patient.surnames].filter(Boolean).join(' ').trim()
  const emailValid = !patient.email.trim() || emailPattern.test(patient.email.trim())
  const ready = patient.names.trim() && patient.surnames.trim() && patient.dpi.length >= 13 && patient.phone.length >= 8 && emailValid
  const canConfirm = ready && booking.date && booking.time

  const updatePatient = (key, value) => {
    setReceipt(null)
    let nextValue = value
    if (key === 'dpi') nextValue = value.replace(/\D/g, '').slice(0, 13)
    if (key === 'phone') nextValue = value.replace(/\D/g, '').slice(0, 8)
    if (key === 'email') nextValue = value.trim().slice(0, 80)
    setPatient((current) => ({ ...current, [key]: nextValue }))
  }
  const updateBooking = (patch) => {
    setReceipt(null)
    setBooking((current) => ({ ...current, ...patch }))
  }
  const chooseDate = (date) => {
    updateBooking({ date, time: '', dentist: '', chair: '' })
    setStep(3)
  }
  const chooseTime = (slot) => {
    updateBooking({ time: slot.time, dentist: slot.dentist, chair: slot.chair })
  }
  const confirmRequest = () => {
    if (!canConfirm) return
    const nextReceipt = { ...booking, ...patient, name: fullName, code: requestCode() }
    setReceipt(nextReceipt)
    void printReceipt(nextReceipt)
  }
  const resetFlow = () => {
    setStep(1)
    setPatient({ ...emptyPatient })
    setBooking({ ...emptyBooking })
    setReceipt(null)
  }

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <span>Agenda publica</span>
        <h1>Solicita tu cita</h1>
        <p>Ingresa tus datos, elige una fecha y selecciona un horario disponible.</p>
      </header>

      <main className={styles.flow}>
        <nav className={styles.steps} aria-label="Progreso de solicitud">
          {['Paciente', 'Fecha', 'Hora'].map((label, index) => (
            <button
              key={label}
              type="button"
              className={step === index + 1 ? styles.stepActive : ''}
              disabled={index + 1 > step || Boolean(receipt)}
              onClick={() => setStep(index + 1)}
            >
              <span>{index + 1}</span>
              {label}
            </button>
          ))}
        </nav>

        <section className={styles.card}>
          {receipt ? (
            <div className={styles.receiptPanel}>
              <div className={styles.receiptHeader}>
                <IconCheckCircle />
                <div>
                  <span>Comprobante generado</span>
                  <h2>Solicitud lista</h2>
                  <p>La clinica confirmara tu cita por {receipt.confirmation.toLowerCase()}.</p>
                </div>
              </div>

              <div className={styles.receiptBody}>
                <div className={styles.receiptMain}>
                  <div className={styles.receiptCode}>
                    <span>Codigo de solicitud</span>
                    <strong>{receipt.code}</strong>
                  </div>

                  <section className={styles.receiptSection}>
                    <h3>Datos del paciente</h3>
                    <dl>
                      <div>
                        <dt>Nombre</dt>
                        <dd>{receipt.name}</dd>
                      </div>
                      <div>
                        <dt>DPI</dt>
                        <dd>{receipt.dpi}</dd>
                      </div>
                      <div>
                        <dt>Telefono</dt>
                        <dd>{receipt.phone}</dd>
                      </div>
                      <div>
                        <dt>Correo</dt>
                        <dd>{receipt.email || 'No registrado'}</dd>
                      </div>
                    </dl>
                  </section>

                  <section className={styles.receiptSection}>
                    <h3>Datos de la cita</h3>
                    <dl>
                      <div>
                        <dt>Fecha</dt>
                        <dd>{displayDate(receipt.date)}</dd>
                      </div>
                      <div>
                        <dt>Hora</dt>
                        <dd>{receipt.time}</dd>
                      </div>
                      <div>
                        <dt>Confirmacion</dt>
                        <dd>{receipt.confirmation}</dd>
                      </div>
                      <div>
                        <dt>Estado</dt>
                        <dd>Pendiente de confirmacion</dd>
                      </div>
                    </dl>
                  </section>
                </div>

                <aside className={styles.receiptQr}>
                  <QrCode value={receipt.code} />
                  <span>Validacion rapida en clinica</span>
                </aside>
              </div>

              <div className={styles.receiptActions}>
                <Button onClick={() => downloadReceipt(receipt)}>
                  <IconDownload /> Descargar PDF
                </Button>
                <Button variant="ghost" onClick={() => printReceipt(receipt)}>
                  <IconPrint /> Imprimir PDF
                </Button>
                <Button variant="ghost" onClick={resetFlow}>
                  Nueva solicitud
                </Button>
              </div>
            </div>
          ) : (
            <>
              {step === 1 && (
                <div className={styles.patientStep}>
                  <div className={styles.sectionHead}>
                    <IconMedical />
                    <div>
                      <h2>Datos del paciente</h2>
                      <p>Completa tus datos para solicitar la cita.</p>
                    </div>
                  </div>
                  <div className={styles.grid2}>
                    <TextField label="DPI *" inputMode="numeric" maxLength={13} pattern="[0-9]*" required value={patient.dpi} onChange={(event) => updatePatient('dpi', event.target.value)} />
                    <TextField label="Telefono *" inputMode="numeric" maxLength={8} pattern="[0-9]*" required value={patient.phone} onChange={(event) => updatePatient('phone', event.target.value)} />
                    <TextField label="Nombres *" required value={patient.names} onChange={(event) => updatePatient('names', event.target.value)} />
                    <TextField label="Apellidos *" required value={patient.surnames} onChange={(event) => updatePatient('surnames', event.target.value)} />
                    <TextField label="Correo" type="email" value={patient.email} onChange={(event) => updatePatient('email', event.target.value)} />
                  </div>
                  <div className={styles.patientActions}>
                    <Button disabled={!ready} onClick={() => setStep(2)}>Siguiente</Button>
                  </div>
                </div>
              )}

              {step === 2 && (
                <div className={styles.dateStep}>
                  <div className={styles.sectionHead}>
                    <IconCalendar />
                    <div>
                      <h2>Elige una fecha</h2>
                      <p>Mostramos cuantos horarios libres tiene cada dia.</p>
                    </div>
                  </div>
                  <div className={styles.calendarGrid}>
                    {days.map((day) => (
                      <button
                        key={day.date}
                        type="button"
                        className={[styles.dayButton, booking.date === day.date ? styles.daySelected : ''].join(' ')}
                        disabled={!day.count}
                        onClick={() => chooseDate(day.date)}
                      >
                        <span>{day.dayName}</span>
                        <strong>{day.dayNumber}</strong>
                        <small>{day.month}</small>
                        <em>{day.count ? `${day.count} horarios` : 'Sin horarios'}</em>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {step === 3 && (
                <div className={styles.timeStep}>
                  <div className={styles.sectionHead}>
                    <IconClock />
                    <div>
                      <h2>Escoge hora y confirma</h2>
                      <p>{selectedDay ? displayDate(selectedDay.date) : 'Selecciona una fecha'}.</p>
                    </div>
                  </div>
                  {slots.some((slot) => slot.available) ? (
                    <div className={styles.timeGrid}>
                      {slots.map((slot) => (
                        <button
                          key={slot.time}
                          type="button"
                          className={[styles.timeButton, booking.time === slot.time ? styles.timeSelected : ''].join(' ')}
                          disabled={!slot.available}
                          onClick={() => chooseTime(slot)}
                        >
                          <strong>{slot.time}</strong>
                          <span>{slot.available ? 'Disponible' : 'Ocupado'}</span>
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className={styles.emptyState} role="status">
                      <IconClock />
                      <strong>No hay horarios disponibles</strong>
                      <span>Vuelve al calendario y selecciona otro dia.</span>
                    </div>
                  )}
                  <TextAreaField label="Motivo de su visita" value={booking.reason} onChange={(event) => updateBooking({ reason: event.target.value })} />
                  <SelectField label="Confirmar por" options={confirmationOptions} value={booking.confirmation} onChange={(event) => updateBooking({ confirmation: event.target.value })} />
                  <Button block disabled={!canConfirm} onClick={confirmRequest}>Confirmar solicitud</Button>
                </div>
              )}
            </>
          )}
        </section>

        <aside className={styles.summary}>
          <h2>Resumen</h2>
          <dl>
            <div><dt>Paciente</dt><dd>{fullName || 'Pendiente'}</dd></div>
            <div><dt>Fecha</dt><dd>{booking.date ? displayDate(booking.date) : 'Pendiente'}</dd></div>
            <div><dt>Hora</dt><dd>{booking.time || 'Pendiente'}</dd></div>
            <div><dt>Confirmacion</dt><dd>{booking.confirmation}</dd></div>
          </dl>
          {receipt && (
            <div className={styles.confirmation} role="status">
              <IconCheckCircle />
              <div>
                <strong>{receipt.code}</strong>
                <span>PDF listo para impresion.</span>
              </div>
            </div>
          )}
        </aside>
      </main>
    </div>
  )
}