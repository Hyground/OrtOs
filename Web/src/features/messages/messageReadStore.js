import { useEffect, useState } from 'react'

const eventName = 'ortos:messages-read'

function storageKey(userId) {
  return 'ortos.messages.read.' + userId
}

function readIds(userId) {
  if (!userId) return []
  try {
    const value = JSON.parse(localStorage.getItem(storageKey(userId)) || '[]')
    return Array.isArray(value) ? value : []
  } catch {
    return []
  }
}

export function useReadMessageIds(userId) {
  const [state, setState] = useState(() => ({ userId, ids: readIds(userId) }))

  useEffect(() => {
    const refresh = () => setState({ userId, ids: readIds(userId) })
    refresh()
    window.addEventListener(eventName, refresh)
    window.addEventListener('storage', refresh)
    return () => {
      window.removeEventListener(eventName, refresh)
      window.removeEventListener('storage', refresh)
    }
  }, [userId])

  return state.userId === userId ? state.ids : readIds(userId)
}

export function incomingMessages(messages, user) {
  if (!user) return []
  const from = user.role === 'paciente' ? 'clinic' : 'patient'
  return messages.filter(
    (message) =>
      message.from === from &&
      (user.role !== 'paciente' || message.patientId === user.patientId),
  )
}

export function markConversationRead(user, patientId, messages) {
  if (!user?.id || !patientId) return
  const nextIds = incomingMessages(messages, user)
    .filter((message) => message.patientId === patientId)
    .map((message) => message.id)
  if (!nextIds.length) return

  const previous = readIds(user.id)
  const updated = [...new Set([...previous, ...nextIds])].slice(-1000)
  if (updated.length === previous.length) return
  try {
    localStorage.setItem(storageKey(user.id), JSON.stringify(updated))
    window.dispatchEvent(new Event(eventName))
  } catch {
    // Reading the conversation still works when local storage is unavailable.
  }
}