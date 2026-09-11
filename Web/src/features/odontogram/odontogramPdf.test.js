import { describe, expect, it } from 'vitest'
import { patientSeed } from '@/features/patients/mockData/patients'
import { blankTooth, summarize, detailRows, toothNumbers } from './odontogramModel'
import { createOdontogramPDF } from './odontogramPdf'

describe('Informe de odontograma', () => {
  it('representa los 52 dientes sin inventar hallazgos y agrupa por estado y pieza', () => {
    expect(new Set(toothNumbers).size).toBe(52)
    expect(summarize({})).toMatchObject({ sinRegistro: 260, sano: 0, caries: 0 })
    const tooth = blankTooth()
    tooth.faces.top = 'caries'
    tooth.faces.center = 'caries'
    tooth.faces.left = 'tratamiento'
    const chart = { 18: tooth }
    expect(summarize(chart)).toMatchObject({ caries: 2, tratamiento: 1, sinRegistro: 257 })
    expect(detailRows(chart)).toHaveLength(2)
    expect(detailRows(chart)[0].surfaces).toBe('Superior, Centro')
  })

  it('genera un PDF real con datos actuales, gráficos vectoriales y texto del tratamiento', async () => {
    const tooth = blankTooth()
    tooth.faces.center = 'caries'
    tooth.treatment = 'Tratamiento de prueba'
    tooth.notes = 'Nota clínica de prueba'
    const doc = await createOdontogramPDF(patientSeed[0], { 18: tooth }, '2026-09-10')
    const pdf = doc.output()
    expect(pdf).toMatch(/^%PDF-/)
    expect(pdf).toContain('ODONTOGRAMA')
    expect(pdf).toContain(patientSeed[0].dpi)
    expect(pdf).toContain('Tratamiento de prueba')
    expect(pdf).toContain('Nota clínica de prueba')
    expect(pdf).not.toContain('(888888)')
    expect(doc.getNumberOfPages()).toBe(1)
  })

  it('pagina todos los hallazgos y observaciones extensas sin perder el último registro', async () => {
    const chart = Object.fromEntries(
      toothNumbers.map((number) => {
        const tooth = blankTooth()
        tooth.faces.center = 'caries'
        tooth.notes = 'Seguimiento detallado del paciente. '.repeat(35) + `FINAL-${number}`
        return [number, tooth]
      }),
    )
    const doc = await createOdontogramPDF(patientSeed[0], chart, '2026-09-10')
    expect(doc.getNumberOfPages()).toBeGreaterThan(2)
    const pdf = doc.output()
    for (const number of toothNumbers) expect(pdf).toContain(`FINAL-${number}`)
    expect(pdf).toContain('CONTINUACI')
  })
})
