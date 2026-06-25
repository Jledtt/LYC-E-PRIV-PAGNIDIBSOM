-- Migration : Pagnidibsom — enrichissement de la fiche de pré-inscription
-- À exécuter via le SQL Editor du Dashboard Supabase
--
-- Toutes les colonnes sont nullable : aucune ligne existante n'est cassée.
-- Aucune donnée sensible (ethnie, religion, état de santé) — uniquement les
-- champs présents sur la fiche d'inscription officielle de l'école.

alter table public.pre_inscriptions
  -- Élève
  add column if not exists eleve_lieu_naissance text,
  add column if not exists eleve_nationalite text,
  add column if not exists classe_redoublee boolean,
  add column if not exists secteur text,

  -- Père (tous facultatifs — cf. contrainte "au moins un parent" en Zod,
  -- pas en base : parent_nom/parent_prenom/parent_telephone existants
  -- restent le contact principal NOT NULL, dérivé du père ou de la mère
  -- selon lequel est renseigné, cf. actions/pre-inscription.ts)
  add column if not exists pere_nom text,
  add column if not exists pere_prenom text,
  add column if not exists pere_profession text,
  add column if not exists pere_telephone text,

  -- Mère / tutrice (tous facultatifs)
  add column if not exists mere_nom text,
  add column if not exists mere_prenom text,
  add column if not exists mere_profession text,
  add column if not exists mere_telephone text;
