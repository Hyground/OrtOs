import { IconCreditCard } from '@/components/icons/icons'

const methodPaths = {
  Efectivo: (
    <>
      <rect x="2" y="5" width="20" height="14" rx="2" />
      <circle cx="12" cy="12" r="3" />
      <path d="M5 9h1m12 6h1" />
    </>
  ),
  'Transferencia bancaria': (
    <>
      <path d="M3 7h17m-4-4 4 4-4 4M21 17H4m4-4-4 4 4 4" />
    </>
  ),
  Cheque: (
    <>
      <rect x="2" y="5" width="20" height="14" rx="2" />
      <path d="M5 9h5m-5 4h3m4 3 2-3 2 2 3-4" />
    </>
  ),
}

export function PaymentMethodIcon({ method }) {
  const drawing = methodPaths[method]
  if (!drawing) return <IconCreditCard />
  return (
    <svg
      width="1em"
      height="1em"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.9"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      {drawing}
    </svg>
  )
}
