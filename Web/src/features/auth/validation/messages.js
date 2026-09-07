import { authRules } from './authRules'

export const emailErrorMessages = {
  EMPTY: 'Ingresá tu correo.',
  INVALID_FORMAT: 'El correo no tiene un formato válido.',
}

export const passwordErrorMessages = {
  EMPTY: 'Ingresá tu contraseña.',
  TOO_SHORT: `La contraseña debe tener al menos ${authRules.minPasswordLength} caracteres.`,
  WEAK: 'La contraseña debe incluir letras y números.',
}
