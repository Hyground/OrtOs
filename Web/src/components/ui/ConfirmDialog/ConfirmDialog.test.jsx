import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { vi } from 'vitest'
import { ConfirmDialog } from './ConfirmDialog'

it('mantiene la acción pendiente hasta confirmar y permite cancelar', async () => {
  const user = userEvent.setup()
  const onClose = vi.fn()
  const onConfirm = vi.fn()
  render(
    <ConfirmDialog
      open
      title="Eliminar tratamiento"
      message="¿Estás seguro de eliminar Limpieza dental?"
      confirmLabel="Eliminar"
      danger
      onClose={onClose}
      onConfirm={onConfirm}
    />,
  )
  const dialog = screen.getByRole('dialog', { name: 'Eliminar tratamiento' })
  expect(within(dialog).getByText('¿Estás seguro de eliminar Limpieza dental?')).toBeInTheDocument()
  await user.click(within(dialog).getByRole('button', { name: 'Cancelar' }))
  expect(onClose).toHaveBeenCalledOnce()
  expect(onConfirm).not.toHaveBeenCalled()
  await user.click(within(dialog).getByRole('button', { name: 'Eliminar' }))
  expect(onConfirm).toHaveBeenCalledOnce()
})

it('bloquea los botones durante una operación pendiente', () => {
  render(
    <ConfirmDialog
      open
      title="Desactivar usuario"
      message="¿Estás seguro de desactivar este usuario?"
      confirmLabel="Desactivar"
      busy
      onClose={() => {}}
      onConfirm={() => {}}
    />,
  )
  const dialog = screen.getByRole('dialog', { name: 'Desactivar usuario' })
  expect(within(dialog).getByRole('button', { name: 'Cancelar' })).toBeDisabled()
  expect(within(dialog).getByRole('button', { name: 'Desactivar' })).toBeDisabled()
})
