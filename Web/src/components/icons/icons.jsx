const base = {
  width: '1em',
  height: '1em',
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.9,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  'aria-hidden': true,
  focusable: false,
}

export function IconHome(props) {
  return (
    <svg {...base} {...props}>
      <path d="M3 10.5 12 3l9 7.5" />
      <path d="M5 9.5V21h14V9.5" />
      <path d="M9.5 21v-6h5v6" />
    </svg>
  )
}

export function IconServices(props) {
  return (
    <svg {...base} {...props}>
      <path d="M7 3h7l5 5v13a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1Z" />
      <path d="M14 3v5h5" />
      <path d="M9 13h6M9 17h6" />
    </svg>
  )
}

export function IconSpecialist(props) {
  return (
    <svg {...base} {...props}>
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21c0-4.4 3.6-8 8-8s8 3.6 8 8" />
    </svg>
  )
}

export function IconCalendar(props) {
  return (
    <svg {...base} {...props}>
      <rect x="3.5" y="5" width="17" height="16" rx="2.5" />
      <path d="M3.5 10h17M8 3v4M16 3v4" />
    </svg>
  )
}

export function IconUser(props) {
  return (
    <svg {...base} {...props}>
      <circle cx="12" cy="8" r="3.5" />
      <path d="M5.5 20c0-3.6 2.9-6.5 6.5-6.5s6.5 2.9 6.5 6.5" />
    </svg>
  )
}

export function IconUsers(props) {
  return (
    <svg {...base} {...props}>
      <path d="M16 11.5a3.2 3.2 0 1 0-2.4-5.3" />
      <path d="M8 11.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Z" />
      <path d="M2.5 20c0-3.3 2.5-6 5.5-6s5.5 2.7 5.5 6" />
      <path d="M14 14c3 0 5.5 2.4 5.5 5.5" />
    </svg>
  )
}

export function IconMedical(props) {
  return (
    <svg {...base} {...props}>
      <path d="M8 14.5c-2.2 0-4 1.8-4 4V20h16v-1.5c0-2.2-1.8-4-4-4" />
      <path d="M8 8a4 4 0 1 0 8 0" />
      <path d="M8 8V5.5A2.5 2.5 0 0 1 10.5 3h3A2.5 2.5 0 0 1 16 5.5V8" />
      <path d="M12 4.5v4M10 6.5h4" />
    </svg>
  )
}

export function IconClipboard(props) {
  return (
    <svg {...base} {...props}>
      <rect x="5" y="4" width="14" height="17" rx="2" />
      <path d="M9 4.5A2.5 2.5 0 0 1 11.5 2h1A2.5 2.5 0 0 1 15 4.5V6H9V4.5Z" />
      <path d="M9 11h6M9 15h6" />
    </svg>
  )
}

export function IconCreditCard(props) {
  return (
    <svg {...base} {...props}>
      <rect x="3" y="5" width="18" height="14" rx="2.5" />
      <path d="M3 10h18M7 15h3" />
    </svg>
  )
}

export function IconFileText(props) {
  return (
    <svg {...base} {...props}>
      <path d="M7 3h7l5 5v13H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Z" />
      <path d="M14 3v5h5M8 13h8M8 17h6" />
    </svg>
  )
}

export function IconChart(props) {
  return (
    <svg {...base} {...props}>
      <path d="M4 19V5" />
      <path d="M4 19h16" />
      <rect x="7" y="11" width="3" height="5" rx="1" />
      <rect x="12" y="8" width="3" height="8" rx="1" />
      <rect x="17" y="5" width="3" height="11" rx="1" />
    </svg>
  )
}

export function IconBell(props) {
  return (
    <svg {...base} {...props}>
      <path d="M18 9a6 6 0 1 0-12 0c0 7-2.5 7-2.5 7h17S18 16 18 9" />
      <path d="M10 20a2 2 0 0 0 4 0" />
    </svg>
  )
}

export function IconSearch(props) {
  return (
    <svg {...base} {...props}>
      <circle cx="10.5" cy="10.5" r="6.5" />
      <path d="m16 16 4 4" />
    </svg>
  )
}

export function IconPlus(props) {
  return (
    <svg {...base} {...props}>
      <path d="M12 5v14M5 12h14" />
    </svg>
  )
}

export function IconSend(props) {
  return (
    <svg {...base} {...props}>
      <path d="M21 3 10 14" />
      <path d="m21 3-7 18-4-7-7-4 18-7Z" />
    </svg>
  )
}

export function IconLogOut(props) {
  return (
    <svg {...base} {...props}>
      <path d="M10 6H6.5A2.5 2.5 0 0 0 4 8.5v7A2.5 2.5 0 0 0 6.5 18H10" />
      <path d="M14 8l4 4-4 4M18 12H9" />
    </svg>
  )
}

export function IconClock(props) {
  return (
    <svg {...base} {...props}>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 7.5V12l3 2" />
    </svg>
  )
}

export function IconCheckCircle(props) {
  return (
    <svg {...base} {...props}>
      <circle cx="12" cy="12" r="8.5" />
      <path d="m8.5 12.2 2.2 2.2 4.8-5" />
    </svg>
  )
}

export function IconMenu(props) {
  return (
    <svg {...base} {...props}>
      <path d="M4 7h16M4 12h16M4 17h16" />
    </svg>
  )
}

export function IconClose(props) {
  return (
    <svg {...base} {...props}>
      <path d="M6 6l12 12M18 6 6 18" />
    </svg>
  )
}

export function IconArrowRight(props) {
  return (
    <svg {...base} {...props}>
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  )
}

export function IconTooth(props) {
  return (
    <svg {...base} {...props}>
      <path d="M7.5 3.5C5.6 3.5 4 5 4 7.2c0 3 1 4.5 1.6 7 .5 2 .8 4.3 1.9 4.3 1.4 0 1.2-3.5 2.5-3.5s1.1 3.5 2.5 3.5c1.1 0 1.4-2.3 1.9-4.3.6-2.5 1.6-4 1.6-7C20 5 18.4 3.5 16.5 3.5c-1.8 0-2.4 1-4.5 1s-2.7-1-4.5-1Z" />
    </svg>
  )
}

export function IconSparkle(props) {
  return (
    <svg {...base} {...props}>
      <path d="M12 3l1.8 5L19 9.8 14 12l-2 5-2-5-5-2.2L10 8l2-5Z" />
      <path d="M18.5 15.5 19 17l1.5.5L19 18l-.5 1.5L18 18l-1.5-.5L18 17l.5-1.5Z" />
    </svg>
  )
}

export function IconShield(props) {
  return (
    <svg {...base} {...props}>
      <path d="M12 3.5 5 6v5.5c0 4.5 3 7.5 7 9 4-1.5 7-4.5 7-9V6l-7-2.5Z" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  )
}

export function IconMail(props) {
  return (
    <svg {...base} {...props}>
      <rect x="3" y="5" width="18" height="14" rx="2.5" />
      <path d="m4 7 8 6 8-6" />
    </svg>
  )
}

export function IconLock(props) {
  return (
    <svg {...base} {...props}>
      <rect x="4.5" y="10" width="15" height="10" rx="2.5" />
      <path d="M8 10V7a4 4 0 0 1 8 0v3" />
    </svg>
  )
}

export function IconEye(props) {
  return (
    <svg {...base} {...props}>
      <path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  )
}

export function IconEyeOff(props) {
  return (
    <svg {...base} {...props}>
      <path d="M4 4l16 16" />
      <path d="M9.9 5.2A9.7 9.7 0 0 1 12 5c6 0 9.5 6.5 9.5 6.5a17 17 0 0 1-3.4 4M6.3 7.8A17 17 0 0 0 2.5 12S6 18.5 12 18.5c1.6 0 3-.4 4.2-1" />
      <path d="M9.8 9.9a3 3 0 0 0 4.3 4.2" />
    </svg>
  )
}

export function IconGoogle(props) {
  return (
    <svg
      width="1em"
      height="1em"
      viewBox="0 0 24 24"
      aria-hidden="true"
      focusable="false"
      {...props}
    >
      <path
        fill="#4285F4"
        d="M23.06 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h6.2c-.27 1.44-1.08 2.66-2.3 3.48v2.89h3.72c2.18-2 3.44-4.96 3.44-8.38Z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.1 0 5.7-1.03 7.6-2.78l-3.72-2.89c-1.03.69-2.36 1.1-3.88 1.1-2.98 0-5.5-2.01-6.4-4.72H1.75v2.98A12 12 0 0 0 12 24Z"
      />
      <path
        fill="#FBBC05"
        d="M5.6 14.71c-.23-.68-.36-1.4-.36-2.14 0-.74.13-1.46.36-2.14V7.45H1.75A12 12 0 0 0 0 12c0 1.93.46 3.76 1.75 4.55l3.85-1.84Z"
      />
      <path
        fill="#EA4335"
        d="M12 4.77c1.68 0 3.19.58 4.38 1.71l3.28-3.28C17.7 1.19 15.1 0 12 0 7.31 0 3.26 2.69 1.75 6.31l3.85 2.98C6.5 6.58 9.02 4.77 12 4.77Z"
      />
    </svg>
  )
}

export function IconPlay(props) {
  return (
    <svg {...base} {...props}>
      <path d="M8 5.5v13l11-6.5-11-6.5Z" />
    </svg>
  )
}

export function IconPause(props) {
  return (
    <svg {...base} {...props}>
      <path d="M9 5v14M15 5v14" />
    </svg>
  )
}

export function IconPhone(props) {
  return (
    <svg {...base} {...props}>
      <path d="M6 3h3l1.5 5-2 1.5a12 12 0 0 0 6 6l1.5-2 5 1.5v3a2 2 0 0 1-2 2A16 16 0 0 1 4 5a2 2 0 0 1 2-2Z" />
    </svg>
  )
}

export function IconWhatsApp(props) {
  return (
    <svg {...base} {...props}>
      <path d="M4 20l1.4-4A8 8 0 1 1 8 18.6L4 20Z" />
      <path d="M9 9.5c0 3 2.5 5.5 5.5 5.5.6 0 1.2-.6 1.2-1.2 0-.3-.7-1-1.3-1.2-.4-.1-.8.2-1 .4-1.2-.5-2.1-1.4-2.6-2.6.2-.2.5-.6.4-1-.2-.6-.9-1.3-1.2-1.3-.6 0-1.2.6-1.2 1.2Z" />
    </svg>
  )
}

export function IconFacebook(props) {
  return (
    <svg {...base} {...props}>
      <path d="M14 8h2.5M14 8c0-2 1-3 3-3M14 8v3m0 0h-2.5M14 11v9" />
    </svg>
  )
}

export function IconTikTok(props) {
  return (
    <svg {...base} {...props}>
      <path d="M14 4v11a4 4 0 1 1-4-4" />
      <path d="M14 7a5 5 0 0 0 5 4" />
    </svg>
  )
}
