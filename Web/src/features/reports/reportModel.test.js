import { describe, expect, it } from 'vitest'
import { buildReport, scopeClinic, reportCatalog } from './reportModel'
import { blankTooth } from '@/features/odontogram/odontogramModel'
import { createReportPDF, createReportWorkbook } from './reportExport'

const clinic = {
  patients: [
    {
      id: 'p1',
      name: 'Paciente Uno',
      folio: 'EXP-1',
      balance: 100,
      status: 'Activo',
      treatment: 'Control',
      createdAt: '2026-08-01',
    },
    {
      id: 'p2',
      name: 'Paciente Privado',
      folio: 'EXP-2',
      balance: 200,
      status: 'Activo',
      treatment: 'Limpieza',
      createdAt: '2026-07-01',
    },
  ],
  appointments: [
    {
      id: 'a1',
      patientId: 'p1',
      dentist: 'Dra. Ana Morales',
      date: '2026-08-10',
      time: '10:00',
      status: 'Completada',
      treatment: 'Control',
    },
    {
      id: 'a2',
      patientId: 'p2',
      dentist: 'Dr. Carlos Pérez',
      date: '2026-07-10',
      time: '09:00',
      status: 'Pendiente',
      treatment: 'Limpieza',
    },
    {
      id: 'a3',
      patientId: 'p1',
      dentist: 'Dra. Ana Morales',
      date: '2026-08-11',
      time: '10:00',
      status: 'Cancelada',
      treatment: 'Control',
    },
  ],
  payments: [
    {
      patientId: 'p1',
      date: '2026-08-10',
      currency: 'GTQ',
      amount: 50,
      status: 'Completado',
      method: 'Efectivo',
      concept: 'Abono',
    },
    {
      patientId: 'p1',
      date: '2026-08-11',
      currency: 'GTQ',
      amount: 20,
      status: 'Pendiente',
      method: 'Efectivo',
      concept: 'Abono',
    },
    {
      patientId: 'p1',
      date: '2026-08-12',
      currency: 'USD',
      amount: 10,
      status: 'Completado',
      method: 'Tarjeta',
      concept: 'Consulta',
    },
    {
      patientId: 'p2',
      date: '2026-07-10',
      currency: 'GTQ',
      amount: 900,
      status: 'Completado',
      method: 'Efectivo',
      concept: 'Privado',
    },
  ],
}
const filters = {
  from: '2026-08-01',
  to: '2026-08-31',
  patientId: '',
  dentist: '',
  dentition: 'permanent',
}
const scoped = scopeClinic(clinic, { role: 'admin' }, [])

describe('Reportes y exportaciones', () => {
  it('separa monedas, pagos pendientes y saldos actuales sin sumar conceptos distintos', () => {
    const report = buildReport('income', scoped, filters)
    expect(report.metrics).toEqual(
      expect.arrayContaining([
        { label: 'Cobrado', value: 50, unit: 'GTQ' },
        { label: 'Cobrado', value: 10, unit: 'USD' },
        { label: 'Pagos pendientes', value: 20, unit: 'GTQ' },
        { label: 'Saldos actuales', value: 300, unit: 'GTQ' },
      ]),
    )
    expect(report.tables[0].rows).toHaveLength(3)
    expect(() => buildReport('income', scoped, { ...filters, from: '2027-01-01' })).toThrow(
      'fecha inicial',
    )
  })

  it('limita la información a un odontólogo identificado y rechaza cuentas sin vínculo', () => {
    const user = { role: 'odontologo', email: 'ana@test', displayName: 'Ana' }
    const doctors = [{ id: 'd1', name: 'Ana Morales', email: 'ana@test' }]
    const restricted = scopeClinic(clinic, user, doctors)
    expect(restricted.patients.map(({ id }) => id)).toEqual(['p1'])
    expect(restricted.appointments).toHaveLength(2)
    expect(restricted.payments).toHaveLength(3)
    for (const item of reportCatalog) {
      const report = buildReport(item.id, restricted, { ...filters, patientId: 'p2' })
      expect(JSON.stringify(report)).not.toContain('Paciente Privado')
    }
    expect(
      scopeClinic(clinic, { role: 'odontologo', displayName: 'Desconocido' }, doctors).patients,
    ).toEqual([])
    expect(scopeClinic(clinic, { role: 'paciente' }, doctors).payments).toEqual([])
  })

  it('cuenta asistencia y actividad por profesional, sin inventar ausencias', () => {
    const report = buildReport('activity', scoped, filters)
    expect(report.tables[0].rows).toEqual([['Dra. Ana Morales', 2, 1, 0, 1, 1, 1]])
    const attendance = buildReport('appointments', scoped, filters)
    expect(attendance.charts[0].data).toEqual([
      { label: 'Completada', value: 1 },
      { label: 'Cancelada', value: 1 },
    ])
    expect(buildReport('patients', scoped, filters).tables[0].rows).toHaveLength(1)
  })

  it('cuenta dientes, omite sanos del detalle y bloquea odontogramas dañados', () => {
    const tooth = blankTooth()
    tooth.faces.center = 'caries'
    tooth.faces.top = 'caries'
    const report = buildReport(
      'dental',
      scoped,
      { ...filters, patientId: 'p1' },
      { p1: { 18: tooth } },
    )
    expect(report.metrics).toContainEqual({ label: 'Caries', value: 1, unit: 'dientes' })
    expect(report.metrics).toContainEqual({ label: 'Sano', value: 31, unit: 'dientes' })
    expect(report.tables[0].rows).toHaveLength(1)
    const child = buildReport(
      'dental',
      scoped,
      { ...filters, patientId: 'p1', dentition: 'temporary' },
      { p1: { 18: tooth } },
    )
    expect(child.metrics).toContainEqual({ label: 'Sano', value: 20, unit: 'dientes' })
    expect(child.tables[0].rows).toHaveLength(0)
    expect(() =>
      buildReport('dental', scoped, { ...filters, patientId: 'p1' }, { p1: new Error() }),
    ).toThrow('odontograma')
  })

  it.each(reportCatalog)(
    'genera Excel y PDF reales para $title',
    async ({ id }) => {
      const report = buildReport(id, scoped, { ...filters, patientId: 'p1' })
      const pdf = await createReportPDF(report)
      expect(pdf.output()).toMatch(/^%PDF-/)
      expect(pdf.output()).toContain(report.title)
      expect(pdf.output()).not.toContain('Paciente Privado')
      const book = await createReportWorkbook(report)
      const buffer = await book.xlsx.writeBuffer()
      const { default: ExcelJS } = await import('exceljs')
      const restored = new ExcelJS.Workbook()
      await restored.xlsx.load(buffer)
      expect(restored.getWorksheet('Resumen').getCell('A2').value).toBe(report.title)
      if (id === 'income') expect(restored.getWorksheet('Detalle 1').getCell('G5').value).toBe(50)
      expect(restored.worksheets.length).toBe(report.tables.length + 1)
    },
    30000,
  )

  it('pagina textos extensos en PDF y conserva texto literal en Excel', async () => {
    const report = buildReport('patients', scoped, filters)
    report.tables[0].rows = Array.from({ length: 35 }, (_, index) => [
      'EXP',
      '=1+1',
      '2026-08-01',
      'Activo',
      'Seguimiento '.repeat(200) + `FINAL-${index}`,
      '',
    ])
    const pdf = await createReportPDF(report)
    expect(pdf.getNumberOfPages()).toBeGreaterThan(2)
    expect(pdf.output()).toContain('FINAL-34')
    const book = await createReportWorkbook(report)
    expect(book.getWorksheet('Detalle 1').getCell('B5').value).toBe('=1+1')
    expect(book.getWorksheet('Detalle 1').getCell('B5').type).toBe(3)
  })
})
