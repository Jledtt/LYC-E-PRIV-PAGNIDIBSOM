-- Migration : Pagnidibsom Phase 2 / Brique 3a — Dossier d'inscription (fondations)
-- À exécuter via le SQL Editor du Dashboard Supabase

-- ============================================================
-- ALTER pre_inscriptions — token d'accès au dossier
-- ============================================================
-- Le parent accède à /mon-dossier/{token} sans session Supabase. Le token
-- (crypto.randomBytes(32).toString("base64url"), ~43 caractères) est la
-- seule barrière côté parent, validée en application (cf. brique 3b).
alter table public.pre_inscriptions
  add column if not exists dossier_token text,
  add column if not exists dossier_token_expires_at timestamptz;

-- Contrainte unique sur dossier_token : Postgres crée implicitement un
-- index unique (pre_inscriptions_dossier_token_key) pour la faire
-- respecter — inutile d'ajouter un index séparé. Bloc idempotent car
-- "ADD COLUMN IF NOT EXISTS ... UNIQUE" ne réappliquerait pas la contrainte
-- si seule la colonne existait déjà sans elle.
do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'pre_inscriptions_dossier_token_key'
  ) then
    alter table public.pre_inscriptions
      add constraint pre_inscriptions_dossier_token_key unique (dossier_token);
  end if;
end $$;

-- ============================================================
-- TRIGGER updated_at — réutilisé depuis 0004_articles.sql
-- ============================================================
-- Redéclaration idempotente (create or replace) : la fonction existe déjà
-- depuis la brique blog, mais on la (re)définit ici pour que cette
-- migration reste autonome si exécutée seule sur un schéma partiel.
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ============================================================
-- TABLE piece_types — référentiel des pièces du dossier
-- ============================================================
-- Référentiel non sensible, identique pour 6e à 1re et BEP1-GC/BEP1-ET
-- (confirmé client) : pas de filtrage par classe pour cette brique.
create table if not exists public.piece_types (
  code           text primary key,
  label          text not null,
  description    text,
  depot_en_ligne boolean not null default true,
  ordre          int not null default 0
);

alter table public.piece_types enable row level security;

-- Lecture publique : le référentiel doit être affichable sur
-- /mon-dossier/{token} (sans session) et dans le back-office.
drop policy if exists "piece_types_public_select" on public.piece_types;
create policy "piece_types_public_select"
  on public.piece_types for select
  to anon, authenticated
  using (true);

grant select on public.piece_types to anon, authenticated;

insert into public.piece_types (code, label, description, depot_en_ligne, ordre) values
  ('demande_proviseur', 'Demande d''inscription', 'Demande adressée au Proviseur', true, 1),
  ('fiche_inscription_engagement', 'Fiche d''inscription et d''engagement', 'Formulaire délivré par l''établissement, à signer sur place', false, 2),
  ('acte_naissance', 'Acte ou extrait de naissance', 'Copie légalisée', true, 3),
  ('diplome_releve_notes', 'Diplôme et relevé de notes', 'Copie légalisée du diplôme (CEP pour l''entrée en 6e, BEPC/CAP pour les autres classes) et relevé de notes correspondant', true, 4),
  ('bulletins_annee_ecoulee', 'Bulletins de l''année écoulée', 'Copies des bulletins ; les originaux seront à apporter à l''établissement', true, 5),
  ('chemise_cartonnee', 'Chemise cartonnée', 'Portant le nom de l''élève et la classe — à apporter à l''établissement', false, 6)
on conflict (code) do nothing;

-- ============================================================
-- TABLE dossier_pieces — suivi par dossier
-- ============================================================
-- NOTE : pre_inscriptions.id est de type uuid (cf. 0001_init.sql), pas
-- bigint. La colonne ci-dessous référence donc public.pre_inscriptions(id)
-- en uuid.
create table if not exists public.dossier_pieces (
  id                  uuid primary key default gen_random_uuid(),
  pre_inscription_id uuid not null references public.pre_inscriptions(id) on delete cascade,
  piece_code          text not null references public.piece_types(code),
  statut              text not null default 'attendu' check (statut in ('attendu', 'recu', 'valide', 'a_refaire')),
  motif_refus         text,
  fichier_path        text,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now(),
  unique (pre_inscription_id, piece_code)
);

create index if not exists dossier_pieces_pre_inscription_id_idx
  on public.dossier_pieces (pre_inscription_id);

drop trigger if exists dossier_pieces_set_updated_at on public.dossier_pieces;
create trigger dossier_pieces_set_updated_at
  before update on public.dossier_pieces
  for each row
  execute function public.set_updated_at();

alter table public.dossier_pieces enable row level security;

-- AUCUNE policy anon/authenticated : le parent (sans session) accède à son
-- dossier via des Server Actions service_role qui valident le token +
-- l'expiration AVANT toute opération (cf. brique 3b), exactement comme un
-- lien de réinitialisation de mot de passe. Seuls les admins lisent/écrivent
-- via RLS.
drop policy if exists "dossier_pieces_admin_select" on public.dossier_pieces;
create policy "dossier_pieces_admin_select"
  on public.dossier_pieces for select
  to authenticated
  using (public.is_admin());

drop policy if exists "dossier_pieces_admin_update" on public.dossier_pieces;
create policy "dossier_pieces_admin_update"
  on public.dossier_pieces for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

grant select, update on public.dossier_pieces to authenticated;

-- ============================================================
-- STORAGE — bucket "dossier-pieces"
-- ============================================================
-- Bucket PRIVÉ : aucune URL publique. Documents de mineurs.
insert into storage.buckets (id, name, public)
values ('dossier-pieces', 'dossier-pieces', false)
on conflict (id) do nothing;

-- Lecture et suppression réservées aux admins.
drop policy if exists "dossier_pieces_storage_admin_select" on storage.objects;
create policy "dossier_pieces_storage_admin_select"
  on storage.objects for select
  to authenticated
  using (bucket_id = 'dossier-pieces' and public.is_admin());

drop policy if exists "dossier_pieces_storage_admin_delete" on storage.objects;
create policy "dossier_pieces_storage_admin_delete"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'dossier-pieces' and public.is_admin());

-- Aucune policy anon/authenticated pour l'upload (insert) : les dépôts de
-- pièces par les parents (brique 3b) se font via service_role, qui bypass
-- RLS — cohérent avec l'absence de session côté parent.
