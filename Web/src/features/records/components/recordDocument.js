import { age, displayDate, localDate } from '@/features/clinical/mockStore'
import qrcode from 'qrcode-generator'
export function recordSections(p) {
  return [
    {
      title: 'DATOS PERSONALES',
      fields: [
        ['Nombres', p.names],
        ['Apellidos', p.surnames],
        ['DPI', p.dpi],
        ['Fecha de nacimiento', displayDate(p.birthDate) + ' (' + age(p.birthDate) + ' años)'],
        ['Género', p.gender],
        ['Estado civil', p.maritalStatus],
        ['Ocupación', p.occupation],
      ],
    },
    {
      title: 'DATOS DE CONTACTO',
      fields: [
        ['Teléfono principal', p.phone],
        ['Teléfono secundario', p.secondaryPhone],
        ['Correo electrónico', p.email],
        ['Dirección', p.address],
        ['Departamento / Municipio', [p.department, p.municipality].filter(Boolean).join(' / ')],
        ['Referencia', p.reference],
      ],
    },
    {
      title: 'INFORMACIÓN MÉDICA',
      fields: [
        ['Grupo sanguíneo', p.bloodGroup],
        ['Alergias', p.allergies],
        ['Enfermedades', p.diseases],
        ['Toma medicamentos', p.medications ? 'Sí' : 'No'],
        ['Fuma', p.smoker ? 'Sí' : 'No'],
        ['Notas', p.notes],
      ],
    },
  ]
}
export async function createRecordPDF(patient, history) {
  const { jsPDF } = await import('jspdf')
  const doc = new jsPDF({ unit: 'mm', format: 'a4' })
  doc.setProperties({ title: 'Expediente ' + patient.folio, author: 'OrtOs' })
  const header = (page) => {
    doc.setTextColor(2, 132, 199)
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(25)
    doc.text('OrtOs', 18, 20)
    doc.setFontSize(9)
    doc.setTextColor(80)
    doc.setFont('helvetica', 'normal')
    doc.text('Clínica Odontológica', 18, 26)
    doc.setFontSize(11)
    doc.setTextColor(2, 132, 199)
    doc.text('EXPEDIENTE DEL PACIENTE', 192, 17, { align: 'right' })
    doc.setTextColor(80)
    doc.setFontSize(9)
    doc.text(patient.folio, 192, 23, { align: 'right' })
    doc.text('Fecha de emisión: ' + displayDate(localDate()), 192, 29, { align: 'right' })
    doc.setDrawColor(2, 132, 199)
    doc.line(18, 34, 192, 34)
    doc.setFontSize(8)
    doc.setTextColor(100)
    doc.text(
      'Este documento es confidencial y de uso exclusivo de la clínica y el paciente.',
      105,
      284,
      { align: 'center' },
    )
    doc.text('Página ' + page + ' de 2', 192, 291, { align: 'right' })
  }
  const title = (text, y) => {
    doc.setFillColor(237, 247, 252)
    doc.rect(18, y - 5, 174, 8, 'F')
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(2, 132, 199)
    doc.setFontSize(10)
    doc.text(text, 21, y)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(55)
    doc.setFontSize(9)
  }
  header(1)
  let y = 44
  for (const section of recordSections(patient)) {
    title(section.title, y)
    y += 10
    for (let i = 0; i < section.fields.length; i += 2) {
      let height = 0
      section.fields.slice(i, i + 2).forEach(([label, value], column) => {
        const x = 21 + column * 87
        doc.setFont('helvetica', 'bold')
        doc.text(label, x, y)
        doc.setFont('helvetica', 'normal')
        const lines = doc.splitTextToSize(String(value || 'No registrado'), 78).slice(0, 4)
        doc.text(lines, x, y + 5)
        height = Math.max(height, lines.length * 4 + 9)
      })
      y += height
    }
    y += 4
  }
  if (patient.photo) {
    try {
      doc.addImage(patient.photo, 'JPEG', 169, 244, 20, 24, undefined, 'FAST')
    } catch {
      /* The textual record remains usable if a browser rejects an image. */
    }
  }
  title('IDENTIFICACIÓN DEL EXPEDIENTE', Math.min(y, 256))
  doc.text('Folio: ' + patient.folio, 21, Math.min(y, 256) + 9)
  doc.addPage()
  header(2)
  title('HISTORIAL CLÍNICO RESUMIDO', 44)
  y = 56
  const entries = history.slice(0, 10)
  if (!entries.length)
    doc.text('No se han registrado atenciones clínicas para este paciente.', 21, y)
  entries.forEach((entry) => {
    doc.setFont('helvetica', 'bold')
    doc.text(displayDate(entry.date) + ' - ' + entry.treatment, 21, y, { maxWidth: 168 })
    doc.setFont('helvetica', 'normal')
    doc.text(entry.dentist, 21, y + 6)
    const notes = doc.splitTextToSize(entry.notes || 'Sin notas adicionales.', 165).slice(0, 3)
    doc.text(notes, 21, y + 12)
    y += Math.max(24, notes.length * 4 + 18)
    doc.setDrawColor(220)
    doc.line(21, y - 5, 189, y - 5)
  })
  doc.setDrawColor(120)
  doc.line(22, 258, 100, 258)
  doc.text('Firma del odontólogo tratante', 22, 264)
  doc.text('Colegiado: __________________', 22, 270)
  const qr = qrcode(0, 'M')
  qr.addData(patient.folio)
  qr.make()
  const count = qr.getModuleCount()
  const unit = 28 / count
  doc.setFillColor(0)
  for (let row = 0; row < count; row++)
    for (let col = 0; col < count; col++)
      if (qr.isDark(row, col)) doc.rect(159 + col * unit, 242 + row * unit, unit, unit, 'F')
  return doc
}
