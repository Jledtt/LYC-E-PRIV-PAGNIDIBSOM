-- Migration : Pagnidibsom — Policies d'écriture admin pour calendrier_devoirs
-- ⚠️ À exécuter dans Supabase SQL Editor

-- ============================================================
-- RLS — corrige le contournement service_role documenté dans 0010
-- ============================================================
-- Même correctif que 0011_emploi_du_temps_admin_write_policies.sql, pour la
-- table calendrier_devoirs.

create policy calendrier_devoirs_admin_insert
  on public.calendrier_devoirs
  for insert
  to authenticated
  with check (is_admin());

create policy calendrier_devoirs_admin_update
  on public.calendrier_devoirs
  for update
  to authenticated
  using (is_admin())
  with check (is_admin());

create policy calendrier_devoirs_admin_delete
  on public.calendrier_devoirs
  for delete
  to authenticated
  using (is_admin());
