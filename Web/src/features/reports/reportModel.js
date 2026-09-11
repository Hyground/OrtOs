import { normalize, localDate } from '@/features/clinical/mockStore'
import {
  dentitionNumbers,
  summarize,
  detailRows,
  stateById,
} from '@/features/odontogram/odontogramModel'

export const reportCatalog = [
  {
    id: 'income',
    title: 'Ingresos y pagos pendientes',
    description: 'Cobros, abonos y saldos por paciente.',
    icon: 'money',
  },
  {
    id: 'appointments',
    title: 'Citas y asistencia',
    description: 'Programación, atención y cancelaciones.',
    icon: 'calendar',
  },
  {
    id: 'patients',
    title: 'Pacientes y tratamientos',
    description: 'Tratamientos registrados y seguimiento.',
    icon: 'patients',
  },
  {
    id: 'activity',
    title: 'Actividad por odontólogo',
    description: 'Citas y pacientes por profesional.',
    icon: 'doctor',
  },
  {
    id: 'dental',
    title: 'Estado dental por paciente',
    description: 'Hallazgos, indicaciones y observaciones.',
    icon: 'tooth',
  },
  {
    id: 'overview',
    title: 'Resumen general de la clínica',
    description: 'Indicadores de atención y gestión.',
    icon: 'chart',
  },
]

const professionalName = (value) =>
  normalize(value)
    .replace(/^dra?\.?\s+/, '')
    .trim()
const emptyClinic = { patients: [], appointments: [], payments: [] }

// Do not infer a professional from a partial name or assign a demonstration account.
export function scopeClinic(clinic, user, doctors) {
  if (user?.role === 'admin') return { ...clinic, scope: 'Toda la clínica', warning: '' }
  if (user?.role !== 'odontologo')
    return { ...emptyClinic, scope: 'Sin acceso', warning: 'No tienes acceso a estos reportes.' }
  const matches = doctors.filter(
    (doctor) =>
      (user.doctorId && doctor.id === user.doctorId) ||
      (user.email && normalize(doctor.email) === normalize(user.email)) ||
      (user.displayName && professionalName(doctor.name) === professionalName(user.displayName)),
  )
  if (matches.length > 1)
    return {
      ...emptyClinic,
      scope: 'Mi actividad',
      warning:
        'La cuenta coincide con varios profesionales. Se requiere un v?nculo ?nico para consultar reportes.',
    }
  const doctor = matches.length === 1 ? matches[0] : null
  const name = professionalName(doctor?.name || user.displayName)
  const appointments = clinic.appointments.filter((appointment) =>
    doctor && appointment.dentistId
      ? appointment.dentistId === doctor.id
      : name && professionalName(appointment.dentist) === name,
  )
  const patientIds = new Set(appointments.map(({ patientId }) => patientId))
  const assigned = clinic.patients.filter((patient) => doctor && patient.dentistId === doctor.id)
  assigned.forEach(({ id }) => patientIds.add(id))
  return {
    patients: clinic.patients.filter(({ id }) => patientIds.has(id)),
    appointments,
    payments: clinic.payments.filter(({ patientId }) => patientIds.has(patientId)),
    scope: `Mis pacientes y actividad · ${user.displayName || user.email}`,
    warning:
      !doctor && !appointments.length
        ? 'No se encontró un vínculo verificable entre tu cuenta y un odontólogo con citas. No hay datos disponibles para esta cuenta.'
        : '',
  }
}

export function validateFilters(filters) {
  if (filters.from && filters.to && filters.from > filters.to)
    return 'La fecha inicial no puede ser posterior a la fecha final.'
  return ''
}

const amount = (value) => (Number.isFinite(Number(value)) ? Number(value) : 0)
const sum = (rows) =>
  Math.round(rows.reduce((total, row) => total + amount(row.amount), 0) * 100) / 100
const metric = (label, value, unit = '') => ({ label, value, unit })
const table = (title, labels, rows) => ({
  title,
  columns: labels.map((label, index) => ({ key: String(index), label })),
  rows,
})
const group = (rows, key) =>
  Object.entries(
    rows.reduce((counts, row) => {
      const label = row[key] || 'No registrado'
      counts[label] = (counts[label] || 0) + 1
      return counts
    }, Object.create(null)),
  ).map(([label, value]) => ({ label, value }))
const currencies = (rows) => [...new Set(rows.map((row) => row.currency || 'GTQ'))].sort()

export function buildReport(id, scoped, filters, charts = {}) {
  const meta = reportCatalog.find((item) => item.id === id)
  if (!meta) throw new Error('Reporte no disponible.')
  const filterError = validateFilters(filters)
  if (filterError) throw new Error(filterError)
  const within = (date) =>
    (!filters.from || date >= filters.from) && (!filters.to || date <= filters.to)
  const byPatient = (row) => !filters.patientId || row.patientId === filters.patientId
  const selectedAppointments = scoped.appointments.filter(
    (row) => !filters.dentist || row.dentist === filters.dentist,
  )
  const doctorPatients = new Set(selectedAppointments.map((row) => row.patientId))
  const patients = scoped.patients.filter(
    (row) =>
      (!filters.patientId || row.id === filters.patientId) &&
      (!filters.dentist || doctorPatients.has(row.id)),
  )
  const patientIds = new Set(patients.map(({ id: patientId }) => patientId))
  const names = Object.fromEntries(patients.map((row) => [row.id, row.name]))
  const appointments = selectedAppointments
    .filter((row) => byPatient(row) && patientIds.has(row.patientId) && within(row.date))
    .sort((a, b) => a.date.localeCompare(b.date) || a.time.localeCompare(b.time))
  const payments = scoped.payments
    .filter((row) => patientIds.has(row.patientId) && within(row.date))
    .sort((a, b) => a.date.localeCompare(b.date))
  const completed = payments.filter((row) => row.status === 'Completado')
  const pending = payments.filter((row) => row.status === 'Pendiente')
  const totals = (currencies(payments).length ? currencies(payments) : ['GTQ']).flatMap(
    (currency) => [
      metric(
        'Cobrado',
        sum(completed.filter((row) => (row.currency || 'GTQ') === currency)),
        currency,
      ),
      metric(
        'Pagos pendientes',
        sum(pending.filter((row) => (row.currency || 'GTQ') === currency)),
        currency,
      ),
    ],
  )
  const paymentTable = table(
    'Pagos del período',
    ['Fecha', 'Paciente', 'Concepto', 'Estado', 'Método', 'Moneda', 'Monto'],
    payments.map((row) => [
      row.date,
      names[row.patientId],
      row.concept,
      row.status,
      row.method,
      row.currency || 'GTQ',
      amount(row.amount),
    ]),
  )
  const balances = table(
    'Saldos actuales de pacientes',
    ['Expediente', 'Paciente', 'Saldo registrado (GTQ)'],
    patients
      .filter((row) => amount(row.balance) > 0)
      .map((row) => [row.folio, row.name, amount(row.balance)]),
  )
  const attendance = [
    metric('Citas', appointments.length),
    metric('Atendidas', appointments.filter((row) => row.status === 'Completada').length),
    metric('Canceladas', appointments.filter((row) => row.status === 'Cancelada').length),
    metric('Pendientes', appointments.filter((row) => row.status === 'Pendiente').length),
  ]
  const result = {
    id,
    title: meta.title,
    date: localDate(),
    scope: scoped.scope,
    filters: [
      `Período: ${filters.from || 'Sin inicio'} a ${filters.to || 'Sin fin'}`,
      `Paciente: ${filters.patientId ? names[filters.patientId] || 'Sin coincidencias' : 'Todos los autorizados'}`,
      `Odontólogo: ${filters.dentist || 'Todos los autorizados'}`,
    ],
    metrics: [],
    charts: [],
    tables: [],
    notes: scoped.warning ? [scoped.warning] : [],
  }
  if (id === 'income' || id === 'overview') {
    result.notes.push(
      'Los pagos se filtran por su fecha. Los saldos son actuales, se expresan en GTQ según el registro del paciente y no se suman a los pagos pendientes. Las monedas se presentan por separado.',
    )
    result.metrics.push(
      ...totals,
      metric(
        'Saldos actuales',
        Math.round(patients.reduce((total, row) => total + amount(row.balance), 0) * 100) / 100,
        'GTQ',
      ),
    )
    result.charts.push(
      ...currencies(completed).map((currency) => ({
        title: `Cobros por método · ${currency}`,
        unit: currency,
        kind: 'bar',
        data: Object.entries(
          completed
            .filter((row) => (row.currency || 'GTQ') === currency)
            .reduce((acc, row) => {
              acc[row.method || 'No registrado'] =
                (acc[row.method || 'No registrado'] || 0) + amount(row.amount)
              return acc
            }, Object.create(null)),
        ).map(([label, value]) => ({ label, value: Math.round(value * 100) / 100 })),
      })),
    )
    result.tables.push(paymentTable, balances)
  }
  if (id === 'appointments' || id === 'overview') {
    result.metrics.push(...attendance)
    result.charts.push({
      title: 'Estado de las citas',
      kind: 'donut',
      data: group(appointments, 'status'),
    })
    result.tables.push(
      table(
        'Citas del período',
        ['Fecha', 'Hora', 'Paciente', 'Odontólogo', 'Tratamiento', 'Estado'],
        appointments.map((row) => [
          row.date,
          row.time,
          names[row.patientId],
          row.dentist,
          row.treatment,
          row.status,
        ]),
      ),
    )
    result.notes.push(
      'Las ausencias no se registran como estado en el módulo actual. Una cita pendiente no se considera una ausencia.',
    )
  }
  if (id === 'patients' || id === 'overview') {
    const cohort = patients.filter((row) => within(row.createdAt))
    result.metrics.push(
      metric('Pacientes registrados en el período', cohort.length),
      metric('Activos en esta selección', cohort.filter((row) => row.status === 'Activo').length),
    )
    result.charts.push({
      title: 'Pacientes por tratamiento actual',
      kind: 'bar',
      data: group(cohort, 'treatment'),
    })
    result.tables.push(
      table(
        'Pacientes y tratamiento actual',
        [
          'Expediente',
          'Paciente',
          'Registro',
          'Estado',
          'Tratamiento actual',
          'Última cita registrada',
        ],
        cohort.map((row) => [
          row.folio,
          row.name,
          row.createdAt,
          row.status,
          row.treatment,
          row.lastAppointment,
        ]),
      ),
    )
    result.notes.push(
      'El período filtra la fecha de registro del paciente. El tratamiento y la última cita son los valores actuales; no representan una evolución histórica.',
    )
  }
  if (id === 'activity') {
    const professionals = [
      ...new Set(appointments.map((row) => row.dentist || 'No registrado')),
    ].sort()
    result.metrics = [
      metric('Profesionales con citas', professionals.length),
      metric('Citas', appointments.length),
      metric(
        'Pacientes atendidos',
        new Set(
          appointments.filter((row) => row.status === 'Completada').map((row) => row.patientId),
        ).size,
      ),
    ]
    result.charts = [
      { title: 'Citas por odontólogo', kind: 'bar', data: group(appointments, 'dentist') },
    ]
    result.tables = [
      table(
        'Actividad del período',
        [
          'Odontólogo',
          'Citas',
          'Atendidas',
          'Pendientes',
          'Canceladas',
          'Pacientes con cita',
          'Pacientes atendidos',
        ],
        professionals.map((name) => {
          const rows = appointments.filter((row) => (row.dentist || 'No registrado') === name)
          return [
            name,
            rows.length,
            rows.filter((row) => row.status === 'Completada').length,
            rows.filter((row) => row.status === 'Pendiente').length,
            rows.filter((row) => row.status === 'Cancelada').length,
            new Set(rows.map((row) => row.patientId)).size,
            new Set(rows.filter((row) => row.status === 'Completada').map((row) => row.patientId))
              .size,
          ]
        }),
      ),
    ]
  }
  if (id === 'dental') {
    result.filters = result.filters.filter((line) => !line.startsWith('Período:'))
    result.filters.push(`Dentadura: ${filters.dentition === 'temporary' ? 'Infantil' : 'Adulto'}`)
    result.notes.push(
      'Estado actual del odontograma. Cada diente cuenta una vez por hallazgo; puede aparecer en varias categorías. Sano significa que todas sus superficies están sanas. No hay historial por fecha.',
    )
    const patient = patients.find((row) => row.id === filters.patientId)
    if (!patient) {
      result.notes.push('Selecciona un paciente para consultar su odontograma.')
      return result
    }
    const chart = charts[patient.id]
    if (chart instanceof Error)
      throw new Error(
        'No se pudo leer el odontograma del paciente. Revisa su registro antes de exportar.',
      )
    const numbers = dentitionNumbers(filters.dentition || 'permanent')
    const counts = summarize(chart || {}, numbers)
    const entries = Object.entries(counts).filter(
      ([key, value]) => filters.dentition !== 'temporary' || key !== 'protesis' || value > 0,
    )
    result.metrics = entries.map(([key, value]) => metric(stateById[key].label, value, 'dientes'))
    result.charts = [
      {
        title: 'Dientes por estado',
        kind: 'bar',
        data: entries.map(([key, value]) => ({ label: stateById[key].label, value })),
      },
    ]
    result.tables = [
      table(
        'Hallazgos e indicaciones por pieza',
        ['Pieza', 'Zona', 'Hallazgo', 'Superficies', 'Tratamiento indicado', 'Observaciones'],
        detailRows(chart || {}, numbers).map((row) => [
          row.number,
          row.zone,
          stateById[row.state]?.label || 'Observación',
          row.surfaces,
          row.treatment,
          row.notes,
        ]),
      ),
    ]
  }
  return result
}
