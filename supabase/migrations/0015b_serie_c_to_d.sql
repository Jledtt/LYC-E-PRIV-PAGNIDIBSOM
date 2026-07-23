-- Migration : remplacer la série C par la série D dans la contrainte serie
-- À exécuter via le SQL Editor du Dashboard Supabase (ou mcp__supabase__apply_migration)
-- Vérifié le 2026-07-12 : aucun enregistrement existant n'a serie = 'C' (0 ligne concernée sur 5 dossiers).

ALTER TABLE public.pre_inscriptions
  DROP CONSTRAINT IF EXISTS pre_inscriptions_serie_check;

ALTER TABLE public.pre_inscriptions
  ADD CONSTRAINT pre_inscriptions_serie_check
  CHECK (serie IN ('A', 'D'));
