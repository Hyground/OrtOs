import { useSyncExternalStore } from 'react'
import { tokenStorage } from '@/lib/storage/tokenStorage'
let accounts = [
  {
    id: 'dev-admin',
    email: 'admin@ortos.test',
    password: 'Admin123',
    displayName: 'Administrador OrtOs',
    role: 'admin',
    active: true,
  },
  {
    id: 'dev-odontologo',
    email: 'odontologo@ortos.test',
    password: 'Odonto123',
    displayName: 'Dra. Ana Morales',
    role: 'odontologo',
    active: true,
  },
  {
    id: 'dev-paciente',
    email: 'paciente@ortos.test',
    password: 'Paciente123',
    displayName: 'Paciente Demo',
    role: 'paciente',
    active: true,
  },
]
const publicAccount = ({ id, email, displayName, role, active }) => ({
  id,
  email,
  displayName,
  role,
  active,
})
let snapshot = accounts.map(publicAccount)
const listeners = new Set()
export const subscribeUsers = (listener) => {
  listeners.add(listener)
  return () => listeners.delete(listener)
}
const publish = () => {
  snapshot = accounts.map(publicAccount)
  listeners.forEach((fn) => fn())
}
export const findDevAccountByEmail = (email) =>
  accounts.find((u) => u.email.toLowerCase() === String(email).trim().toLowerCase())
export const findDevAccountById = (id) => accounts.find((u) => u.id === id)
export function useUsers() {
  return useSyncExternalStore(subscribeUsers, () => snapshot)
}
function actor() {
  const id = tokenStorage.get()?.replace(/^ortos-dev-token:/, '')
  const current = findDevAccountById(id)
  if (!current?.active || current.role !== 'admin')
    throw new Error('Solo un administrador puede gestionar usuarios.')
  return current
}
export async function saveUser(data) {
  await new Promise((resolve) => setTimeout(resolve, 350))
  const current = actor()
  if (!data.displayName?.trim()) throw new Error('Ingresa el nombre del usuario.')
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email ?? ''))
    throw new Error('Ingresa un correo válido.')
  if (!['admin', 'odontologo', 'paciente'].includes(data.role))
    throw new Error('Selecciona un rol válido.')
  if ((!data.id || data.password) && (!data.password || data.password.length < 8))
    throw new Error('La contraseña debe tener al menos 8 caracteres.')
  if (
    accounts.some(
      (u) => u.id !== data.id && u.email.toLowerCase() === data.email.trim().toLowerCase(),
    )
  )
    throw new Error('Ese correo ya está registrado.')
  const existing = accounts.find((u) => u.id === data.id)
  if (data.id && !existing) throw new Error('El usuario ya no existe.')
  if (current.id === data.id && (!data.active || data.role !== 'admin'))
    throw new Error('No puedes desactivar tu cuenta ni quitarte el rol de administrador.')
  const record = {
    id: data.id ?? 'dev-' + crypto.randomUUID(),
    displayName: data.displayName.trim(),
    email: data.email.trim().toLowerCase(),
    role: data.role,
    active: Boolean(data.active),
    password: data.password || existing?.password,
  }
  accounts = data.id ? accounts.map((u) => (u.id === data.id ? record : u)) : [record, ...accounts]
  publish()
  return publicAccount(record)
}
export async function deleteUser(id) {
  await new Promise((resolve) => setTimeout(resolve, 350))
  const current = actor()
  if (current.id === id) throw new Error('No puedes eliminar tu propia cuenta.')
  accounts = accounts.filter((u) => u.id !== id)
  publish()
}
