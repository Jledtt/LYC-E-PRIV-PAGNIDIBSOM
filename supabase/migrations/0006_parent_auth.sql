-- Migration : Pagnidibsom Phase 2 / Brique 4 — Authentification parent
-- À exécuter via le SQL Editor du Dashboard Supabase

-- ============================================================
-- ALTER profiles — autoriser le rôle 'parent'
-- ============================================================
-- La contrainte inline de 0003_admin_auth.sql ("role in ('admin')") prend le
-- nom par défaut Postgres profiles_role_check, faute de nom explicite.
alter table public.profiles drop constraint if exists profiles_role_check;
alter table public.profiles add constraint profiles_role_check check (role in ('admin', 'parent'));

-- ============================================================
-- FONCTION HELPER public.is_parent()
-- ============================================================
-- Sur le modèle de public.is_admin() (0003_admin_auth.sql).
create or replace function public.is_parent()
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles
    where id = auth.uid()
      and role = 'parent'
  );
$$;

-- ============================================================
-- TABLE parent_eleves — rattachement parent <-> dossier
-- ============================================================
-- Un parent rattache un ou plusieurs élèves (pre_inscriptions) à son compte
-- via le dossier_token reçu par WhatsApp (cf. actions/parent-auth.ts ->
-- rattacherEleve). Toutes les insertions passent par le client service_role :
-- aucune policy INSERT/UPDATE/DELETE pour authenticated, lecture seule.
create table if not exists public.parent_eleves (
  id                 uuid primary key default gen_random_uuid(),
  parent_id          uuid not null references public.profiles(id) on delete cascade,
  pre_inscription_id uuid not null references public.pre_inscriptions(id) on delete cascade,
  created_at         timestamptz not null default now(),
  unique (parent_id, pre_inscription_id)
);

create index if not exists parent_eleves_parent_id_idx
  on public.parent_eleves (parent_id);

alter table public.parent_eleves enable row level security;

-- Un parent voit ses propres rattachements ; un admin les voit tous
-- (back-office, support).
drop policy if exists "parent_eleves_select_own" on public.parent_eleves;
create policy "parent_eleves_select_own"
  on public.parent_eleves for select
  to authenticated
  using (parent_id = auth.uid());

drop policy if exists "parent_eleves_admin_select" on public.parent_eleves;
create policy "parent_eleves_admin_select"
  on public.parent_eleves for select
  to authenticated
  using (public.is_admin());

grant select on public.parent_eleves to authenticated;

-- ============================================================
-- POLICIES PARENT — pre_inscriptions
-- ============================================================
-- Lecture limitée aux dossiers rattachés au parent connecté. Pas
-- d'UPDATE/DELETE pour le parent : seul le back-office modifie le statut
-- d'une pré-inscription (cf. policies admin de 0003_admin_auth.sql).
drop policy if exists "pre_inscriptions_parent_select" on public.pre_inscriptions;
create policy "pre_inscriptions_parent_select"
  on public.pre_inscriptions for select
  to authenticated
  using (
    exists (
      select 1
      from public.parent_eleves pe
      where pe.pre_inscription_id = pre_inscriptions.id
        and pe.parent_id = auth.uid()
    )
  );

-- ============================================================
-- POLICIES PARENT — dossier_pieces
-- ============================================================
-- Lecture seule des pièces des dossiers rattachés ; aucun
-- INSERT/UPDATE/DELETE pour le parent (le dépôt de pièces reste sur
-- /mon-dossier/{token}, qui passe par service_role, cf. 0005).
drop policy if exists "dossier_pieces_parent_select" on public.dossier_pieces;
create policy "dossier_pieces_parent_select"
  on public.dossier_pieces for select
  to authenticated
  using (
    exists (
      select 1
      from public.parent_eleves pe
      where pe.pre_inscription_id = dossier_pieces.pre_inscription_id
        and pe.parent_id = auth.uid()
    )
  );
