import { Modal } from '@/components/ui/Modal/Modal'
import { TextField } from '@/components/ui/TextField/TextField'
import { Switch } from '@/components/ui/Switch/Switch'
import { nextReceipt } from '@/features/clinical/mockStore'
import { useEntryForm } from '@/features/clinical/useEntryForm'
import { PatientFields, Field, Section, FormFooter } from '@/features/clinical/components'
import { treatments } from '@/features/appointments/mockData/appointments'
import { concepts, paymentMethods } from '../mockData/payments'
import styles from '@/features/clinical/Clinical.module.css'
import { initialPayment } from '../mockData/initialPayment'
export function PaymentForm({ payment, onClose, onSaved, onAdd, onRecord }) {
  const form = useEntryForm('payments', payment ?? initialPayment(), onSaved)
  const f = (name, label, props = {}) => <Field form={form} name={name} label={label} {...props} />
  return (
    <Modal
      open
      size="wide"
      title={payment?.id ? 'DETALLE / EDITAR PAGO' : 'REGISTRAR NUEVO PAGO'}
      onClose={() => {
        if (!form.saving) onClose()
      }}
    >
      <form className={styles.form} onSubmit={form.submit} noValidate>
        <fieldset disabled={form.saving} className={styles.stack}>
          <PatientFields form={form} folio onAdd={() => onAdd(form)} onRecord={onRecord} />
          <Section title="DETALLES DEL PAGO">
            <div className={styles.cols3}>
              {f('concept', 'Concepto *', { options: concepts, required: true })}
              {f('treatment', 'Tratamiento / Procedimiento', { options: treatments })}
              {f('date', 'Fecha de pago *', { type: 'date', required: true })}
            </div>
            <div className={styles.cols4}>
              {f(
                'amount',
                'Monto * (' +
                  (form.values.currency === 'GTQ'
                    ? 'Q'
                    : form.values.currency === 'EUR'
                      ? '€'
                      : '$') +
                  ')',
                {
                  type: 'number',
                  prefix:
                    form.values.currency === 'GTQ'
                      ? 'Q'
                      : form.values.currency === 'EUR'
                        ? '€'
                        : '$',
                  min: '0.01',
                  step: '0.01',
                  placeholder: '500.00',
                  required: true,
                },
              )}
              {f('currency', 'Moneda', {
                required: true,
                options: [
                  { value: 'GTQ', label: 'GTQ - Quetzal' },
                  { value: 'EUR', label: 'EUR - Euro' },
                  { value: 'USD', label: 'USD - Dólar' },
                ],
              })}
              {f('method', 'Método de pago *', { options: paymentMethods, required: true })}
              {f(
                'reference',
                'Referencia / No. transacción' +
                  (/Tarjeta|Transferencia/.test(form.values.method) ? ' *' : ''),
                { required: /Tarjeta|Transferencia/.test(form.values.method) },
              )}
            </div>
            {f('notes', 'Descripción / Notas', { type: 'textarea' })}
            {payment?.id && f('status', 'Estado', { options: ['Completado', 'Pendiente'] })}
          </Section>
          <Section title="COMPROBANTE">
            <div className={styles.cols2}>
              <div className={styles.section}>
                <span>Generar comprobante *</span>
                <Switch
                  label={
                    form.values.receipt
                      ? 'Sí, generar comprobante de pago'
                      : 'No generar comprobante'
                  }
                  checked={form.values.receipt}
                  onChange={(v) => form.set('receipt', v)}
                />
              </div>
              <div>
                <TextField
                  label="Número de comprobante"
                  readOnly
                  value={
                    form.values.receipt ? payment?.receiptNumber || nextReceipt() : 'No se generará'
                  }
                />
                <small className={styles.muted}>Se generará automáticamente al guardar</small>
              </div>
            </div>
          </Section>
        </fieldset>
        <FormFooter form={form} onClose={onClose} label="Guardar Pago" />
      </form>
    </Modal>
  )
}
