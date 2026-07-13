-- Migration : suppression de config_paiements (jamais utilisée, plus de
-- moyen de paiement automatisé/configurable prévu — seul le virement
-- bancaire déclaratif (table paiements, non concernée) reste en place).

drop table if exists public.config_paiements;
