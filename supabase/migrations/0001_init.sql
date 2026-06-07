-- Migration : Kiswensida Phase 1
-- Créer via Supabase SQL Editor

-- ============================================================
-- TABLE pre_inscriptions
-- ============================================================
create table if not exists public.pre_inscriptions (
  id              uuid primary key default gen_random_uuid(),
  created_at      timestamptz not null default now(),

  -- Élève
  eleve_nom             text not null,
  eleve_prenom          text not null,
  eleve_date_naissance  date not null,
  eleve_sexe            text not null check (eleve_sexe in ('M', 'F')),
  classe_souhaitee      text not null check (classe_souhaitee in ('6e', '5e', '4e', '3e', '2nde', '1re')),
  serie                 text check (serie in ('A', 'C', 'D')),
  ecole_precedente      text,

  -- Parent / tuteur
  parent_nom        text not null,
  parent_prenom     text not null,
  parent_telephone  text not null,
  parent_email      text,
  parent_profession text,
  quartier_ville    text not null,

  -- Divers
  message  text,
  statut   text not null default 'nouveau'
);

-- ============================================================
-- TABLE contacts
-- ============================================================
create table if not exists public.contacts (
  id         uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  nom        text not null,
  telephone  text,
  email      text,
  message    text not null,
  statut     text not null default 'nouveau',
  constraint contacts_contact_check check (telephone is not null or email is not null)
);

-- ============================================================
-- RLS — activé, aucune policy publique
-- Les insertions se font via service_role (Server Actions uniquement)
-- ============================================================
alter table public.pre_inscriptions enable row level security;
alter table public.contacts enable row level security;

-- Aucune policy : seule la clé service_role peut lire/écrire.
-- Pour administrer depuis le Dashboard Supabase, connectez-vous
-- avec votre compte (accès service_role implicite).
