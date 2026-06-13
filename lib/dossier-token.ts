import { createServerClient } from "@/lib/supabase/server";

export interface PieceType {
  code: string;
  label: string;
  description: string | null;
  depot_en_ligne: boolean;
  ordre: number;
}

export interface DossierPiece {
  piece_code: string;
  statut: string;
  motif_refus: string | null;
  fichier_path: string | null;
}

export interface DossierData {
  preInscriptionId: string;
  eleveNom: string;
  elevePrenom: string;
  classeSouhaitee: string;
  serie: string | null;
  statut: string;
  pieceTypes: PieceType[];
  dossierPieces: DossierPiece[];
}

export type DossierLookupResult =
  | { status: "not_found" }
  | { status: "expired" }
  | { status: "valid"; dossier: DossierData };

/**
 * Valide le token d'accès au dossier (lien type "réinitialisation de mot de
 * passe" : pas de session Supabase côté parent) et charge les données
 * nécessaires à /mon-dossier/{token}. Utilise le client service_role —
 * dossier_pieces n'a aucune policy anon/authenticated (cf. migration 0005).
 */
export async function getDossierByToken(token: string): Promise<DossierLookupResult> {
  const supabase = createServerClient();

  const { data: preInscription, error } = await supabase
    .from("pre_inscriptions")
    .select("id, eleve_nom, eleve_prenom, classe_souhaitee, serie, statut, dossier_token_expires_at")
    .eq("dossier_token", token)
    .maybeSingle();

  if (error) {
    console.error("[mon-dossier] Erreur lecture pre_inscriptions :", error);
    return { status: "not_found" };
  }

  if (!preInscription) {
    return { status: "not_found" };
  }

  const expiresAt = preInscription.dossier_token_expires_at
    ? new Date(preInscription.dossier_token_expires_at)
    : null;

  if (!expiresAt || expiresAt.getTime() < Date.now()) {
    return { status: "expired" };
  }

  const { data: pieceTypes, error: pieceTypesError } = await supabase
    .from("piece_types")
    .select("code, label, description, depot_en_ligne, ordre")
    .order("ordre", { ascending: true });

  if (pieceTypesError) {
    console.error("[mon-dossier] Erreur lecture piece_types :", pieceTypesError);
  }

  const { data: dossierPieces, error: dossierPiecesError } = await supabase
    .from("dossier_pieces")
    .select("piece_code, statut, motif_refus, fichier_path")
    .eq("pre_inscription_id", preInscription.id);

  if (dossierPiecesError) {
    console.error("[mon-dossier] Erreur lecture dossier_pieces :", dossierPiecesError);
  }

  return {
    status: "valid",
    dossier: {
      preInscriptionId: preInscription.id,
      eleveNom: preInscription.eleve_nom,
      elevePrenom: preInscription.eleve_prenom,
      classeSouhaitee: preInscription.classe_souhaitee,
      serie: preInscription.serie,
      statut: preInscription.statut,
      pieceTypes: pieceTypes ?? [],
      dossierPieces: dossierPieces ?? [],
    },
  };
}
