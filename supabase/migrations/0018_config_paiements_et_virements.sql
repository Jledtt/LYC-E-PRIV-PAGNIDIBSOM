-- Migration : config_paiements (frais par classe) + paiements (virements
-- bancaires déclaratifs) + bucket Storage preuves-paiement.

-- ============================================================
-- TABLE config_paiements — frais par classe (référentiel classe_souhaitee)
-- ============================================================
create table if not exists public.config_paiements (
  id               uuid primary key default gen_random_uuid(),
  classe           text not null,
  frais_dossier    integer not null default 0,
  frais_scolarite  integer not null default 0,
  annee_scolaire   text not null,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now(),
  unique (classe, annee_scolaire)
);

drop trigger if exists config_paiements_set_updated_at on public.config_paiements;
create trigger config_paiements_set_updated_at
  before update on public.config_paiements
  for each row
  execute function public.set_updated_at();

alter table public.config_paiements enable row level security;

drop policy if exists "config_paiements_public_select" on public.config_paiements;
create policy "config_paiements_public_select"
  on public.config_paiements for select
  to anon, authenticated
  using (true);

drop policy if exists "config_paiements_admin_all" on public.config_paiements;
create policy "config_paiements_admin_all"
  on public.config_paiements for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

grant select on public.config_paiements to anon, authenticated;
grant insert, update, delete on public.config_paiements to authenticated;

-- Une ligne par classe du référentiel classe_souhaitee, année scolaire
-- 2026-2027 (prochaine rentrée). Montants à 0 : à définir dans
-- /admin/config-paiements — AUCUN montant deviné ici.
insert into public.config_paiements (classe, frais_dossier, frais_scolarite, annee_scolaire) values
  ('CP1', 0, 0, '2026-2027'),
  ('CP2', 0, 0, '2026-2027'),
  ('CE1', 0, 0, '2026-2027'),
  ('CE2', 0, 0, '2026-2027'),
  ('CM1', 0, 0, '2026-2027'),
  ('CM2', 0, 0, '2026-2027'),
  ('6e', 0, 0, '2026-2027'),
  ('5e', 0, 0, '2026-2027'),
  ('4e', 0, 0, '2026-2027'),
  ('3e', 0, 0, '2026-2027'),
  ('2nde', 0, 0, '2026-2027'),
  ('1re', 0, 0, '2026-2027'),
  ('BEP1-GC', 0, 0, '2026-2027'),
  ('BEP1-ET', 0, 0, '2026-2027')
on conflict (classe, annee_scolaire) do nothing;

-- ============================================================
-- TABLE paiements — virements bancaires déclaratifs
-- ============================================================
create table if not exists public.paiements (
  id                  uuid primary key default gen_random_uuid(),
  pre_inscription_id  uuid not null references public.pre_inscriptions(id) on delete cascade,
  type_frais          text not null check (type_frais in ('frais_dossier', 'frais_scolarite')),
  montant             integer not null check (montant > 0),
  mode_paiement       text not null default 'virement_bancaire'
                         check (mode_paiement in ('virement_bancaire', 'especes', 'mobile_money')),
  statut              text not null default 'en_attente'
                         check (statut in ('en_attente', 'valide', 'rejete')),
  reference_virement  text,
  preuve_path         text not null,
  commentaire_admin   text,
  valide_par          uuid references public.profiles(id),
  valide_le           timestamptz,
  created_at          timestamptz not null default now()
);

create index if not exists paiements_pre_inscription_id_idx
  on public.paiements (pre_inscription_id);

create index if not exists paiements_statut_idx
  on public.paiements (statut);

alter table public.paiements enable row level security;

-- Admin : accès complet (liste + validation/rejet depuis /admin/paiements).
drop policy if exists "paiements_admin_all" on public.paiements;
create policy "paiements_admin_all"
  on public.paiements for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- Parent (Espace Parent, session réelle) : lecture et déclaration limitées
-- à ses élèves rattachés — même jointure parent_eleves que
-- pre_inscriptions_parent_select / dossier_pieces_parent_select (0006),
-- étendue à l'INSERT puisque createServerClient()/service_role est exclu ici.
drop policy if exists "paiements_parent_select" on public.paiements;
create policy "paiements_parent_select"
  on public.paiements for select
  to authenticated
  using (
    exists (
      select 1 from public.parent_eleves pe
      where pe.pre_inscription_id = paiements.pre_inscription_id
        and pe.parent_id = auth.uid()
    )
  );

drop policy if exists "paiements_parent_insert" on public.paiements;
create policy "paiements_parent_insert"
  on public.paiements for insert
  to authenticated
  with check (
    statut = 'en_attente'
    and exists (
      select 1 from public.parent_eleves pe
      where pe.pre_inscription_id = paiements.pre_inscription_id
        and pe.parent_id = auth.uid()
    )
  );

grant select, insert, update, delete on public.paiements to authenticated;

-- ============================================================
-- STORAGE — bucket "preuves-paiement"
-- ============================================================
insert into storage.buckets (id, name, public)
values ('preuves-paiement', 'preuves-paiement', false)
on conflict (id) do nothing;

drop policy if exists "preuves_paiement_admin_select" on storage.objects;
create policy "preuves_paiement_admin_select"
  on storage.objects for select
  to authenticated
  using (bucket_id = 'preuves-paiement' and public.is_admin());

drop policy if exists "preuves_paiement_parent_select" on storage.objects;
create policy "preuves_paiement_parent_select"
  on storage.objects for select
  to authenticated
  using (
    bucket_id = 'preuves-paiement'
    and exists (
      select 1 from public.parent_eleves pe
      where pe.parent_id = auth.uid()
        and pe.pre_inscription_id::text = (storage.foldername(name))[1]
    )
  );

drop policy if exists "preuves_paiement_parent_insert" on storage.objects;
create policy "preuves_paiement_parent_insert"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'preuves-paiement'
    and exists (
      select 1 from public.parent_eleves pe
      where pe.parent_id = auth.uid()
        and pe.pre_inscription_id::text = (storage.foldername(name))[1]
    )
  );
