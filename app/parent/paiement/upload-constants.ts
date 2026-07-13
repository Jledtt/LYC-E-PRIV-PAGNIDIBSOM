// Constantes partagées client/serveur — pas de directive "use server" ici :
// un module "use server" ne peut exporter que des fonctions async, les
// exports de constantes y seraient supprimés côté client (même convention
// que app/mon-dossier/[token]/upload-constants.ts).

export const ALLOWED_PREUVE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "application/pdf",
] as const;

export const MAX_IMAGE_SIZE_BYTES = 2 * 1024 * 1024; // 2 Mo
export const MAX_PDF_SIZE_BYTES = 5 * 1024 * 1024; // 5 Mo

export const TYPES_FRAIS = [
  { value: "frais_dossier", label: "Frais de dossier" },
  { value: "frais_scolarite", label: "Frais de scolarité" },
] as const;
