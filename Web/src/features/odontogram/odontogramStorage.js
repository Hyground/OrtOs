import { states, surfaces, toothNumbers } from './odontogramModel'

const keyFor = (patientId) => `ortos.odontogram.v1.${patientId}`

function validChart(chart, allowLegacy = false) {
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
        surfaces.every(
          ({ id }) =>
            states.some((state) => state.id === tooth.faces?.[id]) ||
            (allowLegacy && tooth.faces?.[id] === 'sinRegistro'),
        ),
    )
  )
}

export function readOdontogram(patientId) {
  const stored = localStorage.getItem(keyFor(patientId))
  if (stored === null) return {}
  const chart = JSON.parse(stored)
  if (!validChart(chart, true))
    throw new Error('El odontograma guardado no tiene un formato válido.')
  return Object.fromEntries(
    Object.entries(chart).map(([number, tooth]) => [
      number,
      {
        ...tooth,
        faces: Object.fromEntries(
          surfaces.map(({ id }) => [
            id,
            tooth.faces[id] === 'sinRegistro' ? 'sano' : tooth.faces[id],
          ]),
        ),
      },
    ]),
  )
}

export function saveOdontogram(patientId, chart) {
  if (!validChart(chart)) throw new Error('El odontograma no tiene un formato válido.')
  localStorage.setItem(keyFor(patientId), JSON.stringify(chart))
}
