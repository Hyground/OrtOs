alter table citas add column if not exists sale_id varchar(36);
alter table citas add column if not exists sale_line_id varchar(36);
alter table citas add column if not exists treatment_id varchar(36) references tratamientos(id);
alter table citas add column if not exists dentist_id varchar(36) references medicos(id);
alter table citas add column if not exists session_number integer;

create index if not exists idx_citas_sale on citas(sale_id);
create index if not exists idx_citas_sale_line on citas(sale_line_id);
create index if not exists idx_citas_treatment on citas(treatment_id);
create index if not exists idx_citas_dentist on citas(dentist_id);
