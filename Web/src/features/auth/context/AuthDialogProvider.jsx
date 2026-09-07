import { useCallback, useMemo, useState } from 'react'
import { AuthDialogContext } from './AuthDialogContext'

export function AuthDialogProvider({ children }) {
  const [isOpen, setIsOpen] = useState(false)

  const open = useCallback(() => setIsOpen(true), [])
  const close = useCallback(() => setIsOpen(false), [])

  const value = useMemo(() => ({ isOpen, open, close }), [isOpen, open, close])

  return <AuthDialogContext.Provider value={value}>{children}</AuthDialogContext.Provider>
}
