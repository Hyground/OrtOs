# Team modules

OrtOs remains one Spring Boot API and one shared PostgreSQL database. The
folders below define ownership boundaries; they are not microservices and do
not imply separate deployments or databases.

## Persona 1 — Patients

- Branch: `feature/patients`
- Folder: `src/main/java/com/ortos/api/modules/patients/`
- Owns current table: `pacientes`; future tables: `patient_messages` and
  `user_preferences`.
- Owns current endpoint: `/api/patients`.
- Main files: `PatientController`, `PatientService`, `PacienteRepository`,
  `Paciente`, and `PatientDto`.
- Consumes: appointment and payment records only through their identifiers or
  public module contracts. It must not duplicate `Cita` or `Pago`.
- Do not edit without coordination: `shared/security`, `shared/config`,
  `application*.properties`, the historical Flyway files, or another module's
  files.

`patient_messages` and `user_preferences` have no API entity, endpoint, or
migration yet. Their first implementation belongs in this folder and in
`db/migration/patients/`.

## Persona 2 — Staff and access

- Branch: `feature/staff`
- Folder: `src/main/java/com/ortos/api/modules/staff/`
- Owns tables: `medicos`, `especialidades`, `usuarios`.
- Owns endpoints: `/api/doctors`, `/api/specialties`, `/api/users`, and
  `/api/auth`.
- Main files: `Doctor*`, `Specialty*`, `User*`, `Auth*`, `Medico`,
  `Especialidad`, `Usuario`, their repositories, and `SeedUsersRunner`.
- Consumes: `pacientes` through `patient_id` in `usuarios`; no patient entity
  is duplicated. Roles are `admin`, `odontologo`, `asistente`, and `paciente`.
- Do not edit without coordination: `shared/security` (JWT/filter/access
  guard), `shared/config/SecurityConfig`, application settings, or other
  modules.

## Persona 3 — Appointments

- Branch: `feature/appointments`
- Folder: `src/main/java/com/ortos/api/modules/appointments/`
- Owns table: `citas`; future table: `notifications`.
- Owns endpoint: `/api/appointments`.
- Main files: `AppointmentController`, `AppointmentService`, `CitaRepository`,
  `Cita`, and `AppointmentDto`.
- Consumes: `pacientes` via `patient_id`, `usuarios` via `creada_por`, and
  treatment/doctor IDs or contracts when those relations are normalized.
- Do not edit without coordination: patient/staff entities and repositories,
  shared security/configuration, or historic migrations.

`notifications` is not implemented in the backend yet; create it in this
module and `db/migration/appointments/` when work begins.

## Persona 4 — Clinical

- Branch: `feature/clinical`
- Folder: `src/main/java/com/ortos/api/modules/clinical/`
- Owns tables: `tratamientos`, `historial_clinico`, `odontograma`.
- Owns endpoints: `/api/services`, `/api/clinical-history`, `/api/odontogram`.
- Main files: `ServiceCatalog*`, `ClinicalHistory*`, `Odontogram*`, their
  entities, DTOs, and repositories.
- Consumes: `pacientes` through `patient_id` and `usuarios` through
  `registrado_por`; it does not own their models.
- Do not edit without coordination: patient/staff modules, shared security,
  application settings, or historic migrations.

## Persona 5 — Finance and control

- Branch: `feature/finance`
- Folder: `src/main/java/com/ortos/api/modules/finance/`
- Owns current table: `pagos`; future table: `audit_log`.
- Owns current endpoint: `/api/payments`.
- Main files: `PaymentController`, `PaymentService`, `PagoRepository`, `Pago`,
  and `PaymentDto`.
- Consumes: `pacientes` through `patient_id` and `usuarios` through
  `registrado_por`; it must not duplicate either entity.
- Do not edit without coordination: patient/staff modules, shared security,
  application settings, or historic migrations.

`audit_log` has not been implemented yet. Its schema and API belong in this
module and `db/migration/finance/`.

## Shared and Git rules

- `src/main/java/com/ortos/api/shared/` contains authentication, configuration,
  and global error handling. Change it only with the relevant owner(s) aware.
- `src/main/resources/application*.properties`, `Docker/compose.yaml`, and
  `API/Dockerfile` are coordinated infrastructure files; avoid incidental
  formatting changes.
- Keep V1–V3 intact. Create new Flyway files only in the owning folder and use
  the reserved version ranges in `db/migration/README.md`.
- One feature branch and one pull request per module. Rebase on the integration
  branch before opening the PR, keep commits scoped, and resolve cross-module
  changes with the affected owner before merging.
- New references between domains use foreign-key IDs and focused service or
  repository contracts; never copy a foreign entity into another module.
