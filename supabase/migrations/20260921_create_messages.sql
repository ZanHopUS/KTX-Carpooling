-- Migration: 20260921_create_messages.sql
-- Description: Tao bang public.messages cho tinh nang chat chuyen di kem RLS bao mat theo trip membership
-- Author: Antigravity (Execution Agent)
-- Task: TASK-002

-- 1. Tao bang public.messages
create table public.messages (
    id uuid primary key default gen_random_uuid(),
    trip_id uuid not null references public.trips(id) on delete cascade,
    sender_id uuid not null references public.profiles(id),
    content text not null constraint messages_content_not_empty check (trim(content) <> ''),
    created_at timestamptz not null default now()
);

-- Comment mo ta bang va cot
comment on table public.messages is 'Luu tru tin nhan chat noi bo giua tai xe va hanh khach trong chuyen di';
comment on column public.messages.id is 'Khoa chinh cua tin nhan (UUID)';
comment on column public.messages.trip_id is 'ID chuyen di lien ket (FK -> trips.id)';
comment on column public.messages.sender_id is 'ID nguoi gui tin nhan (FK -> profiles.id)';
comment on column public.messages.content is 'Noi dung tin nhan (text, khong rong)';
comment on column public.messages.created_at is 'Thoi diem tao tin nhan';

-- 2. Tao index phuc vu truy van tin nhan theo chuyen va sap xep theo thoi gian
create index idx_messages_trip_id_created_at on public.messages (trip_id, created_at asc);

-- 3. Bat Row Level Security (RLS)
alter table public.messages enable row level security;

-- 4. RLS Policy: SELECT (Chi cho phep thanh vien chuyen di doc tin nhan)
-- Dieu kien:
-- - Tai xe cua chuyen di HOAC hanh khach duoc chap nhan tren canonical trips(accepted_passenger_id)
-- - Hanh khach co yeu cau da duoc chap nhan (ACCEPTED) trong trip_requests
-- - Admin theo role model hien tai
create policy "messages_select_policy"
on public.messages
for select
to authenticated
using (
    exists (
        select 1
        from public.trips t
        where t.id = messages.trip_id
          and (
              t.driver_id = auth.uid()
              or t.accepted_passenger_id = auth.uid()
          )
    )
    or exists (
        select 1
        from public.trip_requests r
        where r.trip_id = messages.trip_id
          and r.passenger_id = auth.uid()
          and upper(r.status::text) = 'ACCEPTED'
    )
    or exists (
        select 1
        from public.profiles p
        where p.id = auth.uid()
          and upper(p.role::text) = 'ADMIN'
    )
);

-- 5. RLS Policy: INSERT (Chi cho phep thanh vien tham gia chuyen di hoac admin gui tin nhan)
-- Dieu kien:
-- - sender_id phai chinh la auth.uid() (chong gia mao sender_id)
-- - Nguoi gui phai la tai xe cua chuyen di HOAC hanh khach da duoc chap nhan (canonical trips.accepted_passenger_id HOAC trip_requests status ACCEPTED) HOAC admin
create policy "messages_insert_policy"
on public.messages
for insert
to authenticated
with check (
    sender_id = auth.uid()
    and (
        exists (
            select 1
            from public.trips t
            where t.id = messages.trip_id
              and (
                  t.driver_id = auth.uid()
                  or t.accepted_passenger_id = auth.uid()
              )
        )
        or exists (
            select 1
            from public.trip_requests r
            where r.trip_id = messages.trip_id
              and r.passenger_id = auth.uid()
              and upper(r.status::text) = 'ACCEPTED'
        )
        or exists (
            select 1
            from public.profiles p
            where p.id = auth.uid()
              and upper(p.role::text) = 'ADMIN'
        )
    )
);

-- 6. Cap quyen truy cap cho authenticated role
grant select, insert on table public.messages to authenticated;
