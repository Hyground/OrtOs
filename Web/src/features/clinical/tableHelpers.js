import { useState } from 'react'
export function usePagination(rows, size) {
  const [requestedPage, setPage] = useState(1)
  const page = Math.min(requestedPage, Math.max(1, Math.ceil(rows.length / size)))
  return { page, setPage, visible: rows.slice((page - 1) * size, page * size) }
}
export function exportCSV(rows, columns, name) {
  const cell = (value) =>
    '"' +
    String(value ?? '')
      .replace(/^[=+@-]/, (character) => "'" + character)
      .replaceAll('"', '""') +
    '"'
  const csv =
    '\uFEFF' +
    [
      columns.map((c) => cell(c.label)).join(','),
      ...rows.map((r) => columns.map((c) => cell(r[c.key])).join(',')),
    ].join('\r\n')
  const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }))
  const link = document.createElement('a')
  link.href = url
  link.download = name
  link.click()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

// Genera un archivo nativo de Excel para que el reporte conserve la identidad
// visual de OrtOs al abrirse fuera de la aplicación.
export async function exportExcel(rows, columns, name, title = 'Reporte de pacientes') {
  const { default: ExcelJS } = await import('exceljs')
  const workbook = new ExcelJS.Workbook()
  workbook.creator = 'OrtOs'
  workbook.created = new Date()
  const sheet = workbook.addWorksheet('OrtOs', {
    views: [{ state: 'frozen', ySplit: 4 }],
    pageSetup: { orientation: 'landscape', fitToPage: true, fitToWidth: 1, fitToHeight: 0 },
  })
  const lastColumn = String.fromCharCode(64 + columns.length)
  sheet.mergeCells(`A1:${lastColumn}1`)
  sheet.getCell('A1').value = 'OrtOs · Clínica odontológica'
  sheet.getCell('A1').font = { bold: true, size: 18, color: { argb: 'FFFFFFFF' } }
  sheet.getCell('A1').alignment = { vertical: 'middle' }
  sheet.getCell('A1').fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF0E2A47' } }
  sheet.getRow(1).height = 32
  sheet.mergeCells(`A2:${lastColumn}2`)
  sheet.getCell('A2').value = title
  sheet.getCell('A2').font = { bold: true, size: 12, color: { argb: 'FF036AA1' } }
  sheet.getCell('A3').value = `Generado el ${new Intl.DateTimeFormat('es-GT', { dateStyle: 'long', timeStyle: 'short' }).format(new Date())}`
  sheet.getCell('A3').font = { italic: true, color: { argb: 'FF667487' } }
  sheet.addRow([])
  const header = sheet.addRow(columns.map((column) => column.label))
  header.eachCell((cell) => {
    cell.font = { bold: true, color: { argb: 'FFFFFFFF' } }
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF0284C7' } }
    cell.alignment = { vertical: 'middle' }
  })
  rows.forEach((row, index) => {
    const excelRow = sheet.addRow(columns.map((column) => String(row[column.key] ?? '')))
    excelRow.eachCell((cell) => {
      cell.alignment = { vertical: 'middle', wrapText: true }
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: index % 2 ? 'FFF4F7FB' : 'FFFFFFFF' } }
      cell.border = { bottom: { style: 'hair', color: { argb: 'FFE1E7EF' } } }
    })
  })
  columns.forEach((column, index) => {
    const longest = Math.max(column.label.length, ...rows.map((row) => String(row[column.key] ?? '').length))
    sheet.getColumn(index + 1).width = Math.min(Math.max(longest + 3, 14), 34)
  })
  sheet.autoFilter = { from: 'A5', to: `${lastColumn}${Math.max(5, rows.length + 5)}` }
  const buffer = await workbook.xlsx.writeBuffer()
  const url = URL.createObjectURL(new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }))
  const link = document.createElement('a')
  link.href = url
  link.download = name.endsWith('.xlsx') ? name : `${name}.xlsx`
  link.click()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}
