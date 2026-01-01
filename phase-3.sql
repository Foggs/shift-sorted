-- Phase 3: Schema + RLS for Shift Sorted (Supabase Postgres)

create extension if not exists "pgcrypto";
create extension if not exists postgis;

create table if not exists public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  role text check (role in ('manager', 'worker')),
  skills text[] not null default '{}',
  location geography(Point, 4326),
  created_at timestamptz not null default now()
);

create table if not exists public.shifts (
  id uuid primary key default gen_random_uuid(),
  manager_id uuid not null references public.users(id) on delete cascade,
  title text not null,
  description text,
  required_skills text[] not null default '{}',
  location geography(Point, 4326),
  start_time timestamptz not null,
  end_time timestamptz not null,
  status text not null default 'open' check (status in ('open', 'claimed', 'completed', 'cancelled')),
  created_at timestamptz not null default now(),
  constraint shifts_time_valid check (end_time > start_time)
);

create table if not exists public.shift_claims (
  id uuid primary key default gen_random_uuid(),
  shift_id uuid not null references public.shifts(id) on delete cascade,
  worker_id uuid not null references public.users(id) on delete cascade,
  claimed_at timestamptz not null default now(),
  constraint shift_claims_one_per_shift unique (shift_id)
);

create index if not exists users_role_idx on public.users(role);
create index if not exists users_location_idx on public.users using gist (location);
create index if not exists shifts_manager_id_idx on public.shifts(manager_id);
create index if not exists shifts_status_idx on public.shifts(status);
create index if not exists shifts_location_idx on public.shifts using gist (location);
create index if not exists shifts_start_time_idx on public.shifts(start_time);
create index if not exists shifts_end_time_idx on public.shifts(end_time);
create index if not exists shift_claims_worker_id_idx on public.shift_claims(worker_id);
create index if not exists shift_claims_shift_id_idx on public.shift_claims(shift_id);

create or replace function public.get_user_role()
returns text
language sql
stable
as $$
  select role from public.users where id = auth.uid()
$$;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.users (id, email, role, skills, location)
  values (
    new.id,
    new.email,
    nullif(new.raw_user_meta_data->>'role', ''),
    coalesce(array(select jsonb_array_elements_text(new.raw_user_meta_data->'skills')), '{}'),
    null
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

alter table public.users enable row level security;
alter table public.shifts enable row level security;
alter table public.shift_claims enable row level security;

create policy "Users can read own profile."
  on public.users for select
  using (auth.uid() = id);

create policy "Users can insert own profile."
  on public.users for insert
  with check (auth.uid() = id);

create policy "Users can update own profile."
  on public.users for update
  using (auth.uid() = id);

create policy "Managers can read own shifts."
  on public.shifts for select
  using (manager_id = auth.uid());

create policy "Managers can insert shifts."
  on public.shifts for insert
  with check (manager_id = auth.uid() and public.get_user_role() = 'manager');

create policy "Managers can update own shifts."
  on public.shifts for update
  using (manager_id = auth.uid() and public.get_user_role() = 'manager');

create policy "Managers can delete own shifts."
  on public.shifts for delete
  using (manager_id = auth.uid() and public.get_user_role() = 'manager');

create policy "Workers can read open shifts."
  on public.shifts for select
  using (status = 'open' and public.get_user_role() = 'worker');

create policy "Workers can read own claims."
  on public.shift_claims for select
  using (worker_id = auth.uid());

create policy "Managers can read claims for their shifts."
  on public.shift_claims for select
  using (
    exists (
      select 1
      from public.shifts s
      where s.id = shift_claims.shift_id
        and s.manager_id = auth.uid()
    )
  );

create policy "Workers can insert claims on open shifts."
  on public.shift_claims for insert
  with check (
    worker_id = auth.uid()
    and public.get_user_role() = 'worker'
    and exists (
      select 1
      from public.shifts s
      where s.id = shift_claims.shift_id
        and s.status = 'open'
    )
  );

create policy "Workers can delete own claims."
  on public.shift_claims for delete
  using (worker_id = auth.uid());

create policy "Managers can delete claims for their shifts."
  on public.shift_claims for delete
  using (
    exists (
      select 1
      from public.shifts s
      where s.id = shift_claims.shift_id
        and s.manager_id = auth.uid()
    )
  );

alter table public.shifts replica identity full;
alter table public.shift_claims replica identity full;

do $$
begin
  if exists (select 1 from pg_publication where pubname = 'supabase_realtime') then
    if not exists (
      select 1
      from pg_publication_tables
      where pubname = 'supabase_realtime'
        and schemaname = 'public'
        and tablename = 'shifts'
    ) then
      alter publication supabase_realtime add table public.shifts;
    end if;

    if not exists (
      select 1
      from pg_publication_tables
      where pubname = 'supabase_realtime'
        and schemaname = 'public'
        and tablename = 'shift_claims'
    ) then
      alter publication supabase_realtime add table public.shift_claims;
    end if;
  end if;
end $$;

-- Seed data (local dev)
insert into auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at
)
values
  (
    (select id from auth.instances limit 1),
    '11111111-1111-1111-1111-111111111111',
    'authenticated',
    'authenticated',
    'manager@shift.local',
    crypt('password123', gen_salt('bf')),
    now(),
    jsonb_build_object('provider', 'email', 'providers', jsonb_build_array('email')),
    jsonb_build_object('role', 'manager', 'skills', jsonb_build_array('scheduling', 'staffing')),
    now(),
    now()
  ),
  (
    (select id from auth.instances limit 1),
    '22222222-2222-2222-2222-222222222222',
    'authenticated',
    'authenticated',
    'worker@shift.local',
    crypt('password123', gen_salt('bf')),
    now(),
    jsonb_build_object('provider', 'email', 'providers', jsonb_build_array('email')),
    jsonb_build_object('role', 'worker', 'skills', jsonb_build_array('forklift', 'heavy lifting')),
    now(),
    now()
  )
on conflict (id) do nothing;

update public.users
set role = 'manager',
    skills = array['scheduling', 'staffing'],
    location = st_setsrid(st_makepoint(-122.4194, 37.7749), 4326)::geography
where email = 'manager@shift.local';

update public.users
set role = 'worker',
    skills = array['forklift', 'heavy lifting'],
    location = st_setsrid(st_makepoint(-122.4010, 37.7925), 4326)::geography
where email = 'worker@shift.local';

insert into public.shifts (
  id,
  manager_id,
  title,
  description,
  required_skills,
  location,
  start_time,
  end_time,
  status
)
values (
  '33333333-3333-3333-3333-333333333333',
  '11111111-1111-1111-1111-111111111111',
  'Event setup crew',
  'Assist with event setup and teardown for a corporate event.',
  array['heavy lifting'],
  st_setsrid(st_makepoint(-122.4089, 37.7833), 4326)::geography,
  now() + interval '2 days',
  now() + interval '2 days' + interval '6 hours',
  'open'
)
on conflict (id) do nothing;

insert into public.shift_claims (
  id,
  shift_id,
  worker_id
)
values (
  '44444444-4444-4444-4444-444444444444',
  '33333333-3333-3333-3333-333333333333',
  '22222222-2222-2222-2222-222222222222'
)
on conflict (id) do nothing;

update public.shifts
set status = 'claimed'
where id = '33333333-3333-3333-3333-333333333333';
