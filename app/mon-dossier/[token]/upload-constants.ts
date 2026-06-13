// Constantes partagées client/serveur — pas de directive "use server" ici :
// un module "use server" ne peut exporter que des fonctions async, les
// exports de constantes y seraient supprimés côté client (même convention
// que app/admin/(dashboard)/actualites/image.ts).

export const ALLOWED_PIECE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "application/pdf",
] as const;

export const MAX_IMAGE_SIZE_BYTES = 2 * 1024 * 1024; // 2 Mo (après compression côté client)
export const MAX_PDF_SIZE_BYTES = 5 * 1024 * 1024; // 5 Mo
