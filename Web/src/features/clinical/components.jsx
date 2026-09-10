import { IconUser, IconChevronLeft, IconChevronRight } from '@/components/icons/icons'
import { Button } from '@/components/ui/Button/Button'
import { TextField } from '@/components/ui/TextField/TextField'
import { SelectField } from '@/components/ui/SelectField/SelectField'
import { TextAreaField } from '@/components/ui/TextAreaField/TextAreaField'
import { SearchSelect } from '@/components/ui/SearchSelect/SearchSelect'
import { usePatients } from '@/features/patients/hooks/usePatients'
import { age, displayDate } from './mockStore'
import styles from './Clinical.module.css'
export function Avatar({ patient }) {
  return (
    <span className={styles.avatar}>
      {patient?.photo ? <img src={patient.photo} alt="" /> : <IconUser />}
    </span>
  )
}
export function Banner({ title, description, Icon, metrics, onNew, newLabel }) {
  return (
    <header className={styles.banner}>
      <span className={styles.bannerIcon}>
        <Icon />
      </span>
      <div className={styles.bannerText}>
        <h1>{title}</h1>
        <p>{description}</p>
      </div>
      <div className={styles.kpis}>
        {metrics.map(([value, label]) => (
          <div className={styles.kpi} key={label}>
            <strong>{value}</strong>
            <small>{label}</small>
          </div>
        ))}
      </div>
      <Button size="sm" onClick={onNew} className={styles.bannerAction}>
        + {newLabel}
      </Button>
    </header>
  )
}
export function Tabs({ items, value, onChange }) {
  return (
    <div className={styles.tabs} role="tablist" aria-label="Vistas del módulo">
      {items.map((item) => (
        <button
          type="button"
          role="tab"
          aria-selected={value === item}
          key={item}
          onClick={() => onChange(item)}
        >
          {item}
        </button>
      ))}
    </div>
  )
}
export function Pagination({ total, page, onChange, size, noun }) {
  const pages = Math.max(1, Math.ceil(total / size))
  const visible = [...new Set([1, page - 1, page, page + 1, pages])]
    .filter((n) => n >= 1 && n <= pages)
    .sort((a, b) => a - b)
  return (
    <footer className={styles.pagination}>
      <span>
        Mostrando {total ? (page - 1) * size + 1 : 0} a {Math.min(page * size, total)} de {total}{' '}
        {noun}
      </span>
      <div className={styles.pages}>
        <button
          disabled={page <= 1}
          aria-label="Página anterior"
          onClick={() => onChange(page - 1)}
        >
          <IconChevronLeft />
        </button>
        {visible.map((n, i) => (
          <span key={n}>
            {i > 0 && n - visible[i - 1] > 1 && ' … '}
            <button aria-current={page === n ? 'page' : undefined} onClick={() => onChange(n)}>
              {n}
            </button>
          </span>
        ))}
        <button
          disabled={page >= pages}
          aria-label="Página siguiente"
          onClick={() => onChange(page + 1)}
        >
          <IconChevronRight />
        </button>
      </div>
    </footer>
  )
}
export function Section({ title, children }) {
  return (
    <section className={styles.section}>
      <h3>{title}</h3>
      {children}
    </section>
  )
}
export function Field({ form, name, label, options, type = 'text', ...props }) {
  const shared = {
    label,
    value: form.values[name] ?? '',
    onChange: (e) => form.set(name, e.target.value),
    error: form.errors[name],
    ...props,
  }
  return options ? (
    <SelectField {...shared} options={options} />
  ) : type === 'textarea' ? (
    <TextAreaField {...shared} />
  ) : (
    <TextField {...shared} type={type} />
  )
}
export function FormFooter({ form, onClose, label }) {
  return (
    <>
      {form.error && (
        <p className={styles.error} role="alert">
          {form.error}
        </p>
      )}
      <div className={styles.footer}>
        <Button variant="ghost" disabled={form.saving} onClick={onClose}>
          Cancelar
        </Button>
        <Button type="submit" disabled={form.saving}>
          {form.saving ? 'Guardando…' : label}
        </Button>
      </div>
    </>
  )
}
export function PatientFields({ form, onAdd, onRecord, folio = false }) {
  const patients = usePatients()
  const p = patients.find((p) => p.id === form.values.patientId)
  return (
    <Section title="INFORMACIÓN DEL PACIENTE">
      <SearchSelect
        options={patients}
        value={form.values.patientId}
        onChange={(value) => form.set('patientId', value)}
        onAdd={onAdd}
        error={form.errors.patientId}
      />
      <div className={styles.cols3}>
        <TextField label="DPI" value={p?.dpi ?? ''} readOnly />
        <TextField label="Teléfono" value={p?.phone ?? ''} readOnly />
        <TextField
          label={folio ? 'Expediente / Folio' : 'Fecha de nacimiento'}
          value={
            p
              ? folio
                ? p.folio
                : displayDate(p.birthDate) + ' (' + age(p.birthDate) + ' años)'
              : ''
          }
          readOnly
        />
      </div>
      {p && (
        <div className={styles.patientCard}>
          <Avatar patient={p} />
          <div>
            <strong>{p.name}</strong>
            <small>
              {displayDate(p.birthDate)} ({age(p.birthDate)} años) · {p.treatment}
            </small>
            <small>{p.folio}</small>
          </div>
          {onRecord && (
            <Button size="sm" variant="ghost" onClick={() => onRecord(p)}>
              Ver expediente
            </Button>
          )}
        </div>
      )}
    </Section>
  )
}
