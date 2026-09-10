const firstNames = [
  'María Fernanda',
  'Juan Carlos',
  'Ana Lucía',
  'José Antonio',
  'Sofía Isabel',
  'Luis Fernando',
  'Gabriela',
  'Pedro Miguel',
]
const lastNames = [
  'López García',
  'Pérez',
  'Ramírez',
  'Hernández',
  'Castillo',
  'Gómez',
  'Morales',
  'Díaz',
]
export const patientSeed = Array.from({ length: 128 }, (_, i) => ({
  id: 'patient-' + (i + 1),
  names: firstNames[i % 8],
  surnames:
    lastNames[i % 8] +
    (i >= 8 ? ' ' + ['Méndez', 'López', 'García', 'Cruz'][Math.floor(i / 8) % 4] : ''),
  name:
    firstNames[i % 8] +
    ' ' +
    lastNames[i % 8] +
    (i >= 8 ? ' ' + ['Méndez', 'López', 'García', 'Cruz'][Math.floor(i / 8) % 4] : ''),
  dpi: i === 0 ? '3170626701302' : i === 1 ? '123456780101' : String(3170626701302 + i),
  phone:
    i === 0 ? '5555-1234' : i === 1 ? '5555-5678' : '5555-' + String(1200 + i).padStart(4, '0'),
  email: i === 0 ? 'marifer26452@gmail.com' : 'paciente' + (i + 1) + '@example.com',
  folio:
    i === 0
      ? 'EXP-2026-00128'
      : i === 1
        ? 'EXP-2026-004'
        : 'EXP-2026-' + String(i + 129).padStart(5, '0'),
  birthDate: i === 0 ? '1995-05-15' : 1980 + (i % 25) + '-06-12',
  gender: i % 2 ? 'Masculino' : 'Femenino',
  status: i % 11 === 10 ? 'Inactivo' : 'Activo',
  treatment: i % 3 === 0 ? 'Ortodoncia - Fase 2' : i % 3 === 1 ? 'Limpieza dental' : 'Endodoncia',
  balance: i % 4 === 0 ? 500 : 0,
  maritalStatus: i % 2 ? 'Casado/a' : 'Soltero/a',
  occupation: i % 2 ? 'Comerciante' : 'Estudiante',
  secondaryPhone: '5555-5678',
  department: 'Huehuetenango',
  municipality: i % 2 ? 'Chiantla' : 'Huehuetenango',
  address: 'Zona 1, Huehuetenango',
  reference: 'Frente al parque central',
  bloodGroup: 'O+',
  allergies: i === 0 ? 'Penicilina' : 'Ninguna conocida',
  diseases: 'Sin antecedentes relevantes',
  medications: false,
  smoker: false,
  notes: '',
  photo: '',
  lastAppointment: '2026-08-' + String(31 - (i % 28)).padStart(2, '0'),
  createdAt: i < 12 ? '2026-08-15' : '2026-07-01',
}))
export const locations = {
  Huehuetenango: ['Huehuetenango', 'Chiantla', 'La Democracia', 'Jacaltenango', 'Cuilco'],
  Guatemala: ['Guatemala', 'Mixco', 'Villa Nueva', 'San Miguel Petapa'],
  Quetzaltenango: ['Quetzaltenango', 'Salcajá', 'Coatepeque'],
  'Alta Verapaz': ['Cobán', 'San Pedro Carchá', 'San Juan Chamelco'],
  Quiché: ['Santa Cruz del Quiché', 'Chichicastenango'],
  SanMarcos: ['San Marcos', 'San Pedro Sacatepéquez'],
  Totonicapán: ['Totonicapán', 'Momostenango'],
  Sacatepéquez: ['Antigua Guatemala', 'Jocotenango'],
}
