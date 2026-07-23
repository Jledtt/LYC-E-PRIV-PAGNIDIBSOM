/**
 * Échappe les caractères HTML spéciaux d'une valeur destinée à être interpolée
 * dans le HTML d'un email. À appliquer à TOUTE saisie utilisateur (noms,
 * message de contact, contenu de notification…) AVANT toute conversion
 * \n -> <br> (sinon les <br> insérés seraient eux-mêmes échappés).
 *
 * Ne PAS utiliser sur les sujets d'email (subject) : ce sont du texte brut,
 * pas du HTML — les échapper afficherait "&amp;" tel quel dans l'objet.
 */
export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
