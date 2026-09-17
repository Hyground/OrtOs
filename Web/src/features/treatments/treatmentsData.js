import { treatments as treatmentNames } from '@/features/appointments/mockData/appointments'

const STORAGE_KEY = 'ortos.treatments.v1'

const defaults = [
  {
    name: treatmentNames[0],
    category: 'Ortodoncia',
    durationMin: 60,
    price: 1200,
  },
  {
    name: treatmentNames[1],
    category: 'Ortodoncia',
    durationMin: 30,
    price: 250,
  },
  {
    name: treatmentNames[2],
    category: 'Prevención',
    durationMin: 45,
    price: 300,
  },
  {
    name: treatmentNames[3],
    category: 'Odontología general',
    durationMin: 90,
    price: 950,
  },
  {
    name: treatmentNames[4],
    category: 'Cirugía',
    durationMin: 45,
    price: 400,
  },
  {
    name: treatmentNames[5],
    category: 'Odontología general',
    durationMin: 30,
    price: 150,
  },
  {
    name: treatmentNames[6],
    category: 'Diagnóstico',
    durationMin: 15,
    price: 120,
  },
  {
    name: treatmentNames[7],
    category: 'Estética dental',
    durationMin: 60,
    price: 600,
  },
]

export function readTreatments() {
  try {
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY))
    if (
      Array.isArray(stored) &&
      stored.every(
        (item) =>
          item &&
          typeof item.id === 'string' &&
          typeof item.name === 'string' &&
          typeof item.durationMin === 'number' &&
          typeof item.price === 'number' &&
          typeof item.active === 'boolean',
      ) &&
      new Set(stored.map((item) => item.id)).size === stored.length
    )
      return stored
  } catch {
    /* Fall back to the default catalog if storage is unavailable. */
  }

  return defaults.map((item, index) => ({
    id: 'treatment-' + (index + 1),
    active: true,
    ...item,
  }))
}

export function saveTreatments(items) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
}
