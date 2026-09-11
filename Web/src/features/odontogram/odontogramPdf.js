import { displayDate, localDate } from '@/features/clinical/mockStore'
import {
  detailRows,
  patientFields,
  quadrants,
  stateById,
  states,
  summarize,
  surfaces,
} from './odontogramModel'

const BLUE = '#0284c7'
const INK = '#26364a'
const LEFT = 14
const RIGHT = 196
const WIDTH = RIGHT - LEFT

function heading(doc, title, y) {
  doc.setFillColor('#edf7fb')
  doc.rect(LEFT, y, WIDTH, 8, 'F')
  doc.setFillColor(BLUE)
  doc.rect(LEFT, y, 1, 8, 'F')
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(9)
  doc.setTextColor(BLUE)
  doc.text(title, LEFT + 3, y + 5.3)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(INK)
  return y + 12
}

function header(doc, patient, date) {
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(25)
  doc.setTextColor(BLUE)
  doc.text('OrtOs', LEFT, 19)
  doc.setFontSize(8)
  doc.setTextColor(INK)
  doc.text('Clínica Odontológica', LEFT, 26)
  doc.setTextColor(BLUE)
  doc.setFontSize(11)
  doc.text(['INFORME DE', 'ODONTOGRAMA'], RIGHT, 13, { align: 'right' })
  doc.setTextColor(INK)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8)
  doc.text(`Fecha de emisión: ${displayDate(date)}`, RIGHT, 25, { align: 'right' })
  doc.text(`Folio: ${patient.folio || patient.id}`, RIGHT, 30, { align: 'right', maxWidth: 95 })
  doc.setDrawColor(BLUE)
  doc.setLineWidth(0.5)
  doc.line(LEFT, 34, RIGHT, 34)
}

function drawPatient(doc, patient) {
  let y = heading(doc, 'DATOS DEL PACIENTE E INFORMACIÓN MÉDICA', 38)
  const fields = patientFields(patient)
  doc.setFontSize(8)
  for (let i = 0; i < fields.length; i += 2) {
    const cells = fields.slice(i, i + 2).map(([label, value], column) => {
      const x = LEFT + 2 + column * 92
      doc.setFont('helvetica', 'normal')
      const lines = doc.splitTextToSize(String(value), 61)
      return { x, label, lines }
    })
    const height = Math.max(...cells.map(({ lines }) => lines.length)) * 3.6 + 1
    if (y + height > 265) {
      doc.addPage()
      y = heading(doc, 'DATOS DEL PACIENTE (CONTINUACIÓN)', 16)
    }
    cells.forEach(({ x, label, lines }) => {
      doc.setFont('helvetica', 'bold')
      doc.text(`${label}:`, x, y)
      doc.setFont('helvetica', 'normal')
      doc.text(lines, x + 27, y, { lineHeightFactor: 1.25 })
    })
    y += height
  }
  return y + 3
}

function drawTooth(doc, chart, number, x, y, scale) {
  doc.setFontSize(6)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(INK)
  doc.text(String(number), x + 50 * scale, y - 1.5, { align: 'center' })
  surfaces.forEach((surface) => {
    doc.setFillColor(stateById[chart[number]?.faces[surface.id] ?? 'sinRegistro'].color)
    doc.setDrawColor('#334155')
    doc.setLineWidth(0.15)
    doc.roundedRect(
      x + surface.x * scale,
      y + surface.y * scale,
      surface.width * scale,
      surface.height * scale,
      surface.radius * scale,
      surface.radius * scale,
      'FD',
    )
  })
}

function drawChart(doc, chart, start) {
  const top = heading(doc, 'REPRESENTACIÓN GRÁFICA DEL ODONTOGRAMA', start)
  doc.setFillColor('#f8fafc')
  doc.setDrawColor('#dbe5ed')
  doc.setLineWidth(0.25)
  doc.roundedRect(LEFT, top - 1, WIDTH, 72, 2, 2, 'FD')
  doc.setDrawColor(BLUE)
  doc.line(105, top + 1, 105, top + 55)
  doc.line(LEFT + 2, top + 27, RIGHT - 2, top + 27)
  quadrants.forEach((q, index) => {
    const x = LEFT + 3 + (index % 2) * 91
    const y = top + (index < 2 ? 0 : 28)
    const upper = index < 2
    doc.setTextColor(BLUE)
    doc.setFontSize(7)
    doc.setFont('helvetica', 'bold')
    doc.text(`CUADRANTE ${q.id} (${q.label})`, x + 41, upper ? y + 3 : y + 25, { align: 'center' })
    q.permanent.forEach((number, i) =>
      drawTooth(doc, chart, number, x + 1 + i * 10.6, y + (upper ? 8 : 13), 0.052),
    )
    q.temporary.forEach((number, i) =>
      drawTooth(doc, chart, number, x + 26 + i * 10.6, y + (upper ? 20 : 3), 0.043),
    )
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(6)
    doc.setTextColor('#64748b')
    doc.text(`Temp. ${q.temporaryId}:`, x + 8, y + (upper ? 23 : 6))
  })
  const counts = summarize(chart)
  states.forEach((state, i) => {
    const x = LEFT + 5 + (i % 3) * 60
    const y = top + 61 + Math.floor(i / 3) * 6
    doc.setFillColor(state.color)
    doc.setDrawColor('#64748b')
    doc.circle(x, y - 1, 1.3, 'FD')
    doc.setFontSize(7)
    doc.setTextColor(INK)
    doc.text(`${state.label} (${counts[state.id]})`, x + 3, y)
  })
  doc.setFontSize(6)
  doc.setTextColor('#64748b')
  doc.text('Recuento por superficie', RIGHT - 3, top + 75, { align: 'right' })
  return top + 79
}

function drawDetails(doc, chart, patient, date, start) {
  const widths = [14, 37, 25, 42, 64]
  const titles = [
    'Pieza Nº',
    'Cuadrante / Zona',
    'Estado / Hallazgo',
    'Tratamiento indicado',
    'Observaciones / Superficie',
  ]
  const tableHeader = (y) => {
    doc.setFillColor(BLUE)
    doc.rect(LEFT, y, WIDTH, 9, 'F')
    doc.setTextColor('#ffffff')
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(6.8)
    let x = LEFT
    titles.forEach((title, i) => {
      doc.text(doc.splitTextToSize(title, widths[i] - 3), x + 1.5, y + 3.7)
      x += widths[i]
    })
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(INK)
    return y + 9
  }
  let y = tableHeader(heading(doc, 'REGISTRO DETALLADO POR PIEZA (TABLA TERAPÉUTICA)', start))
  const nextPage = () => {
    doc.addPage()
    header(doc, patient, date)
    y = tableHeader(heading(doc, 'REGISTRO DETALLADO POR PIEZA (CONTINUACIÓN)', 38))
  }
  const rows = detailRows(chart)
  if (!rows.length) {
    doc.setFontSize(9)
    doc.text('Sin hallazgos registrados.', LEFT + 3, y + 8)
    return
  }
  rows.forEach((row, index) => {
    doc.setFontSize(7.3)
    const values = [
      String(row.number),
      row.zone.replace(' · ', ' - '),
      stateById[row.state].label,
      row.treatment || 'No indicado',
      [row.surfaces, row.notes].filter(Boolean).join('\n') || '—',
    ]
    const cells = values.map((value, i) =>
      doc.splitTextToSize(value, widths[i] - (i === 2 ? 6 : 4)),
    )
    const lineCount = Math.max(...cells.map((lines) => lines.length))
    let offset = 0
    while (offset < lineCount) {
      if (y + 12 > 278) nextPage()
      const count = Math.min(lineCount - offset, Math.floor((278 - y - 4) / 3.8))
      const height = Math.max(10, count * 3.8 + 4)
      let x = LEFT
      doc.setFontSize(7.3)
      cells.forEach((lines, i) => {
        doc.setDrawColor('#dbe5ed')
        doc.setLineWidth(0.2)
        doc.setFillColor(index % 2 ? '#f8fafc' : '#ffffff')
        doc.rect(x, y, widths[i], height, 'FD')
        doc.setTextColor(INK)
        if (i === 2 && offset === 0) {
          doc.setFillColor(stateById[row.state].color)
          doc.circle(x + 2, y + 4.5, 1, 'FD')
        }
        const slice = lines.slice(offset, offset + count)
        if (slice.length)
          doc.text(slice, x + (i === 2 ? 4 : 2), y + 4.8, { lineHeightFactor: 1.47 })
        x += widths[i]
      })
      offset += count
      y += height
    }
  })
}

export async function createOdontogramPDF(patient, chart, date = localDate()) {
  const { jsPDF } = await import('jspdf')
  const doc = new jsPDF({ unit: 'mm', format: 'a4' })
  doc.setProperties({ title: `Odontograma ${patient.folio || patient.id}`, author: 'OrtOs' })
  header(doc, patient, date)
  let y = drawPatient(doc, patient)
  if (y + 115 > 260) {
    doc.addPage()
    header(doc, patient, date)
    y = 38
  }
  y = drawChart(doc, chart, y)
  if (y + 40 > 278) {
    doc.addPage()
    header(doc, patient, date)
    y = 38
  }
  drawDetails(doc, chart, patient, date, y)
  const pages = doc.getNumberOfPages()
  for (let page = 1; page <= pages; page++) {
    doc.setPage(page)
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(7)
    doc.setTextColor('#64748b')
    doc.text(`OrtOs · ${patient.folio || patient.id}`, LEFT, 289)
    doc.text(`Página ${page} de ${pages}`, RIGHT, 289, { align: 'right' })
  }
  return doc
}
