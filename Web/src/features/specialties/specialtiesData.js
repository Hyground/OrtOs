import { servicesFallback } from '@/features/services/servicesFallback'

const STORAGE_KEY = 'ortos.specialties.v1'

export function normalizeName(value) {
  return value
    .trim()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLocaleLowerCase('es')
}

export function readSpecialties() {
  try {
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY))
    if (
      Array.isArray(stored) &&
      stored.every(
        (item) =>
          item &&
          typeof item.id === 'string' &&
          typeof item.name === 'string' &&
          typeof item.description === 'string',
      ) &&
      new Set(stored.map((item) => item.id)).size === stored.length
    )
      return stored
  } catch {
    /* Fall back to the existing service categories if storage is unavailable. */
  }

  return [...new Set(servicesFallback.map((service) => service.category))].map((name) => ({
    id: `category-${name}`,
    name,
    description: servicesFallback
      .filter((service) => service.category === name)
      .map((service) => service.description)
      .join(' '),
  }))
}

export function saveSpecialties(items) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
}
