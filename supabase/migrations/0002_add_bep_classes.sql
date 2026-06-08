-- Migration : ajouter les filières BEP1 et retirer la série D
-- À exécuter via le SQL Editor du Dashboard Supabase

-- Mettre à jour la contrainte classe_souhaitee pour inclure BEP1-GC et BEP1-ET
ALTER TABLE public.pre_inscriptions
  DROP CONSTRAINT IF EXISTS pre_inscriptions_classe_souhaitee_check;

ALTER TABLE public.pre_inscriptions
  ADD CONSTRAINT pre_inscriptions_classe_souhaitee_check
  CHECK (classe_souhaitee IN ('6e', '5e', '4e', '3e', '2nde', '1re', 'BEP1-GC', 'BEP1-ET'));

-- Retirer la série D de la contrainte serie
ALTER TABLE public.pre_inscriptions
  DROP CONSTRAINT IF EXISTS pre_inscriptions_serie_check;

ALTER TABLE public.pre_inscriptions
  ADD CONSTRAINT pre_inscriptions_serie_check
  CHECK (serie IN ('A', 'C'));
