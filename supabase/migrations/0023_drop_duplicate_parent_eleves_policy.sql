-- Fix M-6 (AUDIT.md) : parent_eleves_select_admin fait doublon exact de
-- parent_eleves_admin_select (SELECT, authenticated, is_admin()). Cette
-- derniere vient de 0006_parent_auth.sql (trackee) ; parent_eleves_select_admin
-- a ete ajoutee ad hoc hors migration. On supprime le doublon : l'acces admin
-- reste couvert par parent_eleves_admin_select, et parent_eleves_select_own
-- (acces parent a ses propres lignes) est inchangee.

drop policy if exists parent_eleves_select_admin on public.parent_eleves;
