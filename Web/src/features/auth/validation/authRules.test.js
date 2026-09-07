import { describe, expect, it } from 'vitest'
import { validateEmail, validatePassword } from './authRules'

describe('validateEmail', () => {
  it('rechaza valores vacíos', () => {
    expect(validateEmail('')).toEqual({ valid: false, error: 'EMPTY' })
  })

  it('rechaza formatos inválidos', () => {
    expect(validateEmail('correo-invalido')).toEqual({ valid: false, error: 'INVALID_FORMAT' })
  })

  it('acepta un correo válido', () => {
    expect(validateEmail('persona@ortos.com')).toEqual({ valid: true, error: null })
  })
})

describe('validatePassword', () => {
  it('rechaza contraseñas cortas', () => {
    expect(validatePassword('ab1')).toEqual({ valid: false, error: 'TOO_SHORT' })
  })

  it('rechaza contraseñas sin números o letras', () => {
    expect(validatePassword('abcdefgh')).toEqual({ valid: false, error: 'WEAK' })
  })

  it('acepta una contraseña válida', () => {
    expect(validatePassword('abcdefg1')).toEqual({ valid: true, error: null })
  })
})
