import { describe, expect, it } from 'vitest'
import { patientSeed } from '@/features/patients/mockData/patients'
import {
  blankTooth,
  summarize,
  detailRows,
  toothNumbers,
  dentitionNumbers,
} from './odontogramModel'
import { createOdontogramPDF } from './odontogramPdf'

describe('Informe de odontograma', () => {
  it('representa los 52 dientes sin inventar hallazgos y agrupa por estado y pieza', () => {
    expect(new Set(toothNumbers).size).toBe(52)
    expect(summarize({})).toMatchObject({ sano: 52, caries: 0 })
    const tooth = blankTooth()
    tooth.faces.top = 'caries'
    tooth.faces.center = 'caries'
    tooth.faces.left = 'tratamiento'
    const chart = { 18: tooth }
    expect(summarize(chart)).toMatchObject({ caries: 1, tratamiento: 1, sano: 51 })
    expect(detailRows(chart)).toHaveLength(2)
    expect(detailRows(chart).some(({ state }) => state === 'sano')).toBe(false)
    expect(detailRows({ 18: blankTooth() })).toEqual([])
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
    expect(pdf).toContain('Caries \\(1\\)')
    expect(pdf).toContain('Sano \\(31\\)')
    expect(pdf).toContain('Recuento por diente')
    expect(pdf).toContain(patientSeed[0].dpi)
    expect(pdf).toContain('Tratamiento de prueba')
    expect(pdf).toContain('Nota clínica de prueba')
    expect(pdf).not.toContain('(888888)')
    expect(doc.getNumberOfPages()).toBe(1)
  })

  it('exporta solo la dentadura seleccionada y cuenta sano por defecto', async () => {
    expect(summarize({}, dentitionNumbers())).toMatchObject({ sano: 32 })
    expect(summarize({}, dentitionNumbers('temporary'))).toMatchObject({ sano: 20 })
    const adult = { ...blankTooth(), notes: 'SOLO-ADULTO' }
    const child = { ...blankTooth(), notes: 'SOLO-INFANTIL' }
    const chart = { 18: adult, 55: child }
    const pdf = (
      await createOdontogramPDF(patientSeed[0], chart, '2026-09-10', 'temporary')
    ).output()
    expect(pdf).toContain('SOLO-INFANTIL')
    expect(pdf).not.toContain('(Sano) Tj')
    expect(pdf).not.toContain('SOLO-ADULTO')
    expect(pdf).not.toContain('Sin registro')
    expect(pdf).not.toContain('Pr\u00f3tesis')
    expect(pdf).toContain('INFANTIL')
    expect(pdf).toContain('CUADRANTE 1')
    expect(pdf).not.toContain('CUADRANTE 5')
    expect(pdf).toContain('Sano \\(20\\)')
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
    for (const number of dentitionNumbers()) expect(pdf).toContain(`FINAL-${number}`)
    expect(pdf).toContain('CONTINUACI')
  })
})
