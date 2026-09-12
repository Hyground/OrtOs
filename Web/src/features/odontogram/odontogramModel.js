export const states = [
  { id: 'caries', label: 'Caries', color: '#ef4444' },
  { id: 'tratamiento', label: 'Tratamiento', color: '#16a36a' },
  { id: 'protesis', label: 'Prótesis', color: '#929aa5' },
  { id: 'extraccion', label: 'Extracción', color: '#1a2332' },
  { id: 'sano', label: 'Sano', color: '#ffffff' },
]

export const surfaces = [
  { id: 'top', label: 'Superior', x: 15, y: 2, width: 70, height: 25, radius: 12 },
  { id: 'left', label: 'Izquierda', x: 2, y: 30, width: 25, height: 70, radius: 12 },
  { id: 'center', label: 'Centro', x: 30, y: 30, width: 40, height: 70, radius: 18 },
  { id: 'right', label: 'Derecha', x: 73, y: 30, width: 25, height: 70, radius: 12 },
  { id: 'bottom', label: 'Inferior', x: 15, y: 103, width: 70, height: 25, radius: 12 },
]

export const quadrants = [
  {
    id: 1,
    label: 'Superior derecho',
    permanent: [18, 17, 16, 15, 14, 13, 12, 11],
    temporary: [55, 54, 53, 52, 51],
  },
  {
    id: 2,
    label: 'Superior izquierdo',
    permanent: [21, 22, 23, 24, 25, 26, 27, 28],
    temporary: [61, 62, 63, 64, 65],
  },
  {
    id: 4,
    label: 'Inferior derecho',
    permanent: [48, 47, 46, 45, 44, 43, 42, 41],
    temporary: [85, 84, 83, 82, 81],
  },
  {
    id: 3,
    label: 'Inferior izquierdo',
    permanent: [31, 32, 33, 34, 35, 36, 37, 38],
    temporary: [71, 72, 73, 74, 75],
  },
]

export const toothNumbers = quadrants.flatMap((q) => [...q.permanent, ...q.temporary])
export const stateById = Object.fromEntries(states.map((state) => [state.id, state]))

export function blankTooth() {
  return {
    faces: Object.fromEntries(surfaces.map(({ id }) => [id, 'sano'])),
    treatment: '',
    notes: '',
  }
}

export function toothZone(number) {
  const q = quadrants.find(
    (item) => item.permanent.includes(number) || item.temporary.includes(number),
  )
  const temporary = q.temporary.includes(number)
  return `Cuadrante ${q.id} · ${q.label}${temporary ? ' (temporal)' : ''}`
}

export function dentitionNumbers(dentition = 'permanent') {
  return quadrants.flatMap((quadrant) => quadrant[dentition])
}

export function dentitionStates(dentition = 'permanent') {
  return states.filter(({ id }) => dentition !== 'temporary' || id !== 'protesis')
}

export function summarize(chart, numbers = toothNumbers) {
  const counts = Object.fromEntries(states.map(({ id }) => [id, 0]))
  numbers.forEach((number) => {
    const toothStates = new Set(surfaces.map(({ id }) => chart[number]?.faces[id] ?? 'sano'))
    if (toothStates.size === 1 && toothStates.has('sano')) {
      counts.sano++
    } else {
      toothStates.forEach((state) => {
        if (state !== 'sano') counts[state]++
      })
    }
  })
  return counts
}

export function detailRows(chart, numbers = toothNumbers) {
  return numbers.flatMap((number) => {
    const tooth = chart[number]
    if (!tooth) return []
    const groups = states
      .filter(({ id }) => id !== 'sano')
      .flatMap((state) => {
        const faces = surfaces.filter(({ id }) => tooth.faces[id] === state.id)
        return faces.length
          ? [
              {
                number,
                zone: toothZone(number),
                state: state.id,
                surfaces: faces.map(({ label }) => label).join(', '),
                treatment: tooth.treatment,
                notes: tooth.notes,
              },
            ]
          : []
      })
    if (!groups.length && (tooth.treatment || tooth.notes))
      groups.push({
        number,
        zone: toothZone(number),
        state: null,
        surfaces: '',
        treatment: tooth.treatment,
        notes: tooth.notes,
      })
    return groups
  })
}

export function patientFields(patient) {
  return [
    ['DPI / ID', patient.dpi],
    ['Tratamiento', patient.treatment],
    ['Nombre', patient.name],
    ['Alergias', patient.allergies],
    ['Correo', patient.email],
    ['Antecedentes', patient.diseases],
    ['Teléfono', patient.phone],
    ['Expediente', patient.folio],
  ].map(([label, value]) => [label, value || 'No registrado'])
}
