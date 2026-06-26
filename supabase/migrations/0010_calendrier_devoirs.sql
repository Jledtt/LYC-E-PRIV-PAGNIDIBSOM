-- Migration : Pagnidibsom — Calendrier des devoirs et compositions
-- ⚠️ À exécuter dans Supabase SQL Editor

-- ============================================================
-- TABLE calendrier_devoirs
-- ============================================================
-- Un devoir ou une composition par ligne. Pas de contrainte UNIQUE :
-- plusieurs matières peuvent avoir un devoir le même jour.
-- Les écritures passent par service_role (actions admin) ; lecture pour
-- tous les utilisateurs authentifiés.

create table if not exists public.calendrier_devoirs (
  id          uuid primary key default gen_random_uuid(),
  classe      text not null
                check (classe in ('6e', '5e', '4e', '3e', '2nde A', '2nde C')),
  date_devoir date not null,
  matiere     text not null,
  heure_debut text,
  heure_fin   text,
  type        text not null default 'devoir'
                check (type in ('devoir', 'composition')),
  created_at  timestamptz not null default now()
);

create index if not exists calendrier_devoirs_classe_date_idx
  on public.calendrier_devoirs (classe, date_devoir);

-- ============================================================
-- RLS
-- ============================================================
alter table public.calendrier_devoirs enable row level security;

-- Lecture pour tous les utilisateurs authentifiés.
drop policy if exists "calendrier_devoirs_authenticated_select" on public.calendrier_devoirs;
create policy "calendrier_devoirs_authenticated_select"
  on public.calendrier_devoirs for select
  to authenticated
  using (true);

-- Aucune policy INSERT/UPDATE/DELETE pour authenticated (cf. 0009 pour la
-- justification).

grant select on public.calendrier_devoirs to authenticated;
