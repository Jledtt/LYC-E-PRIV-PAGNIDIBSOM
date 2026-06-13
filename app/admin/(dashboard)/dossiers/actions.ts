"use server";

import crypto from "crypto";
import { revalidatePath } from "next/cache";
import { createAuthClient } from "@/lib/supabase/server";
import { siteConfig } from "@/config/site";

export type ActionResult = { success: true } | { success: false; error: string };

export type RenewTokenResult = { success: true; newUrl: string } | { success: false; error: string };

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

export async function renewDossierTokenAction(preInscriptionId: string): Promise<RenewTokenResult> {
  const supabase = await createAuthClient();

  const newToken = crypto.randomBytes(32).toString("base64url");
  const newExpiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 j

  const { data, error } = await supabase
    .from("pre_inscriptions")
    .update({ dossier_token: newToken, dossier_token_expires_at: newExpiresAt.toISOString() })
    .eq("id", preInscriptionId)
    .select("id");

  if (error) {
    console.error("[admin/dossiers] Erreur renouvellement token :", error);
    return { success: false, error: "Erreur lors du renouvellement du lien." };
  }

  if (!data || data.length === 0) {
    return { success: false, error: "Dossier introuvable." };
  }

  revalidatePath(`/admin/dossiers/${preInscriptionId}`);
  revalidatePath("/admin/dossiers");

  return { success: true, newUrl: `${siteConfig.url}/mon-dossier/${newToken}` };
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
