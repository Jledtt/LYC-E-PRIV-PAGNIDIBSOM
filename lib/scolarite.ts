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
