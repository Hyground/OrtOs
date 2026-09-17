import { beforeEach, describe, expect, it } from 'vitest'
import { readTreatmentCategories } from './treatmentCategoriesData'

beforeEach(() => localStorage.clear())

describe('categorías de tratamientos', () => {
  it('recupera categorías de tratamientos existentes sin duplicar nombres equivalentes', () => {
    localStorage.setItem(
      'ortos.treatmentCategories.v1',
      JSON.stringify(['Ortodoncia', 'ortodoncia']),
    )
    expect(
      readTreatmentCategories([{ category: 'ORTODONCIA' }, { category: 'Periodoncia' }]),
    ).toEqual(['Ortodoncia', 'Periodoncia'])
  })
})
