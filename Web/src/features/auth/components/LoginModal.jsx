import { Modal } from '@/components/ui/Modal/Modal'
import { useAuthDialog } from '../hooks/useAuthDialog'

export function LoginModal() {
  const { isOpen, close } = useAuthDialog()

  return (
    <Modal open={isOpen} onClose={close} title="Iniciar sesión">
      <p>Pendiente de diseño.</p>
    </Modal>
  )
}
