/**
 * @typedef {Object} Doctor
 * @property {string} id
 * @property {string} names
 * @property {string} surnames
 * @property {string} name
 * @property {string} dpi
 * @property {string} specialty
 * @property {string} address
 * @property {string} phone
 * @property {string} email
 * @property {string} status
 * @property {string} photo
 */

export const specialties = ['General', 'Ortodoncia', 'Endodoncia', 'Cirugía oral', 'Odontopediatría']

/** @type {Doctor[]} */
export const doctorSeed = [
  {
    id: 'doctor-1',
    names: 'Luis Cano',
    surnames: 'Médico',
    name: 'Luis Cano Médico',
    dpi: '245446445',
    specialty: 'Ortodoncia',
    address: 'Zona 1',
    phone: '54646555',
    email: 'luis.cano@ortos.test',
    status: 'Activo',
    photo: '',
  },
  {
    id: 'doctor-2',
    names: 'Ana Sofía',
    surnames: 'Morales',
    name: 'Ana Sofía Morales',
    dpi: '285449112',
    specialty: 'General',
    address: 'Zona 2',
    phone: '53214567',
    email: 'ana.morales@ortos.test',
    status: 'Activo',
    photo: '',
  },
  {
    id: 'doctor-3',
    names: 'Carlos Estuardo',
    surnames: 'Pérez',
    name: 'Carlos Estuardo Pérez',
    dpi: '198774562',
    specialty: 'Endodoncia',
    address: 'Zona 4',
    phone: '55889977',
    email: 'carlos.perez@ortos.test',
    status: 'Activo',
    photo: '',
  },
  {
    id: 'doctor-4',
    names: 'María Fernanda',
    surnames: 'López',
    name: 'María Fernanda López',
    dpi: '301245678',
    specialty: 'Odontopediatría',
    address: 'Zona 7',
    phone: '59001122',
    email: 'maria.lopez@ortos.test',
    status: 'Inactivo',
    photo: '',
  },
  {
    id: 'doctor-5',
    names: 'Jorge Luis',
    surnames: 'Ramírez',
    name: 'Jorge Luis Ramírez',
    dpi: '234567891',
    specialty: 'Cirugía oral',
    address: 'Zona 10',
    phone: '54112233',
    email: 'jorge.ramirez@ortos.test',
    status: 'Activo',
    photo: '',
  },
  {
    id: 'doctor-6',
    names: 'Lucía Isabel',
    surnames: 'Gómez',
    name: 'Lucía Isabel Gómez',
    dpi: '267891234',
    specialty: 'Ortodoncia',
    address: 'Zona 1',
    phone: '56778899',
    email: 'lucia.gomez@ortos.test',
    status: 'Activo',
    photo: '',
  },
  {
    id: 'doctor-7',
    names: 'Roberto',
    surnames: 'Méndez',
    name: 'Roberto Méndez',
    dpi: '209876543',
    specialty: 'Endodoncia',
    address: 'Zona 3',
    phone: '51239876',
    email: '',
    status: 'Activo',
    photo: '',
  },
]
