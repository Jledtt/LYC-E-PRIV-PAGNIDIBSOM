/**
 * Génère un slug à partir d'un texte libre : minuscules, sans accents,
 * espaces et caractères spéciaux remplacés par des tirets, tirets multiples
 * réduits, tirets de tête/queue supprimés.
 *
 * Exemple : "Journée portes ouvertes 2026 !" -> "journee-portes-ouvertes-2026"
 */
export function slugify(text: string): string {
  return text
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}
