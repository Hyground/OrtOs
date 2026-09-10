import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useState } from 'react'
import { Modal } from './Modal'
function Nested() {
  const [child, setChild] = useState(false)
  return (
    <Modal open title="Principal" onClose={() => {}}>
      <button onClick={() => setChild(true)}>Abrir secundario</button>
      {child && (
        <Modal open title="Secundario" onClose={() => setChild(false)}>
          <input aria-label="Campo secundario" />
        </Modal>
      )}
    </Modal>
  )
}
it('Escape cierra solo el modal superior y restaura foco y bloqueo de scroll', async () => {
  const user = userEvent.setup()
  render(<Nested />)
  await user.click(screen.getByRole('button', { name: 'Abrir secundario' }))
  expect(screen.getAllByRole('dialog')).toHaveLength(2)
  await user.keyboard('{Escape}')
  expect(screen.getAllByRole('dialog')).toHaveLength(1)
  expect(screen.getByRole('button', { name: 'Abrir secundario' })).toHaveFocus()
  expect(document.body.style.overflow).toBe('hidden')
})
