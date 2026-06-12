// Constantes partagées client/serveur — pas de directive "use server" ici :
// un module "use server" ne peut exporter que des fonctions async, les
// exports de constantes y seraient supprimés côté client.

export const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"] as const;

export const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024; // 5 Mo
