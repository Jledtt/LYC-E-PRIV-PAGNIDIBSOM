-- Migration : Pagnidibsom — enrichissement v2 de la fiche de pré-inscription
-- (identité complémentaire, coordonnées parents, observations santé)
--
-- Toutes les colonnes sont nullable ou avec default : aucune ligne
-- existante n'est cassée. Ethnie/religion/santé sont des données
-- sensibles collectées uniquement à des fins médicales d'urgence
-- (cf. lib/schemas.ts et lib/pdf/PreInscriptionPDF.tsx).

alter table public.pre_inscriptions
  add column if not exists eleve_ethnie text,
  add column if not exists eleve_religion text,
  add column if not exists eleve_telephone_domicile text,
  add column if not exists pere_service text,
  add column if not exists pere_email text,
  add column if not exists mere_service text,
  add column if not exists mere_email text,
  add column if not exists sante_asthme boolean not null default false,
  add column if not exists sante_cardiopathie boolean not null default false,
  add column if not exists sante_diabete boolean not null default false,
  add column if not exists sante_drepanocytose boolean not null default false,
  add column if not exists sante_hta boolean not null default false,
  add column if not exists sante_epilepsie boolean not null default false,
  add column if not exists aptitude_sport boolean;
