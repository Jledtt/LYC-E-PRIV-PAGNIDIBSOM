// Constantes partagées client/serveur — pas de directive "use server" ici :
// un module "use server" ne peut exporter que des fonctions async, les
// exports de constantes y seraient supprimés côté client.

export const STATUT_OPTIONS = [
  { value: "nouveau", label: "Nouveau" },
  { value: "traite", label: "Traité" },
] as const;

export const STATUTS_VALIDES = STATUT_OPTIONS.map((o) => o.value);
