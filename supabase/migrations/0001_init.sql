-- ============================================================
-- YelenPay — Schéma initial (tontines digitales du Sénégal)
-- À exécuter dans l'éditeur SQL de Supabase, ou via `supabase db push`.
-- ============================================================

-- ── Profils ────────────────────────────────────────────────
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text,
  phone text,
  created_at timestamptz not null default now()
);

-- Crée automatiquement un profil à l'inscription.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, phone)
  values (
    new.id,
    new.raw_user_meta_data ->> 'full_name',
    new.raw_user_meta_data ->> 'phone'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ── Tontines ───────────────────────────────────────────────
create table if not exists public.tontines (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  amount integer not null check (amount > 0),     -- montant par cotisation (XOF)
  frequency text not null default 'monthly',
  max_members integer not null check (max_members between 2 and 100),
  status text not null default 'active',
  current_round integer not null default 1,
  created_by uuid not null references auth.users (id) on delete cascade,
  created_at timestamptz not null default now()
);

-- ── Membres d'une tontine ──────────────────────────────────
create table if not exists public.tontine_members (
  id uuid primary key default gen_random_uuid(),
  tontine_id uuid not null references public.tontines (id) on delete cascade,
  user_id uuid references auth.users (id) on delete set null,
  name text not null,
  phone text,
  position integer not null,                       -- ordre de rotation (1..N)
  created_at timestamptz not null default now(),
  unique (tontine_id, position)
);

-- ── Cotisations ────────────────────────────────────────────
create table if not exists public.contributions (
  id uuid primary key default gen_random_uuid(),
  tontine_id uuid not null references public.tontines (id) on delete cascade,
  round integer not null,
  member_id uuid not null references public.tontine_members (id) on delete cascade,
  amount integer not null check (amount > 0),
  status text not null default 'pending',          -- pending | paid
  payment_token text,                               -- token PayDunya
  paid_at timestamptz,
  created_at timestamptz not null default now(),
  unique (tontine_id, round, member_id)
);

create index if not exists idx_members_tontine on public.tontine_members (tontine_id);
create index if not exists idx_contributions_tontine on public.contributions (tontine_id);
create index if not exists idx_contributions_token on public.contributions (payment_token);

-- ── Fonctions d'accès (SECURITY DEFINER → évite la récursion RLS) ──
create or replace function public.is_tontine_owner(t_id uuid)
returns boolean
language sql
security definer set search_path = public
stable
as $$
  select exists (
    select 1 from public.tontines
    where id = t_id and created_by = auth.uid()
  );
$$;

create or replace function public.can_access_tontine(t_id uuid)
returns boolean
language sql
security definer set search_path = public
stable
as $$
  select exists (
    select 1 from public.tontines where id = t_id and created_by = auth.uid()
  ) or exists (
    select 1 from public.tontine_members
    where tontine_id = t_id and user_id = auth.uid()
  );
$$;

-- ── RLS ────────────────────────────────────────────────────
alter table public.profiles enable row level security;
alter table public.tontines enable row level security;
alter table public.tontine_members enable row level security;
alter table public.contributions enable row level security;

-- profiles
drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own" on public.profiles
  for select using (id = auth.uid());
drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own" on public.profiles
  for update using (id = auth.uid());

-- tontines
drop policy if exists "tontines_select" on public.tontines;
create policy "tontines_select" on public.tontines
  for select using (can_access_tontine(id));
drop policy if exists "tontines_insert" on public.tontines;
create policy "tontines_insert" on public.tontines
  for insert with check (created_by = auth.uid());
drop policy if exists "tontines_update" on public.tontines;
create policy "tontines_update" on public.tontines
  for update using (created_by = auth.uid());
drop policy if exists "tontines_delete" on public.tontines;
create policy "tontines_delete" on public.tontines
  for delete using (created_by = auth.uid());

-- tontine_members
drop policy if exists "members_select" on public.tontine_members;
create policy "members_select" on public.tontine_members
  for select using (can_access_tontine(tontine_id));
drop policy if exists "members_write" on public.tontine_members;
create policy "members_write" on public.tontine_members
  for all using (is_tontine_owner(tontine_id))
  with check (is_tontine_owner(tontine_id));

-- contributions
drop policy if exists "contributions_select" on public.contributions;
create policy "contributions_select" on public.contributions
  for select using (can_access_tontine(tontine_id));
drop policy if exists "contributions_write" on public.contributions;
create policy "contributions_write" on public.contributions
  for all using (is_tontine_owner(tontine_id))
  with check (is_tontine_owner(tontine_id));
-- NB : la confirmation de paiement (webhook) utilise la clé service_role,
-- qui contourne la RLS.
