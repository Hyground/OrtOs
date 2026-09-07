export const authRules = {
  minPasswordLength: 8,
}

const EMAIL_REGEX = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/

export function validateEmail(email) {
  const value = String(email ?? '').trim()
  if (!value) return { valid: false, error: 'EMPTY' }
  if (!EMAIL_REGEX.test(value)) return { valid: false, error: 'INVALID_FORMAT' }
  return { valid: true, error: null }
}

export function validatePassword(password) {
  const value = String(password ?? '')
  if (!value) return { valid: false, error: 'EMPTY' }
  if (value.length < authRules.minPasswordLength) return { valid: false, error: 'TOO_SHORT' }
  const hasLetter = /[A-Za-z]/.test(value)
  const hasDigit = /\d/.test(value)
  if (!hasLetter || !hasDigit) return { valid: false, error: 'WEAK' }
  return { valid: true, error: null }
}
