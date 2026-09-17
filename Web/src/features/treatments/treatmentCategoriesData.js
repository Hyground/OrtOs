import { normalize } from '@/features/clinical/mockStore'

const STORAGE_KEY = 'ortos.treatmentCategories.v1'
const defaults = [
  'Ortodoncia',
  'Prevención',
  'Odontología general',
  'Cirugía',
  'Diagnóstico',
  'Estética dental',
]

export function categoryKey(name) {
  return normalize(name).trim().replace(/\s+/g, ' ')
}

function uniqueNames(names) {
  const seen = new Set()
  return names
    .filter((name) => typeof name === 'string')
    .map((name) => name.trim().replace(/\s+/g, ' '))
    .filter((name) => {
      const key = categoryKey(name)
      if (!key || seen.has(key)) return false
      seen.add(key)
      return true
    })
}

export function readTreatmentCategories(treatments = []) {
  let saved
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY))
    if (Array.isArray(parsed)) saved = parsed
  } catch {
    // Se usan las categorías iniciales y las ya presentes en tratamientos.
  }
  const referenced = treatments.map((item) => item.category)
  return uniqueNames([...(saved ?? defaults), ...referenced])
}

export function saveTreatmentCategories(categories) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(categories))
}
