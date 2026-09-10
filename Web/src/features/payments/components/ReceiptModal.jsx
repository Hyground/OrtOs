import { Modal } from '@/components/ui/Modal/Modal'
import { Button } from '@/components/ui/Button/Button'
import { IconPrint, IconTooth } from '@/components/icons/icons'
import { money, displayDate } from '@/features/clinical/mockStore'
import styles from '@/features/records/components/RecordModal.module.css'
export function ReceiptModal({ payment: p, patient, onClose }) {
  return (
    <Modal
      open
      size="document"
      title={p.receipt ? 'COMPROBANTE DE PAGO' : 'DETALLE DEL PAGO'}
      onClose={onClose}
      toolbar={
        <Button size="sm" onClick={() => window.print()}>
          <IconPrint />
          Imprimir
        </Button>
      }
    >
      <div className={styles.printRoot}>
        <article className={styles.sheet}>
          <header className={styles.header}>
            <div className={styles.brand}>
              <IconTooth />
              OrtOs<small>Clínica Odontológica</small>
            </div>
            <div className={styles.heading}>
              <h3>{p.receipt ? 'COMPROBANTE DE PAGO' : 'REGISTRO DE PAGO'}</h3>
              <p>{p.receiptNumber || 'Sin comprobante emitido'}</p>
              <p>{displayDate(p.date)}</p>
            </div>
          </header>
          <section className={styles.section}>
            <h3>DATOS DEL PAGO</h3>
            <dl className={styles.fields}>
              {[
                ['Paciente', patient?.name],
                ['DPI', patient?.dpi],
                ['Expediente', patient?.folio],
                ['Concepto', p.concept],
                ['Tratamiento', p.treatment],
                ['Método', p.method],
                ['Referencia', p.reference],
                ['Monto', money(p.amount, p.currency)],
                ['Estado', p.status],
                ['Descripción', p.notes],
              ].map(([label, value]) => (
                <div key={label}>
                  <dt>{label}</dt>
                  <dd>{value || '—'}</dd>
                </div>
              ))}
            </dl>
          </section>
          <p className={styles.confidential}>
            Comprobante interno de demostración. No constituye una factura fiscal.
          </p>
        </article>
      </div>
    </Modal>
  )
}
