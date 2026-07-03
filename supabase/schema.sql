-- =====================================================================
-- Orbit Client Portal — Supabase schema, security & realtime
-- Run this once in your Supabase project: SQL Editor → paste → Run.
-- Safe to re-run (idempotent).
-- =====================================================================

-- ---------- Extensions ----------
create extension if not exists pgcrypto;

-- ---------- Tables ----------

-- One row per authenticated user; holds their role.
create table if not exists public.profiles (
  id         uuid primary key references auth.users(id) on delete cascade,
  email      text not null,
  role       text not null default 'client' check (role in ('client','admin')),
  created_at timestamptz not null default now()
);

-- Emails that should become ADMINS the moment they sign in.
-- Add your + your team's emails here (see the INSERT near the bottom).
create table if not exists public.admin_allowlist (
  email text primary key
);

-- One portal per client user.
create table if not exists public.clients (
  id         uuid primary key default gen_random_uuid(),
  owner_id   uuid not null references auth.users(id) on delete cascade,
  company    text,
  contact    text,
  email      text,
  industry   text,
  service    text,
  created_at timestamptz not null default now()
);
create index if not exists clients_owner_idx on public.clients(owner_id);

-- Four phases per client.
create table if not exists public.phases (
  id           uuid primary key default gen_random_uuid(),
  client_id    uuid not null references public.clients(id) on delete cascade,
  phase_number int  not null check (phase_number between 1 and 4),
  status       text not null default 'locked' check (status in ('locked','open','submitted','approved')),
  data         jsonb not null default '{}'::jsonb,
  updated_at   timestamptz not null default now(),
  unique (client_id, phase_number)
);
create index if not exists phases_client_idx on public.phases(client_id);

-- Admin activity feed.
create table if not exists public.activity (
  id         uuid primary key default gen_random_uuid(),
  client_id  uuid references public.clients(id) on delete cascade,
  text       text not null,
  kind       text not null check (kind in ('submit','approve')),
  created_at timestamptz not null default now()
);

-- Client "your next phase is open" banners.
create table if not exists public.notifications (
  id         uuid primary key default gen_random_uuid(),
  client_id  uuid not null references public.clients(id) on delete cascade,
  phase      int  not null,
  read       boolean not null default false,
  created_at timestamptz not null default now()
);

-- ---------- Helper: am I an admin? (SECURITY DEFINER avoids RLS recursion) ----------
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (select 1 from public.profiles where id = auth.uid() and role = 'admin');
$$;

-- ---------- Phase metadata used when logging activity ----------
create or replace function public.phase_short(n int)
returns text language sql immutable as $$
  select case n when 1 then 'Get Started' when 2 then 'Vision & Style'
                when 3 then 'Agreement' when 4 then 'Thank You' else 'Phase' end;
$$;

-- ---------- Trigger: provision a new user on signup ----------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_role      text;
  v_client_id uuid;
begin
  v_role := case
    when exists (select 1 from public.admin_allowlist a where lower(a.email) = lower(new.email))
    then 'admin' else 'client' end;

  insert into public.profiles (id, email, role)
  values (new.id, new.email, v_role)
  on conflict (id) do nothing;

  if v_role = 'client' then
    insert into public.clients (owner_id, email)
    values (new.id, new.email)
    returning id into v_client_id;

    insert into public.phases (client_id, phase_number, status) values
      (v_client_id, 1, 'open'),
      (v_client_id, 2, 'locked'),
      (v_client_id, 3, 'locked'),
      (v_client_id, 4, 'locked');
  end if;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------- Row Level Security ----------
alter table public.profiles        enable row level security;
alter table public.clients         enable row level security;
alter table public.phases          enable row level security;
alter table public.activity        enable row level security;
alter table public.notifications   enable row level security;
alter table public.admin_allowlist enable row level security;  -- no policies: locked to service role only

-- profiles: you can read your own; admins read all
drop policy if exists profiles_read on public.profiles;
create policy profiles_read on public.profiles
  for select using (id = auth.uid() or public.is_admin());

-- clients: owner reads their own; admins read all
drop policy if exists clients_read on public.clients;
create policy clients_read on public.clients
  for select using (owner_id = auth.uid() or public.is_admin());

-- phases: readable if you own the parent client, or you're an admin
drop policy if exists phases_read on public.phases;
create policy phases_read on public.phases
  for select using (
    public.is_admin() or exists (
      select 1 from public.clients c where c.id = phases.client_id and c.owner_id = auth.uid()
    )
  );

-- activity: admins only
drop policy if exists activity_read on public.activity;
create policy activity_read on public.activity
  for select using (public.is_admin());

-- notifications: the owning client, or admins
drop policy if exists notifications_read on public.notifications;
create policy notifications_read on public.notifications
  for select using (
    public.is_admin() or exists (
      select 1 from public.clients c where c.id = notifications.client_id and c.owner_id = auth.uid()
    )
  );

-- NOTE: there are intentionally NO insert/update/delete policies.
-- All writes go through the SECURITY DEFINER functions below, which enforce
-- the business rules. This makes it impossible for a client to (e.g.) approve
-- their own phase, unlock a phase, or edit someone else's data.

-- ---------- Write API (SECURITY DEFINER, rules enforced inside) ----------

-- Client submits their currently-open phase.
create or replace function public.submit_phase(p_phase int, p_data jsonb)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_client public.clients;
begin
  select * into v_client from public.clients where owner_id = auth.uid() limit 1;
  if v_client.id is null then raise exception 'No client portal for this user'; end if;

  -- may only submit a phase that is currently OPEN
  if not exists (
    select 1 from public.phases
    where client_id = v_client.id and phase_number = p_phase and status = 'open'
  ) then
    raise exception 'Phase % is not open for submission', p_phase;
  end if;

  update public.phases
    set status = 'submitted', data = coalesce(p_data, '{}'::jsonb), updated_at = now()
    where client_id = v_client.id and phase_number = p_phase;

  -- keep the client card fresh from phase-1 answers
  if p_phase = 1 then
    update public.clients set
      company = coalesce(nullif(p_data->>'Company or brand',''), company),
      contact = coalesce(nullif(p_data->>'Your name',''), contact),
      email   = coalesce(nullif(p_data->>'Email',''), email),
      service = coalesce(nullif(p_data->>'What can we help you build?',''), service)
    where id = v_client.id;
  end if;

  insert into public.activity (client_id, text, kind)
  values (v_client.id,
          coalesce(v_client.company, v_client.email, 'A client') || ' submitted Phase ' || p_phase || ' — ' || public.phase_short(p_phase),
          'submit');
end;
$$;

-- Admin approves a submitted phase (opens the next one + notifies the client).
create or replace function public.approve_phase(p_client_id uuid, p_phase int)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_company text;
begin
  if not public.is_admin() then raise exception 'Admins only'; end if;

  update public.phases set status = 'approved', updated_at = now()
    where client_id = p_client_id and phase_number = p_phase and status = 'submitted';
  if not found then raise exception 'Phase % is not awaiting approval', p_phase; end if;

  if p_phase < 4 then
    update public.phases set status = 'open', updated_at = now()
      where client_id = p_client_id and phase_number = p_phase + 1 and status = 'locked';
    insert into public.notifications (client_id, phase) values (p_client_id, p_phase + 1);
  end if;

  select company into v_company from public.clients where id = p_client_id;
  insert into public.activity (client_id, text, kind)
  values (p_client_id,
          'You approved ' || coalesce(v_company,'a client') || ' Phase ' || p_phase || ' — ' || public.phase_short(p_phase),
          'approve');
end;
$$;

-- Admin locks / unlocks a phase (only toggles locked <-> open).
create or replace function public.toggle_lock(p_client_id uuid, p_phase int)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_admin() then raise exception 'Admins only'; end if;
  update public.phases
    set status = case status when 'locked' then 'open' when 'open' then 'locked' else status end,
        updated_at = now()
    where client_id = p_client_id and phase_number = p_phase and status in ('locked','open');
end;
$$;

-- Client dismisses their open-phase banners.
create or replace function public.mark_notifications_read()
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.notifications n
    set read = true
    from public.clients c
    where n.client_id = c.id and c.owner_id = auth.uid() and n.read = false;
end;
$$;

-- ---------- Realtime ----------
alter publication supabase_realtime add table public.clients;
alter publication supabase_realtime add table public.phases;
alter publication supabase_realtime add table public.activity;
alter publication supabase_realtime add table public.notifications;

-- =====================================================================
-- FINAL STEP — make yourself (and your team) an admin.
-- Replace the emails below, then this block also upgrades anyone who
-- already signed in before being added to the allowlist.
-- =====================================================================
insert into public.admin_allowlist (email) values
  ('hello.theorbit@gmail.com'),
  ('info@orbitpk.com')
  -- , ('teammate@example.com')
on conflict (email) do nothing;

update public.profiles p
  set role = 'admin'
  from public.admin_allowlist a
  where lower(p.email) = lower(a.email) and p.role <> 'admin';
