create table notifications (
    id uuid primary key,
    user_id varchar(36) not null references usuarios(id) on delete restrict,
    appointment_id uuid references appointments(id) on delete set null,
    type varchar(50) not null,
    title varchar(150) not null check (length(trim(title)) > 0),
    message varchar(600) not null check (length(trim(message)) > 0),
    is_read boolean not null default false,
    created_at timestamptz not null default current_timestamp,
    read_at timestamptz
);

create index idx_notifications_user_id on notifications(user_id);
create index idx_notifications_appointment_id on notifications(appointment_id);
create index idx_notifications_is_read on notifications(is_read);
create index idx_notifications_created_at on notifications(created_at);
