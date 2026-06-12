-- Migration : Pagnidibsom Phase 2 / Brique 1 — Authentification admin
-- À exécuter via le SQL Editor du Dashboard Supabase

-- ============================================================
-- TABLE profiles
-- ============================================================
-- Un profil = un compte du back-office. Créé à la main (pas d'inscription
-- publique) : Authentication > Add user, puis INSERT manuel ici.
-- Seul le rôle 'admin' est autorisé pour l'instant. Le rôle 'parent'
-- (espace parent, brique ultérieure) sera ajouté plus tard à la contrainte
-- CHECK ci-dessous.
create table if not exists public.profiles (
  id           uuid primary key references auth.users(id) on delete cascade,
  role         text not null default 'admin' check (role in ('admin')),
  display_name text,
  created_at   timestamptz not null default now()
);

alter table public.profiles enable row level security;

-- Un utilisateur authentifié peut lire son propre profil.
-- Aucune policy INSERT/UPDATE/DELETE publique : la création des profils
-- se fait à la main (dashboard) ou via service_role.
drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own"
  on public.profiles for select
  to authenticated
  using (auth.uid() = id);

grant select on public.profiles to authenticated;

-- ============================================================
-- FONCTION HELPER public.is_admin()
-- ============================================================
-- SECURITY DEFINER : peut lire profiles même si l'appelant n'a accès qu'à
-- son propre profil via RLS. Utilisée par les policies ci-dessous et par
-- les briques futures.
create or replace function public.is_admin()
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles
    where id = auth.uid()
      and role = 'admin'
  );
$$;

-- ============================================================
-- POLICIES ADMIN — pre_inscriptions
-- ============================================================
-- Lecture complète pour les admins (tableau de bord, liste).
drop policy if exists "pre_inscriptions_admin_select" on public.pre_inscriptions;
create policy "pre_inscriptions_admin_select"
  on public.pre_inscriptions for select
  to authenticated
  using (public.is_admin());

-- Mise à jour pour les admins (changement de statut depuis le back-office).
-- RLS ne permet pas de restreindre une policy à une seule colonne ; les
-- comptes admin sont créés à la main (1 à 3 personnes de confiance) et
-- l'interface /admin n'expose que le champ statut.
drop policy if exists "pre_inscriptions_admin_update" on public.pre_inscriptions;
create policy "pre_inscriptions_admin_update"
  on public.pre_inscriptions for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

grant select, update on public.pre_inscriptions to authenticated;

-- ============================================================
-- POLICIES ADMIN — contacts
-- ============================================================
-- Lecture seule pour les admins (pas d'UPDATE/DELETE demandé pour cette brique).
drop policy if exists "contacts_admin_select" on public.contacts;
create policy "contacts_admin_select"
  on public.contacts for select
  to authenticated
  using (public.is_admin());

grant select on public.contacts to authenticated;
