"use server";

import { revalidatePath } from "next/cache";
import { createAuthClient } from "@/lib/supabase/server";

export type ActionResult = { success: true } | { success: false; error: string };

export async function validatePieceAction(
  preInscriptionId: string,
  pieceCode: string
): Promise<ActionResult> {
  const supabase = await createAuthClient();

  const { data, error } = await supabase
    .from("dossier_pieces")
    .update({ statut: "valide", motif_refus: null })
    .eq("pre_inscription_id", preInscriptionId)
    .eq("piece_code", pieceCode)
    .select("id");

  if (error) {
    console.error("[admin/dossiers] Erreur validation pièce :", error);
    return { success: false, error: "Erreur lors de la validation de la pièce." };
  }

  if (!data || data.length === 0) {
    return { success: false, error: "Pièce introuvable." };
  }

  revalidatePath(`/admin/dossiers/${preInscriptionId}`);
  revalidatePath("/admin/dossiers");
  revalidatePath("/admin");
  return { success: true };
}

export async function refusePieceAction(
  preInscriptionId: string,
  pieceCode: string,
  motif: string
): Promise<ActionResult> {
  const trimmedMotif = motif.trim();
  if (!trimmedMotif) {
    return { success: false, error: "Le motif est requis." };
  }

  const supabase = await createAuthClient();

  const { data, error } = await supabase
    .from("dossier_pieces")
    .update({ statut: "a_refaire", motif_refus: trimmedMotif })
    .eq("pre_inscription_id", preInscriptionId)
    .eq("piece_code", pieceCode)
    .select("id");

  if (error) {
    console.error("[admin/dossiers] Erreur refus pièce :", error);
    return { success: false, error: "Erreur lors de l'enregistrement du motif." };
  }

  if (!data || data.length === 0) {
    return { success: false, error: "Pièce introuvable." };
  }

  revalidatePath(`/admin/dossiers/${preInscriptionId}`);
  revalidatePath("/admin/dossiers");
  revalidatePath("/admin");
  return { success: true };
}
