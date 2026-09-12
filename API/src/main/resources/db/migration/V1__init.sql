create table pacientes (
    id varchar(36) primary key,
    names text not null,
    surnames text not null,
    dpi text unique,
    phone text,
    secondary_phone text,
    email text,
    birth_date date,
    gender text,
    marital_status text,
    occupation text,
    department text,
    municipality text,
    address text,
    reference text,
    blood_group text,
    allergies text,
    diseases text,
    medications boolean not null default false,
    smoker boolean not null default false,
    notes text,
    photo text,
    status text not null default 'Activo',
    folio text not null unique,
    created_at timestamp not null default now()
);

create table medicos (
    id varchar(36) primary key,
    names text not null,
    surnames text not null,
    dpi text,
    specialty text,
    address text,
    phone text,
    email text,
    status text not null default 'Activo',
    photo text
);

create table especialidades (
    id varchar(36) primary key,
    name text not null unique,
    description text
);

create table tratamientos (
    id varchar(36) primary key,
    name text not null,
    description text,
    category text,
    price numeric(12,2),
    duration_min integer,
    active boolean not null default true
);

create table usuarios (
    id varchar(36) primary key,
    display_name text not null,
    email text not null unique,
    password_hash text not null,
    role text not null check (role in ('admin','odontologo','paciente')),
    active boolean not null default true,
    medico_id varchar(36) references medicos(id),
    patient_id varchar(36) references pacientes(id),
    codigo_recuperacion text,
    codigo_recuperacion_expira timestamp,
    fecha_creacion timestamp not null default now(),
    ultimo_acceso timestamp
);

create table citas (
    id varchar(36) primary key,
    patient_id varchar(36) not null references pacientes(id),
    dentist text,
    date date not null,
    time text not null,
    duration text,
    chair text,
    treatment text,
    type text,
    priority text,
    reminder text,
    reason text,
    notes text,
    status text not null default 'Pendiente',
    fecha_creacion timestamp not null default now(),
    creada_por varchar(36) references usuarios(id)
);

create table odontograma (
    patient_id varchar(36) not null references pacientes(id),
    tooth_number integer not null,
    surface text not null,
    state text not null default 'sinRegistro',
    treatment text,
    notes text,
    registrado_por varchar(36) references usuarios(id),
    fecha_actualizacion timestamp not null default now(),
    primary key (patient_id, tooth_number, surface)
);

create table historial_clinico (
    id varchar(36) primary key,
    patient_id varchar(36) not null references pacientes(id),
    date date not null,
    treatment text,
    dentist text,
    notes text
);

create table pagos (
    id varchar(36) primary key,
    patient_id varchar(36) not null references pacientes(id),
    concept text,
    treatment text,
    date date not null,
    amount numeric(12,2) not null,
    currency text not null default 'GTQ',
    method text,
    reference text,
    notes text,
    receipt boolean not null default false,
    receipt_number text unique,
    status text not null default 'Pendiente',
    registrado_por varchar(36) references usuarios(id),
    fecha_creacion timestamp not null default now()
);

create index idx_citas_patient on citas(patient_id);
create index idx_pagos_patient on pagos(patient_id);
create index idx_historial_patient on historial_clinico(patient_id);
create index idx_usuarios_email on usuarios(email);
