const BLUE = '#0284c7'
const INK = '#0e2a47'

export const formatValue = (value) =>
  typeof value === 'number'
    ? new Intl.NumberFormat('es-GT', { maximumFractionDigits: 2 }).format(value)
    : String(value ?? '—')

export async function createReportWorkbook(report) {
  const { default: ExcelJS } = await import('exceljs')
  const book = new ExcelJS.Workbook()
  book.creator = 'OrtOs'
  book.created = new Date()
  const cover = book.addWorksheet('Resumen')
  cover.columns = [{ width: 48 }, { width: 65 }, { width: 18 }]
  cover.addRow(['OrtOs · Clínica odontológica'])
  cover.addRow([report.title])
  cover.addRow(['Fecha de emisión', report.date])
  cover.addRow(['Alcance', report.scope])
  report.filters.forEach((line) => cover.addRow([line]))
  cover.addRow([])
  cover.addRow(['Indicador', 'Valor', 'Unidad'])
  report.metrics.forEach(({ label, value, unit }) => cover.addRow([label, value, unit]))
  report.notes.forEach((note) => {
    const row = cover.addRow([note])
    cover.mergeCells(row.number, 1, row.number, 3)
    row.height = 44
  })
  report.charts.forEach((chart) => {
    cover.addRow([])
    cover.addRow([chart.title, 'Valor', chart.unit || 'Cantidad'])
    chart.data.forEach(({ label, value }) => cover.addRow([label, value]))
  })
  report.tables.forEach((table, index) => {
    const sheet = book.addWorksheet(`Detalle ${index + 1}`, {
      views: [{ state: 'frozen', ySplit: 4 }],
      pageSetup: { orientation: 'landscape', fitToPage: true, fitToWidth: 1, fitToHeight: 0 },
    })
    sheet.columns = table.columns.map(() => ({ width: 27 }))
    sheet.addRow([table.title])
    sheet.mergeCells(1, 1, 1, table.columns.length)
    sheet.addRow([report.scope])
    sheet.mergeCells(2, 1, 2, table.columns.length)
    sheet.addRow([`Emitido: ${report.date}`])
    sheet.addRow(table.columns.map(({ label }) => label))
    table.rows.forEach((row) => sheet.addRow(row.map((value) => value ?? '')))
    if (!table.rows.length) sheet.addRow(['Sin registros para los filtros seleccionados.'])
    sheet.autoFilter = {
      from: { row: 4, column: 1 },
      to: { row: Math.max(4, table.rows.length + 4), column: table.columns.length },
    }
    sheet.getRow(4).eachCell((cell) => {
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF0284C7' } }
      cell.font = { bold: true, color: { argb: 'FFFFFFFF' } }
    })
  })
  book.eachSheet((sheet) => {
    sheet.eachRow((row, rowNumber) => {
      if (rowNumber > 4 && sheet.name !== 'Resumen') {
        const lines = Math.max(
          1,
          ...row.values
            .filter((value) => value != null)
            .map((value) => Math.ceil(String(value).length / 24)),
        )
        row.height = Math.min(409, Math.max(24, lines * 15))
      }
      row.eachCell((cell) => {
        cell.alignment = { vertical: 'top', wrapText: true }
        if (typeof cell.value === 'number') cell.numFmt = '#,##0.##'
        if (rowNumber > 4 && rowNumber % 2)
          cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF4F7FB' } }
      })
    })
    sheet.getRow(1).font = { bold: true, size: 16, color: { argb: 'FF036AA1' } }
    sheet.getRow(1).height = 34
  })
  return book
}

export async function createReportPDF(report) {
  const { jsPDF } = await import('jspdf')
  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' })
  doc.setProperties({ title: report.title, author: 'OrtOs' })
  const left = 14
  const width = 269
  const bottom = 192
  let y = 0
  const header = () => {
    doc.setTextColor(BLUE)
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(22)
    doc.text('OrtOs', left, 16)
    doc.setFontSize(12)
    doc.text(report.title, left + 38, 16)
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(8)
    doc.setTextColor(INK)
    doc.text(`Emitido: ${report.date}`, left, 24)
    doc.setDrawColor(BLUE)
    doc.line(left, 28, left + width, 28)
    y = 34
  }
  const next = () => {
    doc.addPage()
    header()
  }
  const text = (value, size = 9) => {
    doc.setFontSize(size)
    const lines = doc.splitTextToSize(String(value), width)
    lines.forEach((line) => {
      if (y + 5 > bottom) next()
      doc.setFontSize(size)
      doc.setTextColor(INK)
      doc.text(line, left, y)
      y += 5
    })
  }
  header()
  text(report.scope)
  report.filters.forEach((line) => text(line, 8))
  y += 3
  report.metrics.forEach(({ label, value, unit }) =>
    text(`${label}: ${formatValue(value)} ${unit}`),
  )
  report.notes.forEach((note) => text(note, 8))
  report.charts.forEach((chart) => {
    const chartHeight = 16 + Math.max(1, chart.data.length) * 10
    if (y + Math.min(chartHeight, 45) > bottom) next()
    y += 5
    text(chart.title, 11)
    const maximum = Math.max(1, ...chart.data.map(({ value }) => value))
    chart.data.forEach(({ label, value }) => {
      if (y + 12 > bottom) {
        next()
        text(`${chart.title} (continuación)`, 11)
      }
      text(`${label}: ${formatValue(value)} ${chart.unit || ''}`, 8)
      doc.setFillColor('#e7f2fa')
      doc.rect(left, y - 2, 160, 3, 'F')
      if (value > 0) {
        doc.setFillColor(BLUE)
        doc.rect(left, y - 2, (160 * value) / maximum, 3, 'F')
      }
      y += 5
    })
    if (!chart.data.length) text('Sin datos para graficar.', 8)
  })
  report.tables.forEach((table) => {
    if (y + 45 > bottom) next()
    else y += 10
    const colWidth = width / table.columns.length
    const drawColumns = () => {
      text(table.title, 11)
      doc.setFillColor(BLUE)
      doc.rect(left, y, width, 13, 'F')
      doc.setTextColor('#ffffff')
      doc.setFontSize(8)
      table.columns.forEach(({ label }, index) =>
        doc.text(doc.splitTextToSize(label, colWidth - 4), left + index * colWidth + 2, y + 4),
      )
      y += 13
    }
    drawColumns()
    if (!table.rows.length) {
      y += 6
      text('Sin registros para los filtros seleccionados.')
      return
    }
    table.rows.forEach((row, rowIndex) => {
      doc.setFontSize(8)
      const cells = table.columns.map((_, index) =>
        doc.splitTextToSize(formatValue(row[index]), colWidth - 4),
      )
      const lineCount = Math.max(...cells.map((lines) => lines.length))
      let offset = 0
      while (offset < lineCount) {
        if (y + 10 > bottom) {
          next()
          drawColumns()
        }
        const count = Math.min(lineCount - offset, Math.max(1, Math.floor((bottom - y - 4) / 4)))
        const height = Math.max(9, count * 4 + 4)
        doc.setFontSize(8)
        cells.forEach((lines, index) => {
          const x = left + index * colWidth
          doc.setFillColor(rowIndex % 2 ? '#f4f7fb' : '#ffffff')
          doc.setDrawColor('#dbe5ed')
          doc.rect(x, y, colWidth, height, 'FD')
          doc.setTextColor(INK)
          const segment = lines.slice(offset, offset + count)
          if (segment.length) doc.text(segment, x + 2, y + 4, { lineHeightFactor: 1.4 })
        })
        y += height
        offset += count
      }
    })
  })
  const pages = doc.getNumberOfPages()
  for (let page = 1; page <= pages; page++) {
    doc.setPage(page)
    doc.setFontSize(8)
    doc.setTextColor(INK)
    doc.text(`OrtOs · Página ${page} de ${pages}`, 283, 203, { align: 'right' })
  }
  return doc
}

export async function downloadReport(report, format) {
  const name = `OrtOs-${report.id}-${report.date}`
  if (format === 'pdf') {
    const doc = await createReportPDF(report)
    doc.save(`${name}.pdf`)
    return
  }
  const book = await createReportWorkbook(report)
  const buffer = await book.xlsx.writeBuffer()
  const url = URL.createObjectURL(
    new Blob([buffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    }),
  )
  const link = document.createElement('a')
  link.href = url
  link.download = `${name}.xlsx`
  link.click()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}
