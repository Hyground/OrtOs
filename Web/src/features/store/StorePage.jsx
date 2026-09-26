import { useMemo, useState } from 'react'
import { IconCreditCard } from '@/components/icons/icons'
import { Button } from '@/components/ui/Button/Button'
import { TextField } from '@/components/ui/TextField/TextField'
import { SearchSelect } from '@/components/ui/SearchSelect/SearchSelect'
import { useClinic, moneyRounded, normalize } from '@/features/clinical/mockStore'
import { readTreatments } from '@/features/treatments/treatmentsData'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { StoreCheckout } from './StoreCheckout'
import styles from './StorePage.module.css'

export function StorePage() {
  useDocumentTitle('Store')
  const clinic = useClinic()
  const [patientId, setPatientId] = useState('')
  const [query, setQuery] = useState('')
  const [cart, setCart] = useState([])
  const [stage, setStage] = useState('sale')
  const [result, setResult] = useState(null)
  const treatments = useMemo(() => readTreatments().filter((item) => item.active), [])
  const patient = clinic.patients.find((item) => item.id === patientId)
  const filtered = treatments.filter((item) =>
    normalize(`${item.name} ${item.category}`).includes(normalize(query)),
  )
  const total = cart.reduce((sum, item) => sum + item.price, 0)

  const add = (treatment) =>
    patient &&
    setCart((current) =>
      current.some((item) => item.id === treatment.id) ? current : [...current, treatment],
    )
  const remove = (id) => setCart((current) => current.filter((item) => item.id !== id))

  if (stage === 'checkout' && patient && cart.length) {
    return (
      <StoreCheckout
        patient={patient}
        cart={cart}
        total={total}
        onBack={() => setStage('sale')}
        onComplete={(data) => {
          setResult(data)
          setCart([])
          setStage('complete')
        }}
      />
    )
  }

  if (stage === 'complete') {
    return (
      <section className={styles.success}>
        <IconCreditCard />
        <h1>Venta registrada</h1>
        <p>
          Se programaron {result?.scheduledCount ?? 0} citas para {patient?.name}.
        </p>
        <Button
          type="button"
          onClick={() => {
            setPatientId('')
            setResult(null)
            setStage('sale')
          }}
        >
          Nueva venta
        </Button>
      </section>
    )
  }

  return (
    <div className={styles.page}>
      <section className={styles.patientStep}>
        <div className={styles.patientControl}>
          <SearchSelect
            label={patient ? '' : 'Agregar cliente para iniciar'}
            aria-label="Agregar cliente"
            placeholder="Buscar y agregar cliente por nombre o DPI..."
            options={clinic.patients}
            value={patientId}
            onChange={setPatientId}
          />
        </div>
        {patient ? (
          <div className={styles.patientCard}>
            <strong>{patient.name}</strong>
            <small>Expediente {patient.folio}</small>
          </div>
        ) : (
          <div className={styles.patientEmpty}>Ningún paciente seleccionado</div>
        )}
      </section>

      <div className={styles.storeLayout}>
        <section className={styles.catalog}>
          <header>
            <div className={styles.search}>
              <TextField
                label=""
                aria-label="Buscar tratamiento"
                type="search"
                placeholder="Nombre o categoría..."
                value={query}
                onChange={(event) => setQuery(event.target.value)}
              />
            </div>
          </header>
          <div className={styles.catalogColumns}>
            <span>Tratamiento</span>
            <span>Duración</span>
            <span>Precio</span>
          </div>
          <div className={styles.catalogGrid}>
            {filtered.map((treatment) => (
              <button
                type="button"
                className={
                  cart.some((item) => item.id === treatment.id)
                    ? `${styles.product} ${styles.productSelected}`
                    : styles.product
                }
                key={treatment.id}
                aria-label={`Agregar ${treatment.name} al carrito`}
                aria-pressed={cart.some((item) => item.id === treatment.id)}
                disabled={!patient}
                onClick={() => add(treatment)}
              >
                <div>
                  <h3>{treatment.name}</h3>
                </div>
                <small>{treatment.durationMin} min</small>
                <strong>{moneyRounded(treatment.price)}</strong>
              </button>
            ))}
            {!filtered.length && (
              <p className={styles.empty}>No hay tratamientos que coincidan con la búsqueda.</p>
            )}
          </div>
        </section>

        <aside className={styles.cart}>
          <header>
            <div>
              <span>RESUMEN</span>
              <h2>Carrito</h2>
            </div>
            <b>{cart.length} tratamientos</b>
          </header>
          {!patient && (
            <div className={styles.notice}>Agrega un cliente para iniciar la venta.</div>
          )}
          <div className={styles.cartItems}>
            {cart.map((item) => (
              <article className={styles.cartItem} key={item.id}>
                <div>
                  <strong>{item.name}</strong>
                  <small>{item.durationMin} min</small>
                </div>
                <button
                  type="button"
                  className={styles.remove}
                  aria-label={`Eliminar ${item.name}`}
                  onClick={() => remove(item.id)}
                >
                  ×
                </button>
                <b>{moneyRounded(item.price)}</b>
              </article>
            ))}
            {!cart.length && (
              <div className={styles.emptyCart}>
                <IconCreditCard />
                <strong>Tu carrito está vacío</strong>
                <p>Agrega tratamientos desde el catálogo.</p>
              </div>
            )}
          </div>
          <footer className={styles.cartFooter}>
            <div>
              <span>Subtotal</span>
              <strong>{moneyRounded(total)}</strong>
            </div>
            <Button
              type="button"
              disabled={!patient || !cart.length}
              onClick={() => setStage('checkout')}
            >
              Continuar con el tratamiento
            </Button>
          </footer>
        </aside>
      </div>
    </div>
  )
}
