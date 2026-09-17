import { beforeEach, describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { FloatingChat } from './FloatingChat'

const { sendMessage, messageState } = vi.hoisted(() => ({ sendMessage: vi.fn(), messageState: { items: [] } }))

vi.mock('@/features/auth/hooks/useAuth', () => ({
  useAuth: () => ({ user: { id: 'admin-test', role: 'admin' } }),
}))
vi.mock('@/features/clinical/mockStore', () => ({
  useClinic: () => ({
    patients: Array.from({ length: 12 }, (_, index) => ({
      id: `patient-${index + 1}`,
      name: `Paciente ${index + 1}`,
      folio: `EXP-${index + 1}`,
    })),
  }),
}))
vi.mock('@/features/messages/messageStore', () => ({
  useMessages: () => messageState.items,
  sendMessage,
}))

describe('FloatingChat', () => {
  beforeEach(() => { sendMessage.mockClear(); messageState.items = []; localStorage.clear() })

  it('permite buscar entre muchas conversaciones, abrir una, volver y enviar', async () => {
    const user = userEvent.setup()
    render(<FloatingChat />)

    await user.click(screen.getByRole('button', { name: 'Abrir mensajes' }))
    const panel = screen.getByRole('region', { name: 'Mensajes de pacientes' })
    expect(within(panel).getAllByRole('button', { name: /Paciente \d+/ })).toHaveLength(12)

    await user.type(within(panel).getByRole('searchbox'), 'Paciente 10')
    expect(within(panel).getAllByRole('button', { name: /Paciente \d+/ })).toHaveLength(1)

    await user.click(within(panel).getByRole('button', { name: /Paciente 10/ }))
    expect(panel).toHaveAttribute('data-mobile-view', 'conversation')
    await user.type(within(panel).getByPlaceholderText('Escribe un mensaje...'), 'Hola')
    await user.click(within(panel).getByRole('button', { name: 'Enviar mensaje' }))
    expect(sendMessage).toHaveBeenCalledWith({ id: 'admin-test', role: 'admin' }, 'patient-10', 'Hola')

    fireEvent.click(within(panel).getByLabelText('Volver a conversaciones'))
    expect(panel).toHaveAttribute('data-mobile-view', 'list')
  })
  it('muestra mensajes pendientes en el sobre y los marca al abrir su conversación', async () => {
    messageState.items = [
      { id: 'incoming-1', patientId: 'patient-1', from: 'patient', text: 'Hola', createdAt: '2026-09-17T10:00:00Z' },
      { id: 'outgoing-1', patientId: 'patient-2', from: 'clinic', text: 'Respuesta', createdAt: '2026-09-17T10:01:00Z' },
    ]
    const user = userEvent.setup()
    render(<FloatingChat />)

    expect(screen.getByRole('button', { name: 'Abrir mensajes, 1 sin leer' })).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Abrir mensajes, 1 sin leer' }))
    const panel = screen.getByRole('region', { name: 'Mensajes de pacientes' })
    await user.click(within(panel).getByText('Paciente 1').closest('button'))

    expect(within(panel).queryByLabelText('Mensajes sin leer')).not.toBeInTheDocument()
    expect(JSON.parse(localStorage.getItem('ortos.messages.read.admin-test'))).toContain('incoming-1')
  })
  it('ajusta la altura del chat cuando el teclado reduce el área visible', async () => {
    const originalViewport = Object.getOwnPropertyDescriptor(window, 'visualViewport')
    const viewport = Object.assign(new EventTarget(), { height: 600, offsetTop: 0 })
    Object.defineProperty(window, 'visualViewport', { configurable: true, value: viewport })

    try {
      const user = userEvent.setup()
      render(<FloatingChat />)
      await user.click(screen.getByRole('button', { name: 'Abrir mensajes' }))
      const panel = screen.getByRole('region', { name: 'Mensajes de pacientes' })
      expect(panel.style.getPropertyValue('--chat-visible-height')).toBe('600px')

      viewport.height = 320
      viewport.offsetTop = 12
      fireEvent(viewport, new Event('resize'))
      expect(panel.style.getPropertyValue('--chat-visible-height')).toBe('320px')
      expect(panel.style.getPropertyValue('--chat-visible-top')).toBe('12px')
    } finally {
      if (originalViewport) Object.defineProperty(window, 'visualViewport', originalViewport)
      else delete window.visualViewport
    }
  })

})
