// Constantes partagées client/serveur — pas de directive "use server" ici :
// un module "use server" ne peut exporter que des fonctions async, les
// exports de constantes y seraient supprimés côté client (même convention
// que app/mon-dossier/[token]/upload-constants.ts).

export const ALLOWED_PHOTO_TYPES = ["image/jpeg", "image/png"] as const;

export const MAX_PHOTO_SIZE_BYTES = 2 * 1024 * 1024; // 2 Mo

// Portrait ~4:5 (largeur:hauteur), tolérance large pour ne pas rejeter des
// photos légèrement recadrées différemment.
export const MIN_PHOTO_WIDTH = 400;
export const MIN_PHOTO_HEIGHT = 500;
export const PHOTO_RATIO_MIN = 0.6; // ratio large/haut minimum accepté
export const PHOTO_RATIO_MAX = 0.9; // ratio large/haut maximum accepté
