// AVERTISSEMENT — Rate-limit en mémoire vive (Map module-scope).
// NON DISTRIBUÉ : chaque worker Next.js maintient son propre compteur.
// Conçu pour des soumissions de formulaire texte ponctuelles sur trafic faible
// (site d'école privée, quelques dizaines de soumissions par jour).
//
// NE PAS réutiliser tel quel pour l'upload de dossier (Phase 2) :
//   • Prévoir un store distribué (ex. Upstash Redis via @upstash/ratelimit)
//     pour tenir sur plusieurs instances de worker.
//   • Ajuster limit + windowMs — un upload nécessite des seuils plus permissifs
//     qu'une soumission texte.

interface Entry {
  count: number;
  resetAt: number;
}

const store = new Map<string, Entry>();

/**
 * Vérifie si `key` dépasse `limit` requêtes dans la fenêtre `windowMs` (ms).
 * Paramétrable pour ne pas dupliquer la logique entre pré-inscription et contact.
 *
 * @param key      Identifiant de bucket (ex. "pre-inscription:1.2.3.4")
 * @param limit    Nombre maximum de requêtes autorisées (défaut : 3)
 * @param windowMs Durée de la fenêtre glissante en ms (défaut : 10 min)
 */
export function checkRateLimit(
  key: string,
  limit: number = 3,
  windowMs: number = 10 * 60 * 1000
): { allowed: boolean } {
  const now = Date.now();
  const entry = store.get(key);

  if (!entry || now >= entry.resetAt) {
    store.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true };
  }

  if (entry.count >= limit) {
    return { allowed: false };
  }

  entry.count += 1;
  return { allowed: true };
}

/**
 * Extrait la première IP de l'en-tête x-forwarded-for (prend la 1re valeur).
 * Retourne "unknown" si l'en-tête est absent (ex. en développement local).
 * Compatible avec Headers et ReadonlyHeaders de Next.js.
 */
export function getClientIp(requestHeaders: { get(name: string): string | null }): string {
  const forwarded = requestHeaders.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }
  return "unknown";
}
