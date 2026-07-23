-- Fix I-4 (AUDIT.md) : le référentiel « classe actuelle » ne contenait pas
-- la 1re (A/D) ni le BEP (Génie Civil / Électrotechnique), alors que le
-- formulaire public accepte déjà ces classes en classe_souhaitee. Un élève
-- de 1re ou BEP ne pouvait donc jamais recevoir de classe_actuelle, ni
-- apparaître dans l'emploi du temps ou le calendrier des devoirs.
--
-- Élargit les 3 CHECK côté « actuelle » aux 4 tokens manquants (aligné sur
-- lib/scolarite.ts CLASSES). classe_souhaitee est déjà complet, inchangé.
-- Convention : 1re A / 1re D (série intégrée, comme 2nde A/D) ;
-- BEP1-GC / BEP1-ET (sans série, comme en classe_souhaitee).

-- pre_inscriptions.classe_actuelle (nullable : on préserve le OR ... IS NULL)
alter table public.pre_inscriptions drop constraint pre_inscriptions_classe_actuelle_check;
alter table public.pre_inscriptions add constraint pre_inscriptions_classe_actuelle_check
  check (
    classe_actuelle in (
      'CP1','CP2','CE1','CE2','CM1','CM2','6e','5e','4e','3e',
      '2nde A','2nde D','1re A','1re D','BEP1-GC','BEP1-ET'
    ) or classe_actuelle is null
  );

-- emploi_du_temps.classe
alter table public.emploi_du_temps drop constraint emploi_du_temps_classe_check;
alter table public.emploi_du_temps add constraint emploi_du_temps_classe_check
  check (
    classe in (
      'CP1','CP2','CE1','CE2','CM1','CM2','6e','5e','4e','3e',
      '2nde A','2nde D','1re A','1re D','BEP1-GC','BEP1-ET'
    )
  );

-- calendrier_devoirs.classe
alter table public.calendrier_devoirs drop constraint calendrier_devoirs_classe_check;
alter table public.calendrier_devoirs add constraint calendrier_devoirs_classe_check
  check (
    classe in (
      'CP1','CP2','CE1','CE2','CM1','CM2','6e','5e','4e','3e',
      '2nde A','2nde D','1re A','1re D','BEP1-GC','BEP1-ET'
    )
  );
