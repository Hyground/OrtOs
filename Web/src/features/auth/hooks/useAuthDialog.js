import { useContext } from 'react'
import { AuthDialogContext } from '../context/AuthDialogContext'

export function useAuthDialog() {
  const context = useContext(AuthDialogContext)
  if (!context) {
    throw new Error('useAuthDialog debe usarse dentro de <AuthDialogProvider>')
  }
  return context
}
