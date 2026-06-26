-- Migration : Pagnidibsom — Emploi du temps hebdomadaire
-- ⚠️ À exécuter dans Supabase SQL Editor

-- ============================================================
-- TABLE emploi_du_temps
-- ============================================================
-- Une ligne = une matière dans une cellule (classe × jour × créneau).
-- La contrainte UNIQUE garantit qu'un créneau ne peut accueillir qu'une
-- seule matière. Les écritures passent par service_role (actions admin) ;
-- la lecture est autorisée à tous les utilisateurs authentifiés (parents
-- et admins), ce contenu n'étant pas sensible.

create table if not exists public.emploi_du_temps (
  id         uuid        primary key default gen_random_uuid(),
  classe     text        not null
               check (classe in ('6e', '5e', '4e', '3e', '2nde A', '2nde C')),
  jour       text        not null
               check (jour in ('lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi')),
  creneau    text        not null
               check (creneau in ('7H-8H', '8H-9H', '9H-10H', '10H-11H', '11H-12H',
                                  '15H-16H', '16H-17H', '17H-18H')),
  matiere    text        not null,
  enseignant text,
  salle      text,
  updated_at timestamptz not null default now(),
  unique (classe, jour, creneau)
);

-- Réutilise la fonction set_updated_at() créée dans 0004_articles.sql.
drop trigger if exists emploi_du_temps_set_updated_at on public.emploi_du_temps;
create trigger emploi_du_temps_set_updated_at
  before update on public.emploi_du_temps
  for each row execute function public.set_updated_at();

-- ============================================================
-- RLS
-- ============================================================
alter table public.emploi_du_temps enable row level security;

-- Lecture pour tous les utilisateurs authentifiés (parents inclus).
-- Pas de SELECT pour anon : l'emploi du temps n'est pas public.
drop policy if exists "emploi_du_temps_authenticated_select" on public.emploi_du_temps;
create policy "emploi_du_temps_authenticated_select"
  on public.emploi_du_temps for select
  to authenticated
  using (true);

-- Aucune policy INSERT/UPDATE/DELETE pour authenticated :
-- les écritures passent exclusivement par le client service_role dans
-- les Server Actions admin (défense en profondeur + vérification du rôle
-- dans l'action elle-même).

grant select on public.emploi_du_temps to authenticated;
