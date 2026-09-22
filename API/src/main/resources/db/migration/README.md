# Flyway migrations by module

`V1__init.sql`, `V2__seed.sql`, and `V3__add_asistente_role.sql` are historical
migrations. Never rename, move, edit, or delete them: Flyway validates their
checksums in databases that have already been initialized.

All new migrations belong to exactly one module folder. Flyway is configured to
load all of these locations.

| Owner | Folder | Reserved version range |
| --- | --- | --- |
| Patients | `patients/` | `1000`–`1999` |
| Staff | `staff/` | `2000`–`2999` |
| Appointments | `appointments/` | `3000`–`3999` |
| Clinical | `clinical/` | `4000`–`4999` |
| Finance | `finance/` | `5000`–`5999` |

Use the next unused number in the range and a descriptive name, for example
`V1000__create_patient_messages.sql`. A migration may reference a table owned
by another module only after that table's migration has been applied. Do not
create or edit a central schema file for new work.
