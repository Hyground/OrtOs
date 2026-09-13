import { Modal } from '@/components/ui/Modal/Modal'
import { TextField } from '@/components/ui/TextField/TextField'
import { Switch } from '@/components/ui/Switch/Switch'
import { nextReceipt } from '@/features/clinical/mockStore'
import { useEntryForm } from '@/features/clinical/useEntryForm'
import { Avatar, PatientFields, Field, Section, FormFooter } from '@/features/clinical/components'
import { treatments } from '@/features/appointments/mockData/appointments'
import { usePatients } from '@/features/patients/hooks/usePatients'
import { concepts, paymentMethods } from '../mockData/payments'
import styles from '@/features/clinical/Clinical.module.css'
import { initialPayment } from '../mockData/initialPayment'
export function PaymentForm({ payment, compactPatient = false, onClose, onSaved, onAdd, onRecord }) {
  const patients = usePatients()
  const form = useEntryForm('payments', payment ?? initialPayment(), onSaved)
  const patient = patients.find((p) => p.id === form.values.patientId)
  const requiresReference = /Tarjeta|Transferencia/.test(form.values.method)
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
          {compactPatient && patient ? (
            <section className={styles.quickPatient} aria-label="Paciente seleccionado">
              <Avatar patient={patient} />
              <div>
                <strong>{patient.name}</strong>
                <small>{patient.folio}</small>
              </div>
            </section>
          ) : (
            <PatientFields form={form} folio onAdd={() => onAdd(form)} onRecord={onRecord} />
          )}
          <Section title={compactPatient ? 'REGISTRAR PAGO' : 'DETALLES DEL PAGO'}>
            <div className={styles.cols3}>
              {f('concept', 'Concepto *', { options: concepts, required: true })}
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
              {f('method', 'Método de pago *', { options: paymentMethods, required: true })}
            </div>
            <div className={compactPatient ? styles.cols2 : styles.cols4}>
              {!compactPatient &&
                f('currency', 'Moneda', {
                  required: true,
                  options: [
                    { value: 'GTQ', label: 'GTQ - Quetzal' },
                    { value: 'EUR', label: 'EUR - Euro' },
                    { value: 'USD', label: 'USD - Dólar' },
                  ],
                })}
              {!compactPatient && f('treatment', 'Tratamiento / Procedimiento', { options: treatments })}
              {f('date', 'Fecha de pago *', { type: 'date', required: true })}
              {f('reference', 'Referencia' + (requiresReference ? ' *' : ''), {
                required: requiresReference,
                placeholder: requiresReference ? 'No. transacción' : 'Opcional',
              })}
            </div>
            {f('notes', 'Descripción / Notas', { type: 'textarea' })}
            {payment?.id && f('status', 'Estado', { options: ['Completado', 'Pendiente'] })}
          </Section>
          <Section title="COMPROBANTE">
            <div className={compactPatient ? styles.quickReceipt : styles.cols2}>
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
              {!compactPatient && (
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
              )}
            </div>
          </Section>
        </fieldset>
        <FormFooter form={form} onClose={onClose} label="Guardar Pago" />
      </form>
    </Modal>
  )
}
