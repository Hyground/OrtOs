import { states, surfaces, toothNumbers } from './odontogramModel'

const keyFor = (patientId) => `ortos.odontogram.v1.${patientId}`

function validChart(chart) {
  return (
    chart &&
    typeof chart === 'object' &&
    !Array.isArray(chart) &&
    Object.entries(chart).every(
      ([number, tooth]) =>
        toothNumbers.includes(Number(number)) &&
        tooth &&
        typeof tooth.treatment === 'string' &&
        typeof tooth.notes === 'string' &&
        surfaces.every(({ id }) => states.some((state) => state.id === tooth.faces?.[id])),
    )
  )
}

export function readOdontogram(patientId) {
  const stored = localStorage.getItem(keyFor(patientId))
  if (stored === null) return {}
  const chart = JSON.parse(stored)
  if (!validChart(chart)) throw new Error('El odontograma guardado no tiene un formato válido.')
  return chart
}

export function saveOdontogram(patientId, chart) {
  if (!validChart(chart)) throw new Error('El odontograma no tiene un formato válido.')
  localStorage.setItem(keyFor(patientId), JSON.stringify(chart))
}
