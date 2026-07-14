-- Migration : carte scolaire — photo élève + contact d'urgence.
-- Extension de pre_inscriptions (pas de table élèves actifs séparée dans ce
-- projet : dossier_pieces, paiements, emploi_du_temps référencent tous déjà
-- pre_inscriptions.id comme identité unique de l'élève).

alter table public.pre_inscriptions
  add column if not exists photo_path text,
  add column if not exists contact_urgence_telephone text;

-- ============================================================
-- STORAGE — bucket "photos-eleves"
-- ============================================================
-- Bucket PRIVÉ : photos de mineurs, aucune URL publique. Upload/lecture
-- réservés à l'admin via createAuthClient() (jamais service_role ici, ce
-- n'est pas un flux public) — RLS complète (SELECT/INSERT/UPDATE/DELETE).
insert into storage.buckets (id, name, public)
values ('photos-eleves', 'photos-eleves', false)
on conflict (id) do nothing;

drop policy if exists "photos_eleves_admin_select" on storage.objects;
create policy "photos_eleves_admin_select"
  on storage.objects for select
  to authenticated
  using (bucket_id = 'photos-eleves' and public.is_admin());

drop policy if exists "photos_eleves_admin_insert" on storage.objects;
create policy "photos_eleves_admin_insert"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'photos-eleves' and public.is_admin());

drop policy if exists "photos_eleves_admin_update" on storage.objects;
create policy "photos_eleves_admin_update"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'photos-eleves' and public.is_admin())
  with check (bucket_id = 'photos-eleves' and public.is_admin());

drop policy if exists "photos_eleves_admin_delete" on storage.objects;
create policy "photos_eleves_admin_delete"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'photos-eleves' and public.is_admin());
