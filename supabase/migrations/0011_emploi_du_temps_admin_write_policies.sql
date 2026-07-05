-- Migration : Pagnidibsom — Policies d'écriture admin pour emploi_du_temps
-- ⚠️ À exécuter dans Supabase SQL Editor

-- ============================================================
-- RLS — corrige le contournement service_role documenté dans 0009
-- ============================================================
-- 0009 ne définissait aucune policy INSERT/UPDATE/DELETE et reposait sur le
-- client service_role dans les Server Actions admin (bypass RLS). Cela
-- contredisait la convention du projet (createAuthClient() pour tout le
-- back-office /admin, cf. lib/supabase/server.ts). On ajoute ici les
-- policies d'écriture réservées aux admins, sur le modèle déjà en place
-- pour la table articles (0004_articles.sql).

create policy emploi_du_temps_admin_insert
  on public.emploi_du_temps
  for insert
  to authenticated
  with check (is_admin());

create policy emploi_du_temps_admin_update
  on public.emploi_du_temps
  for update
  to authenticated
  using (is_admin())
  with check (is_admin());

create policy emploi_du_temps_admin_delete
  on public.emploi_du_temps
  for delete
  to authenticated
  using (is_admin());
