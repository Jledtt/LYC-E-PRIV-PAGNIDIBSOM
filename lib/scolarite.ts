// Constantes du référentiel scolaire LPP — partagées entre admin et espace parent.
// Pas de directive "use server" : ce module exporte des constantes, pas des fonctions async.

export const CLASSES = ['6e', '5e', '4e', '3e', '2nde A', '2nde C'] as const;
export type Classe = (typeof CLASSES)[number];

export const JOURS = ['lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'] as const;
export type Jour = (typeof JOURS)[number];

export const CRENEAUX = [
  '7H-8H', '8H-9H', '9H-10H', '10H-11H', '11H-12H',
  '15H-16H', '16H-17H', '17H-18H',
] as const;
export type Creneau = (typeof CRENEAUX)[number];

export const CRENEAUX_MATIN: readonly Creneau[] = ['7H-8H', '8H-9H', '9H-10H', '10H-11H', '11H-12H'];
export const CRENEAUX_APREM: readonly Creneau[] = ['15H-16H', '16H-17H', '17H-18H'];

export const TYPES_DEVOIR = ['devoir', 'composition'] as const;
export type TypeDevoir = (typeof TYPES_DEVOIR)[number];

// ─── Trimestres ────────────────────────────────────────────────────────────────

export const TRIMESTRES = ['T1', 'T2', 'T3'] as const;
export type Trimestre = (typeof TRIMESTRES)[number];

export const TRIMESTRE_LABELS: Record<Trimestre, string> = {
  T1: '1er trimestre',
  T2: '2e trimestre',
  T3: '3e trimestre',
};

/** Retourne l'année de début de l'année scolaire (sept→août). Ex: 2025 pour 2025-2026. */
export function getAnneeScolaire(today = new Date()): { annee: number; anneeN1: number } {
  const month = today.getMonth() + 1; // 1–12
  const year = today.getFullYear();
  return month >= 9 ? { annee: year, anneeN1: year + 1 } : { annee: year - 1, anneeN1: year };
}

export interface TrimestreDateRange {
  gte: string; // YYYY-MM-DD
  lte: string; // YYYY-MM-DD
}

/** Plage de dates ISO pour un trimestre donné dans une année scolaire. */
export function getTrimestreDateRange(
  trimestre: Trimestre,
  annee: number,
  anneeN1: number,
): TrimestreDateRange {
  // new Date(anneeN1, 2, 0) = dernier jour de février de anneeN1 (28 ou 29)
  const lastFev = String(new Date(anneeN1, 2, 0).getDate()).padStart(2, '0');
  switch (trimestre) {
    case 'T1': return { gte: `${annee}-09-01`,    lte: `${annee}-12-31` };
    case 'T2': return { gte: `${anneeN1}-01-01`,  lte: `${anneeN1}-02-${lastFev}` };
    case 'T3': return { gte: `${anneeN1}-03-01`,  lte: `${anneeN1}-08-31` };
  }
}

/** Déduit le trimestre d'une date YYYY-MM-DD dans l'année scolaire (annee / anneeN1). */
export function getTrimestrefromDate(
  dateStr: string,
  annee: number,
  anneeN1: number,
): Trimestre | null {
  const d = new Date(dateStr + 'T00:00:00');
  const year = d.getFullYear();
  const month = d.getMonth() + 1;
  if (year === annee   && month >= 9)                   return 'T1';
  if (year === anneeN1 && month <= 2)                   return 'T2';
  if (year === anneeN1 && month >= 3 && month <= 8)     return 'T3';
  return null;
}

/** Trimestre en cours à la date donnée (défaut T1 si hors plage). */
export function getTrimestreaCtuel(today = new Date()): Trimestre {
  const { annee, anneeN1 } = getAnneeScolaire(today);
  return getTrimestrefromDate(today.toISOString().split('T')[0], annee, anneeN1) ?? 'T1';
}
