import { treatments as treatmentNames } from '@/features/appointments/mockData/appointments'

const STORAGE_KEY = 'ortos.treatments.v1'

const defaults = [
  {
    name: treatmentNames[0],
    category: 'Ortodoncia',
    description: 'Seguimiento y ajustes del aparato de ortodoncia en fase avanzada.',
    durationMin: 60,
    price: 1200,
  },
  {
    name: treatmentNames[1],
    category: 'Ortodoncia',
    description: 'Ajuste periódico de brackets o alineadores.',
    durationMin: 30,
    price: 250,
  },
  {
    name: treatmentNames[2],
    category: 'Prevención',
    description: 'Profilaxis para eliminar placa y sarro.',
    durationMin: 45,
    price: 300,
  },
  {
    name: treatmentNames[3],
    category: 'Odontología general',
    description: 'Tratamiento de conducto para salvar la pieza dental.',
    durationMin: 90,
    price: 950,
  },
  {
    name: treatmentNames[4],
    category: 'Cirugía',
    description: 'Remoción quirúrgica de una pieza dental.',
    durationMin: 45,
    price: 400,
  },
  {
    name: treatmentNames[5],
    category: 'Odontología general',
    description: 'Evaluación y diagnóstico general del paciente.',
    durationMin: 30,
    price: 150,
  },
  {
    name: treatmentNames[6],
    category: 'Diagnóstico',
    description: 'Toma de radiografía dental para diagnóstico.',
    durationMin: 15,
    price: 120,
  },
  {
    name: treatmentNames[7],
    category: 'Estética dental',
    description: 'Aclarado del tono de las piezas dentales.',
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
