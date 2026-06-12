-- Migration : Pagnidibsom Phase 2 / Brique 2 — Blog / Actualités
-- À exécuter via le SQL Editor du Dashboard Supabase

-- ============================================================
-- TABLE articles
-- ============================================================
create table if not exists public.articles (
  id               uuid primary key default gen_random_uuid(),
  slug             text not null unique,
  title            text not null,
  excerpt          text,
  content          text not null,
  cover_image_url  text,
  status           text not null default 'draft' check (status in ('draft', 'published')),
  published_at     timestamptz,
  author_id        uuid references auth.users(id) on delete set null,
  -- Dénormalisé depuis profiles.display_name au moment de la sauvegarde :
  -- évite d'exposer profiles aux lecteurs anonymes pour la signature
  -- publique de l'article.
  author_display_name text,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

-- Index pour la liste publique (articles publiés, du plus récent au plus
-- ancien). L'unicité de "slug" crée déjà son propre index, inutile d'en
-- ajouter un autre.
create index if not exists articles_status_published_at_idx
  on public.articles (status, published_at desc);

-- ============================================================
-- TRIGGER updated_at
-- ============================================================
-- Choix : trigger SQL (plutôt qu'une mise à jour manuelle dans chaque
-- Server Action) pour garantir la cohérence même en cas d'écriture directe
-- depuis le Dashboard Supabase.
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists articles_set_updated_at on public.articles;
create trigger articles_set_updated_at
  before update on public.articles
  for each row
  execute function public.set_updated_at();

-- ============================================================
-- RLS — articles
-- ============================================================
alter table public.articles enable row level security;

-- Lecture publique : uniquement les articles publiés (visiteurs anonymes
-- et utilisateurs connectés sans privilège particulier).
drop policy if exists "articles_public_select" on public.articles;
create policy "articles_public_select"
  on public.articles for select
  to anon, authenticated
  using (status = 'published');

-- Lecture complète pour les admins (liste back-office, y compris brouillons).
drop policy if exists "articles_admin_select" on public.articles;
create policy "articles_admin_select"
  on public.articles for select
  to authenticated
  using (public.is_admin());

-- Création, édition et suppression réservées aux admins.
drop policy if exists "articles_admin_insert" on public.articles;
create policy "articles_admin_insert"
  on public.articles for insert
  to authenticated
  with check (public.is_admin());

drop policy if exists "articles_admin_update" on public.articles;
create policy "articles_admin_update"
  on public.articles for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "articles_admin_delete" on public.articles;
create policy "articles_admin_delete"
  on public.articles for delete
  to authenticated
  using (public.is_admin());

grant select on public.articles to anon;
grant select, insert, update, delete on public.articles to authenticated;

-- ============================================================
-- STORAGE — bucket "article-images"
-- ============================================================
-- Bucket public : les images de couverture sont servies via leur URL
-- publique (pas de signed URL). L'écriture reste réservée aux admins via
-- les policies storage.objects ci-dessous.
insert into storage.buckets (id, name, public)
values ('article-images', 'article-images', true)
on conflict (id) do nothing;

-- Lecture publique des fichiers du bucket "article-images".
-- Remarque : pour un bucket marqué "public", l'endpoint
-- /storage/v1/object/public/... sert déjà les fichiers sans vérifier ces
-- policies. On l'ajoute malgré tout pour couvrir les accès via le client
-- Supabase (list/download) et pour rester cohérent avec le modèle de
-- policies des autres tables.
drop policy if exists "article_images_public_select" on storage.objects;
create policy "article_images_public_select"
  on storage.objects for select
  to anon, authenticated
  using (bucket_id = 'article-images');

-- Écriture (upload, remplacement, suppression) réservée aux admins.
drop policy if exists "article_images_admin_insert" on storage.objects;
create policy "article_images_admin_insert"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'article-images' and public.is_admin());

drop policy if exists "article_images_admin_update" on storage.objects;
create policy "article_images_admin_update"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'article-images' and public.is_admin())
  with check (bucket_id = 'article-images' and public.is_admin());

drop policy if exists "article_images_admin_delete" on storage.objects;
create policy "article_images_admin_delete"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'article-images' and public.is_admin());
