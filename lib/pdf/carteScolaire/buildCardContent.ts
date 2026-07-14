import { getAnneeScolaire } from "@/lib/scolarite";

/** Champs de pre_inscriptions nécessaires à la carte — sous-ensemble minimal,
 *  pour que buildCardContent() reste utilisable aussi bien par la génération
 *  individuelle que par la planche en lot sans dépendre de la requête SQL
 *  exacte de chaque route. */
export interface StudentForCard {
  eleve_nom: string;
  eleve_prenom: string;
  eleve_date_naissance: string;
  eleve_lieu_naissance: string | null;
  classe_actuelle: string | null;
  classe_souhaitee: string;
  photo_path: string | null;
  contact_urgence_telephone: string | null;
}

export interface CardContent {
  nom: string;
  prenom: string;
  neLe: string;
  lieuNaissance: string;
  classe: string;
  anneeScolaire: string;
  photoUrl: string;
  contactUrgence: string;
}

/** Un élève est éligible à la carte s'il a une photo ET un contact d'urgence
 *  renseignés — les deux champs dynamiques qui ne peuvent pas être générés
 *  automatiquement. */
export function isEligibleForCard(student: StudentForCard): boolean {
  return Boolean(student.photo_path) && Boolean(student.contact_urgence_telephone);
}

function formatDateNaissance(value: string): string {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("fr-FR");
}

function anneeScolaireCourante(): string {
  const { annee, anneeN1 } = getAnneeScolaire();
  return `${annee}-${anneeN1}`;
}

/** Mapping unique élève -> contenu de carte, réutilisé par la génération
 *  individuelle et par la planche en lot. photoUrl doit être résolue (URL
 *  signée) en amont : cette fonction reste pure, sans accès réseau/Supabase. */
export function buildCardContent(student: StudentForCard, photoUrl: string): CardContent {
  return {
    nom: student.eleve_nom,
    prenom: student.eleve_prenom,
    neLe: formatDateNaissance(student.eleve_date_naissance),
    lieuNaissance: student.eleve_lieu_naissance ?? "—",
    classe: student.classe_actuelle ?? student.classe_souhaitee,
    anneeScolaire: anneeScolaireCourante(),
    photoUrl,
    contactUrgence: student.contact_urgence_telephone ?? "—",
  };
}
