-- Migration : ouverture du cycle Primaire (CP1 à CM2) + correction "2nde C" -> "2nde D"
-- (le renommage de série C->D précédent n'avait touché que la colonne "serie",
-- pas les valeurs composites "2nde A"/"2nde C" de classe_actuelle/emploi_du_temps/calendrier_devoirs)
-- Vérifié le 12/07/2026 : aucune donnée existante n'utilise '2nde A', '2nde C' ou une classe primaire.

alter table public.pre_inscriptions drop constraint if exists pre_inscriptions_classe_actuelle_check;
alter table public.pre_inscriptions add constraint pre_inscriptions_classe_actuelle_check
  check (
    classe_actuelle in ('CP1','CP2','CE1','CE2','CM1','CM2','6e','5e','4e','3e','2nde A','2nde D')
    or classe_actuelle is null
  );

alter table public.pre_inscriptions drop constraint if exists pre_inscriptions_classe_souhaitee_check;
alter table public.pre_inscriptions add constraint pre_inscriptions_classe_souhaitee_check
  check (classe_souhaitee in ('CP1','CP2','CE1','CE2','CM1','CM2','6e','5e','4e','3e','2nde','1re','BEP1-GC','BEP1-ET'));

alter table public.emploi_du_temps drop constraint if exists emploi_du_temps_classe_check;
alter table public.emploi_du_temps add constraint emploi_du_temps_classe_check
  check (classe in ('CP1','CP2','CE1','CE2','CM1','CM2','6e','5e','4e','3e','2nde A','2nde D'));

alter table public.calendrier_devoirs drop constraint if exists calendrier_devoirs_classe_check;
alter table public.calendrier_devoirs add constraint calendrier_devoirs_classe_check
  check (classe in ('CP1','CP2','CE1','CE2','CM1','CM2','6e','5e','4e','3e','2nde A','2nde D'));
