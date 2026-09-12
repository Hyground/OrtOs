alter table usuarios drop constraint usuarios_role_check;
alter table usuarios add constraint usuarios_role_check check (role in ('admin','odontologo','asistente','paciente'));
