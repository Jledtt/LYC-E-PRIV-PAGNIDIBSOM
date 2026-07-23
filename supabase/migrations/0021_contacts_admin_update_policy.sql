-- Fix C-2 (AUDIT.md) : updateContactStatut() était un no-op silencieux.
-- La table contacts n'avait qu'une policy SELECT (contacts_admin_select) :
-- l'UPDATE via createAuthClient() (RLS) matchait 0 ligne sans erreur.
--
-- NB : déjà appliquée en production le 2026-07-23 via MCP (migration remote
-- "contacts_admin_update_policy") — ce fichier est la trace locale.

create policy contacts_admin_update on public.contacts
  for update to authenticated
  using (is_admin())
  with check (is_admin());
