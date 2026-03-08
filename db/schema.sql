create table if not exists public.students (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  home_district text not null,
  hsc_batch text not null,
  admission_roll text not null,
  profile_photo_url text not null,
  phone text not null unique,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.otp_sessions (
  id uuid primary key default gen_random_uuid(),
  phone text not null,
  otp_code text not null,
  expires_at timestamptz not null,
  attempt_count int not null default 0,
  verified boolean not null default false,
  created_at timestamptz not null default now(),
  unique(phone)
);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_students_updated_at on public.students;
create trigger trg_students_updated_at
before update on public.students
for each row execute function public.set_updated_at();

alter table public.students enable row level security;
alter table public.otp_sessions enable row level security;

create policy "public can read approved students"
on public.students
for select
using (status = 'approved');

create policy "service role full access students"
on public.students
for all
using (auth.role() = 'service_role')
with check (auth.role() = 'service_role');

create policy "service role full access otp"
on public.otp_sessions
for all
using (auth.role() = 'service_role')
with check (auth.role() = 'service_role');
