import { Modal } from '@/components/ui/Modal/Modal'
import { PatientAccount } from './PatientAccount'

export function PatientAccountModal({ patient, appointment, onClose }) {
  return <Modal open size="wide" title={appointment ? 'CUENTA DE LA CITA' : 'CUENTA / PAGOS'} onClose={onClose}>
    <PatientAccount patient={patient} appointment={appointment} compact />
  </Modal>
}
