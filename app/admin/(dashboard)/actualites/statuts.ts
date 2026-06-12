// Constantes partagées client/serveur — pas de directive "use server" ici :
// un module "use server" ne peut exporter que des fonctions async, les
// exports de constantes y seraient supprimés côté client.

export const STATUT_OPTIONS = [
  { value: "draft", label: "Brouillon" },
  { value: "published", label: "Publié" },
] as const;

export const STATUTS_VALIDES = STATUT_OPTIONS.map((o) => o.value);
