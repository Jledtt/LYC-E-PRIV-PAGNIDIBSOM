// Constantes partagées client/serveur — pas de directive "use server" ici :
// un module "use server" ne peut exporter que des fonctions async, les
// exports de constantes y seraient supprimés côté client.

export const STATUT_PIECE_LABELS: Record<string, string> = {
  attendu: "En attente de dépôt",
  recu: "Reçu, à vérifier",
  valide: "Validé",
  a_refaire: "À refaire",
};

export const STATUT_PIECE_BADGE_CLASSES: Record<string, string> = {
  attendu: "bg-neutral-100 text-neutral-600",
  recu: "bg-accent-100 text-accent-800",
  valide: "bg-green-100 text-green-700",
  a_refaire: "bg-red-50 text-red-700",
};

// Labels du statut global de la pré-inscription (cf.
// app/admin/(dashboard)/pre-inscriptions/statuts.ts) — affichage seul ici,
// la modification du statut global reste dans /admin/pre-inscriptions.
export const STATUT_PRE_INSCRIPTION_LABELS: Record<string, string> = {
  nouveau: "Nouveau",
  contacte: "Contacté",
  dossier_recu: "Dossier reçu",
  accepte: "Accepté",
  refuse: "Refusé",
};
