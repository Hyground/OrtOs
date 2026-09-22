# Inventario de datos requeridos por OrtOs

Fecha de revisión: 16 de septiembre de 2026
Alcance: aplicación web, API y aplicación móvil incluidas en este repositorio.

Este documento reúne los datos que hoy solicita, registra o necesita consultar el sistema. Las tablas marcadas como **existentes** están definidas en las migraciones de la API. Las marcadas como **recomendadas** recogen datos que el frontend o la app móvil ya usa, pero que todavía no están normalizados o persistidos por completo en la API.

## Convenciones propuestas

- `id`: UUID o `varchar(36)`, clave primaria.
- Fechas: `date`; fecha y hora: `timestamp with time zone` cuando sea posible.
- Importes: `numeric(12,2)`.
- Los campos con `*` son obligatorios en la interfaz actual.
- No guardar contraseñas en texto plano: usar exclusivamente `password_hash`.
- Las fotos y comprobantes deben guardar una URL/ruta de archivo; no una imagen Base64 en la base de datos.

## 1. Pacientes — existente

Un paciente posee un expediente (folio) único y es la entidad central de citas, pagos, historial, odontograma, mensajes y cuenta de portal.

| Campo | Tipo sugerido | Obligatorio | Descripción / validación actual |
|---|---:|:---:|---|
| id | UUID | Sí | Identificador interno. |
| folio | varchar(30) | Sí | Expediente único, generado por sistema. Ej.: `EXP-2026-00001`. |
| names | varchar(150) | Sí | Nombres. |
| surnames | varchar(150) | Sí | Apellidos. |
| dpi | varchar(13) | No | Único; el formulario público limita a 13 dígitos. |
| birth_date | date | Sí | Fecha de nacimiento; no puede ser futura. |
| gender | varchar(20) | No | Femenino, Masculino u Otro. |
| marital_status | varchar(30) | No | Soltero/a, Casado/a, Divorciado/a, Viudo/a, Unión Libre. |
| occupation | varchar(150) | No | Ocupación. |
| phone | varchar(30) | Sí | Teléfono principal. |
| secondary_phone | varchar(30) | No | Teléfono secundario. |
| email | varchar(254) | No | Correo electrónico. |
| department | varchar(100) | No | Departamento. |
| municipality | varchar(100) | No | Municipio, dependiente del departamento en la UI. |
| address | text | No | Dirección. |
| reference | text | No | Referencia para ubicar domicilio. |
| blood_group | varchar(5) | No | O+, O-, A+, A-, B+, B-, AB+, AB-. |
| allergies | text / JSONB | No | Alergias conocidas; la UI permite varias y especificación libre. |
| diseases | text / JSONB | No | Enfermedades relevantes; la UI permite varias y especificación libre. |
| medications | boolean | Sí | Si toma medicamentos actualmente. |
| smoker | boolean | Sí | Si fuma. |
| notes | text | No | Notas adicionales. |
| photo_url | text | No | Foto del paciente. |
| status | varchar(20) | Sí | Activo / Inactivo. |
| created_at | timestamp | Sí | Fecha de creación. |
| updated_at | timestamp | Sí | Recomendado para auditoría. |

## 2. Médicos / odontólogos — existente

| Campo | Tipo sugerido | Obligatorio | Descripción |
|---|---:|:---:|---|
| id | UUID | Sí | Identificador interno. |
| names | varchar(150) | Sí | Nombres. |
| surnames | varchar(150) | Sí | Apellidos. |
| dpi | varchar(13) | Sí | DPI; obligatorio en el formulario. |
| specialty_id | UUID | Sí | FK a `especialidades`. La API actual conserva texto en `specialty`; migrar a FK. |
| phone | varchar(30) | Sí | Teléfono. |
| email | varchar(254) | No | Correo. |
| address | text | No | Dirección. |
| status | varchar(20) | Sí | Activo / Inactivo. |
| photo_url | text | No | Foto. |
| created_at, updated_at | timestamp | Sí | Recomendados. |

## 3. Usuarios y acceso — existente

Las cuentas pueden pertenecer a administración, odontología, asistencia o pacientes. La migración inicial solo enumera `admin`, `odontologo` y `paciente`; posteriormente se añadió `asistente`, por lo que el catálogo de roles final debe incluir los cuatro.

| Campo | Tipo sugerido | Obligatorio | Descripción |
|---|---:|:---:|---|
| id | UUID | Sí | Identificador. |
| display_name | varchar(200) | Sí | Nombre completo mostrado. |
| email | varchar(254) | Sí | Único; se usa para iniciar sesión y recuperar cuenta. |
| password_hash | text | Sí | Hash seguro de contraseña. |
| role | varchar(20) / FK | Sí | `admin`, `odontologo`, `asistente`, `paciente`. |
| active | boolean | Sí | Permite o bloquea el inicio de sesión. |
| medico_id | UUID | No | FK a médico si aplica. |
| patient_id | UUID | No | FK a paciente si aplica. |
| phone | varchar(30) | No | El formulario de Usuarios lo exige; falta en la tabla actual. |
| specialty_id | UUID | No | Requerida para rol odontólogo en la UI; falta en la tabla actual. |
| recovery_code_hash | text | No | Código temporal de recuperación, guardado como hash. |
| recovery_code_expires_at | timestamp | No | Caducidad del código. |
| created_at | timestamp | Sí | Fecha de creación. |
| last_login_at | timestamp | No | Último acceso. |
| updated_at | timestamp | Sí | Recomendado. |

## 4. Especialidades — existente

| Campo | Tipo sugerido | Obligatorio | Descripción |
|---|---:|:---:|---|
| id | UUID | Sí | Identificador. |
| name | varchar(120) | Sí | Único. Ej.: Ortodoncia, Endodoncia. |
| description | text | No | Descripción de la especialidad. |
| active | boolean | Sí | Recomendado para no borrar registros usados. |
| created_at, updated_at | timestamp | Sí | Recomendados. |

## 5. Catálogo de tratamientos / servicios — existente

| Campo | Tipo sugerido | Obligatorio | Descripción |
|---|---:|:---:|---|
| id | UUID | Sí | Identificador. |
| name | varchar(200) | Sí | Nombre del tratamiento. |
| description | text | No | Descripción. |
| category | varchar(120) | No | Categoría. |
| price | numeric(12,2) | No | Precio de referencia en quetzales. |
| duration_min | integer | No | Duración estimada en minutos. |
| active | boolean | Sí | Disponible para nuevas citas. |
| created_at, updated_at | timestamp | Sí | Recomendados. |

## 6. Citas — existente

Una cita enlaza paciente y, preferiblemente, médico y tratamiento mediante claves foráneas. La API actual almacena varios de estos datos como texto; se señalan las mejoras.

| Campo | Tipo sugerido | Obligatorio | Descripción |
|---|---:|:---:|---|
| id | UUID | Sí | Identificador. |
| patient_id | UUID | Sí | FK a pacientes. |
| doctor_id | UUID | No | FK a médicos. Reemplaza `dentist` textual actual. |
| treatment_id | UUID | No | FK a tratamientos. Reemplaza `treatment` textual actual. |
| appointment_date | date | Sí | Fecha. |
| appointment_time | time | Sí | Hora. |
| duration_min | integer | No | Duración. La UI actual usa minutos. |
| chair | varchar(80) | No | Sillón/consultorio. |
| type | varchar(80) | No | Consulta, tratamiento, control/revisión, etc. |
| priority | varchar(20) | No | Baja, Media, Alta. |
| reminder_hours | integer | No | Horas antes del recordatorio. |
| reason | text | No | Motivo de la visita. |
| notes | text | No | Observaciones. |
| confirmation_channel | varchar(30) | No | Dato del agendamiento público: por teléfono, correo, WhatsApp, etc. |
| request_code | varchar(50) | No | Código/QR de solicitud pública, único. |
| status | varchar(20) | Sí | Pendiente, Confirmada, Completada, Cancelada, No asistió. |
| created_by | UUID | No | FK a usuarios; quién la creó. |
| created_at, updated_at | timestamp | Sí | Auditoría. |

El agendamiento público solicita: DPI*, teléfono*, nombres*, apellidos*, correo opcional, fecha, hora, motivo de visita y canal de confirmación.

## 7. Historial clínico — existente

| Campo | Tipo sugerido | Obligatorio | Descripción |
|---|---:|:---:|---|
| id | UUID | Sí | Identificador. |
| patient_id | UUID | Sí | FK a pacientes. |
| appointment_id | UUID | No | FK recomendada a la cita relacionada. |
| doctor_id | UUID | No | FK a médico; la API actual guarda texto. |
| treatment_id | UUID | No | FK a tratamiento; la API actual guarda texto. |
| entry_date | date | Sí | Fecha de atención. |
| notes | text | No | Diagnóstico, evolución, indicaciones y observaciones. |
| created_at, updated_at | timestamp | Sí | Recomendados. |

## 8. Odontograma — existente

Se guarda un registro por superficie de cada diente del paciente.

| Campo | Tipo sugerido | Obligatorio | Descripción |
|---|---:|:---:|---|
| patient_id | UUID | Sí | FK a pacientes; parte de la clave. |
| tooth_number | smallint | Sí | Número FDI del diente; parte de la clave. |
| surface | varchar(20) | Sí | Cara del diente: superior, inferior, izquierda, derecha, centro, según modelo UI. |
| state | varchar(40) | Sí | Estado dental seleccionado. Por defecto `sinRegistro`. |
| treatment_id | UUID | No | Tratamiento indicado; la implementación actual es texto. |
| notes | text | No | Observación. |
| registered_by | UUID | No | FK a usuarios. |
| updated_at | timestamp | Sí | Última actualización. |

Clave primaria recomendada: `(patient_id, tooth_number, surface)`. Conservar también el tipo de dentadura (permanente/infantil) si se requiere distinguirlo explícitamente.

## 9. Pagos y comprobantes — existente

| Campo | Tipo sugerido | Obligatorio | Descripción |
|---|---:|:---:|---|
| id | UUID | Sí | Identificador. |
| patient_id | UUID | Sí | FK a pacientes. |
| appointment_id | UUID | No | FK recomendada a cita. |
| treatment_id | UUID | No | FK recomendada a tratamiento. |
| concept | varchar(200) | No | Concepto: abono, pago total, consulta, etc. |
| payment_date | date | Sí | Fecha. |
| amount | numeric(12,2) | Sí | Importe. |
| currency | char(3) | Sí | Predeterminado `GTQ`. |
| method | varchar(50) | No | Efectivo, tarjeta de crédito, tarjeta de débito, transferencia, cheque. |
| reference | varchar(150) | No | Referencia/transacción. |
| notes | text | No | Observaciones. |
| receipt_issued | boolean | Sí | Indica si se emitió comprobante. |
| receipt_number | varchar(50) | No | Único. Ej.: `CP-2026-000015`. |
| receipt_url | text | No | PDF/archivo del comprobante; recomendado. |
| status | varchar(20) | Sí | Pendiente, Completado, Anulado/Reembolsado si se implementa. |
| registered_by | UUID | No | FK a usuarios. |
| created_at, updated_at | timestamp | Sí | Auditoría. |

## 10. Mensajes de pacientes — recomendada

La web y la app móvil incorporan chat entre clínica y paciente. Actualmente se apoya en almacenamiento local/mock, por lo que necesita persistencia propia.

| Campo | Tipo sugerido | Obligatorio | Descripción |
|---|---:|:---:|---|
| id | UUID | Sí | Identificador. |
| patient_id | UUID | Sí | Conversación asociada al paciente. |
| sender_user_id | UUID | No | FK a usuario remitente; nulo si se modela por tipo. |
| sender_type | varchar(20) | Sí | `patient` o `clinic`. |
| message_text | text | Sí | Contenido. |
| created_at | timestamp | Sí | Fecha/hora de envío. |
| read_at | timestamp | No | Momento en que se leyó. |

## 11. Notificaciones y preferencias — recomendadas

Las notificaciones se calculan actualmente desde citas, pagos y mensajes, y el estado de leído se guarda en navegador. Para hacerlo multiusuario:

### notificaciones

`id`, `user_id` (FK), `kind` (citas/pagos/mensajes), `title`, `detail`, `href` o `resource_type` + `resource_id`, `created_at`, `read_at`.

### preferencias_usuario

`user_id` (PK/FK), `theme` (claro/oscuro/sistema), `notifications_enabled`, `updated_at`.

## 12. Relaciones principales

```text
Pacientes 1 ── N Citas N ── 1 Médicos
Pacientes 1 ── N Pagos
Pacientes 1 ── N Historial clínico
Pacientes 1 ── N Registros de odontograma
Pacientes 1 ── N Mensajes
Pacientes 1 ── 0..1 Usuarios (cuenta de portal)
Médicos   1 ── 0..1 Usuarios (cuenta profesional)
Especialidades 1 ── N Médicos
Tratamientos   1 ── N Citas / Pagos / Historial / Odontograma
Usuarios 1 ── N Citas, Pagos, Odontograma, Notificaciones
```

## 13. Índices y reglas clave

- Índices: `pacientes(dpi)`, `pacientes(folio)`, `pacientes(names, surnames)`, `usuarios(email)`, `citas(patient_id, appointment_date)`, `citas(doctor_id, appointment_date)`, `pagos(patient_id, payment_date)`, `historial_clinico(patient_id, entry_date)`, `mensajes(patient_id, created_at)`.
- Unicidad: `pacientes.folio`, `pacientes.dpi` cuando tenga valor, `usuarios.email`, `especialidades.name`, `pagos.receipt_number` cuando tenga valor.
- Evitar eliminar pacientes, médicos, especialidades o tratamientos con historial: usar estado activo/inactivo.
- No duplicar nombre de médico ni nombre de tratamiento en citas, pagos e historial: guardar sus ID y resolver el nombre mediante consulta.
- Mantener `created_at`, `updated_at` y, cuando corresponda, usuario responsable para trazabilidad clínica y financiera.

## 14. Diferencias que deben resolverse antes de implementar la base final

1. La API ya tiene las ocho tablas principales: pacientes, médicos, especialidades, tratamientos, usuarios, citas, odontograma, historial clínico y pagos.
2. El frontend pide `teléfono` y `especialidad` en usuarios, pero la tabla `usuarios` no los tiene.
3. La UI maneja `asistente` y la migración de roles inicial no lo contemplaba; validar que la migración posterior lo aplique en la base destino.
4. Citas, pagos, historial y odontograma todavía guardan médico/tratamiento como texto en varios puntos. Se recomienda migrarlos a claves foráneas sin perder los datos existentes.
5. Las fotos se manejan como Base64 en el navegador; se recomienda almacenamiento de archivos y persistir únicamente la URL.
6. Chat, notificaciones leídas, preferencias de tema y código/canal de confirmación del agendamiento público necesitan tablas o columnas adicionales para quedar persistentes.
