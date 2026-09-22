alter table pagos add column if not exists appointment_id varchar(36) references citas(id);

create table cargos (
    id varchar(36) primary key,
    patient_id varchar(36) not null references pacientes(id),
    appointment_id varchar(36) references citas(id),
    treatment_id varchar(36) references tratamientos(id),
    description text not null,
    quantity numeric(12,2) not null check (quantity > 0),
    unit_price numeric(12,2) not null check (unit_price >= 0),
    subtotal numeric(12,2) not null check (subtotal >= 0),
    status text not null default 'Pendiente' check (status in ('Pendiente','Parcial','Pagado','Anulado')),
    created_at timestamp not null default now()
);
create table payment_allocations (
    id varchar(36) primary key,
    payment_id varchar(36) not null references pagos(id),
    charge_id varchar(36) not null references cargos(id),
    amount numeric(12,2) not null check (amount > 0),
    unique(payment_id, charge_id)
);
create table payment_plans (
    id varchar(36) primary key,
    patient_id varchar(36) not null references pacientes(id),
    total_amount numeric(12,2) not null check (total_amount >= 0),
    financed_amount numeric(12,2) not null check (financed_amount > 0),
    installment_count integer not null check (installment_count > 0),
    status text not null default 'Activo' check (status in ('Activo','Completado','Cancelado')),
    created_at timestamp not null default now()
);
create table installments (
    id varchar(36) primary key,
    payment_plan_id varchar(36) not null references payment_plans(id),
    installment_number integer not null,
    amount numeric(12,2) not null check (amount > 0),
    due_date date not null,
    paid_amount numeric(12,2) not null default 0 check (paid_amount >= 0),
    status text not null default 'Pendiente' check (status in ('Pendiente','Pagada','Vencida')),
    unique(payment_plan_id, installment_number)
);
create index idx_cargos_patient on cargos(patient_id);
create index idx_cargos_appointment on cargos(appointment_id);
create index idx_allocations_charge on payment_allocations(charge_id);
