"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createAuthClient, createServerClient } from "@/lib/supabase/server";

export type RattacherResult =
  | { success: true; eleveNom: string; elevePrenom: string }
  | { success: false; error: string };

export interface ParentDossierPiece {
  pieceCode: string;
  pieceLabel: string;
  statut: string;
  motifRefus: string | null;
}

export interface ParentDossier {
  preInscriptionId: string;
  eleveNom: string;
  elevePrenom: string;
  classeSouhaitee: string;
  statut: string;
  dossierToken: string | null;
  pieces: ParentDossierPiece[];
}

export async function signOutParent(): Promise<void> {
  const supabase = await createAuthClient();
  await supabase.auth.signOut();
  redirect("/parent/login");
}

/**
 * Rattache un élève au parent connecté à partir du dossier_token (reçu par
 * WhatsApp lors de la pré-inscription). Le token sert ici uniquement de
 * preuve de possession du dossier : son expiration n'est PAS vérifiée,
 * contrairement à /mon-dossier/{token} qui en dépend pour l'accès direct.
 */
export async function rattacherEleve(token: string): Promise<RattacherResult> {
  if (typeof token !== "string" || token.trim().length === 0) {
    return { success: false, error: "Veuillez renseigner un code de suivi." };
  }

  const authClient = await createAuthClient();
  const {
    data: { user },
  } = await authClient.auth.getUser();

  if (!user) {
    return { success: false, error: "Vous devez être connecté." };
  }

  const supabase = createServerClient();

  const { data: preInscription, error } = await supabase
    .from("pre_inscriptions")
    .select("id, eleve_nom, eleve_prenom")
    .eq("dossier_token", token.trim())
    .maybeSingle();

  if (error) {
    console.error("[parent-auth] Erreur recherche pre_inscriptions :", error);
    return { success: false, error: "Une erreur est survenue. Veuillez réessayer." };
  }

  if (!preInscription) {
    return { success: false, error: "Token invalide." };
  }

  const { data: existing, error: existingError } = await supabase
    .from("parent_eleves")
    .select("id")
    .eq("parent_id", user.id)
    .eq("pre_inscription_id", preInscription.id)
    .maybeSingle();

  if (existingError) {
    console.error("[parent-auth] Erreur vérification rattachement :", existingError);
    return { success: false, error: "Une erreur est survenue. Veuillez réessayer." };
  }

  if (existing) {
    return { success: false, error: "Cet élève est déjà rattaché à votre compte." };
  }

  const { error: insertError } = await supabase.from("parent_eleves").insert({
    parent_id: user.id,
    pre_inscription_id: preInscription.id,
  });

  if (insertError) {
    console.error("[parent-auth] Erreur insertion parent_eleves :", insertError);
    return { success: false, error: "Une erreur est survenue. Veuillez réessayer." };
  }

  revalidatePath("/parent/rattacher");
  revalidatePath("/parent/dashboard");

  return {
    success: true,
    eleveNom: preInscription.eleve_nom,
    elevePrenom: preInscription.eleve_prenom,
  };
}

/**
 * Lecture des dossiers du parent connecté via le client authentifié
 * (cookies) : la RLS (policies *_parent_select de 0006_parent_auth.sql)
 * filtre automatiquement aux pre_inscriptions rattachées.
 */
export async function getParentDossiers(): Promise<ParentDossier[]> {
  const supabase = await createAuthClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return [];

  const { data: preInscriptions, error } = await supabase
    .from("pre_inscriptions")
    .select("id, eleve_nom, eleve_prenom, classe_souhaitee, statut, dossier_token");

  if (error) {
    console.error("[parent-auth] Erreur lecture pre_inscriptions :", error);
    return [];
  }

  if (!preInscriptions || preInscriptions.length === 0) return [];

  const [{ data: dossierPieces, error: piecesError }, { data: pieceTypes, error: pieceTypesError }] =
    await Promise.all([
      supabase.from("dossier_pieces").select("pre_inscription_id, piece_code, statut, motif_refus"),
      supabase.from("piece_types").select("code, label, ordre").order("ordre", { ascending: true }),
    ]);

  if (piecesError) console.error("[parent-auth] Erreur lecture dossier_pieces :", piecesError);
  if (pieceTypesError) console.error("[parent-auth] Erreur lecture piece_types :", pieceTypesError);

  const pieceLabels = new Map((pieceTypes ?? []).map((pt) => [pt.code, pt.label]));

  return preInscriptions.map((p) => ({
    preInscriptionId: p.id,
    eleveNom: p.eleve_nom,
    elevePrenom: p.eleve_prenom,
    classeSouhaitee: p.classe_souhaitee,
    statut: p.statut,
    dossierToken: p.dossier_token,
    pieces: (dossierPieces ?? [])
      .filter((piece) => piece.pre_inscription_id === p.id)
      .map((piece) => ({
        pieceCode: piece.piece_code,
        pieceLabel: pieceLabels.get(piece.piece_code) ?? piece.piece_code,
        statut: piece.statut,
        motifRefus: piece.motif_refus,
      })),
  }));
}
