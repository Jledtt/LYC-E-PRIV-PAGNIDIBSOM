-- Migration : Pagnidibsom — Retrait de la pièce "Chemise cartonnée"
-- ⚠️ À exécuter dans Supabase SQL Editor

-- Aucun dossier_pieces ne référence chemise_cartonnee au moment de cette
-- migration (depot_en_ligne = false, jamais inséré par
-- actions/pre-inscription.ts qui ne crée que les lignes depot_en_ligne =
-- true). Suppression sans impact sur les dossiers existants.

delete from public.piece_types where code = 'chemise_cartonnee';
