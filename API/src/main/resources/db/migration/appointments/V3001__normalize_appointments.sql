create table appointment_types (
    id smallint primary key,
    name text not null unique,
    description text,
    is_active boolean not null default true
);

create table appointment_priorities (
    id smallint primary key,
    name text not null unique,
    level smallint not null unique check (level between 1 and 3)
);

create table appointment_statuses (
    id smallint primary key,
    name text not null unique
);

create table appointments (
    id uuid primary key,
    patient_id varchar(36) not null references pacientes(id),
    doctor_id varchar(36) not null references medicos(id),
    appointment_type_id smallint not null references appointment_types(id),
    priority_id smallint not null references appointment_priorities(id),
    status_id smallint not null references appointment_statuses(id),
    appointment_at timestamptz not null,
    notes text
);

create index idx_appointments_patient_id on appointments(patient_id);
create index idx_appointments_doctor_id on appointments(doctor_id);
create index idx_appointments_appointment_at on appointments(appointment_at);
create index idx_appointments_status_id on appointments(status_id);

insert into appointment_types (id, name, description, is_active) values
    (1, 'Consulta', 'Consulta odontológica general.', true),
    (2, 'Control', 'Control o revisión de tratamiento.', true),
    (3, 'Tratamiento', 'Sesión de tratamiento odontológico.', true),
    (4, 'Urgencia', 'Atención odontológica urgente.', true)
on conflict (id) do nothing;

insert into appointment_priorities (id, name, level) values
    (1, 'Normal', 1),
    (2, 'Prioritaria', 2),
    (3, 'Urgente', 3)
on conflict (id) do nothing;

insert into appointment_statuses (id, name) values
    (1, 'Programada'),
    (2, 'Confirmada'),
    (3, 'En atención'),
    (4, 'Completada'),
    (5, 'Cancelada'),
    (6, 'No asistió')
on conflict (id) do nothing;
