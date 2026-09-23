create table sales (
    id varchar(36) primary key,
    patient_id varchar(36) not null references pacientes(id),
    registered_by varchar(36) references usuarios(id),
    sale_date date not null,
    status text not null default 'Registrada' check (status in ('Registrada', 'Anulada')),
    created_at timestamp not null default now()
);

create table sale_lines (
    id varchar(36) primary key,
    sale_id varchar(36) not null references sales(id),
    treatment_id varchar(36) references tratamientos(id),
    description text not null,
    quantity numeric(12,2) not null check (quantity > 0),
    unit_price numeric(12,2) not null check (unit_price >= 0),
    subtotal numeric(12,2) not null check (subtotal >= 0)
);

alter table cargos add column if not exists sale_id varchar(36) references sales(id);
alter table cargos add column if not exists sale_line_id varchar(36) references sale_lines(id);
alter table cargos add column if not exists registered_by varchar(36) references usuarios(id);

alter table payment_plans add column if not exists name text not null default 'Plan de pago';
alter table payment_plans add column if not exists registered_by varchar(36) references usuarios(id);

create table payment_plan_charges (
    payment_plan_id varchar(36) not null references payment_plans(id),
    charge_id varchar(36) not null references cargos(id),
    financed_amount numeric(12,2) not null check (financed_amount > 0),
    primary key (payment_plan_id, charge_id)
);

alter table citas add constraint fk_citas_sale foreign key (sale_id) references sales(id);
alter table citas add constraint fk_citas_sale_line foreign key (sale_line_id) references sale_lines(id);

create index idx_sales_patient on sales(patient_id);
create index idx_sale_lines_sale on sale_lines(sale_id);
create index idx_sale_lines_treatment on sale_lines(treatment_id);
create index idx_cargos_sale on cargos(sale_id);
create index idx_cargos_sale_line on cargos(sale_line_id);
create index idx_cargos_treatment on cargos(treatment_id);
create index idx_allocations_payment on payment_allocations(payment_id);
create index idx_payment_plans_patient on payment_plans(patient_id);
create index idx_installments_plan on installments(payment_plan_id);
create index idx_plan_charges_charge on payment_plan_charges(charge_id);
