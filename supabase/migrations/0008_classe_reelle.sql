-- Migration : Pagnidibsom — Champ classe réelle assignée par l'admin
-- ⚠️ À exécuter dans Supabase SQL Editor

-- Classe effectivement assignée par l'admin (vs classe_souhaitee qui est la
-- demande initiale de la famille). Nullable : NULL = pas encore assignée.
alter table public.pre_inscriptions
  add column if not exists classe_actuelle text
    check (
      classe_actuelle in ('6e', '5e', '4e', '3e', '2nde A', '2nde C')
      or classe_actuelle is null
    );
