"use server";

import { revalidatePath } from "next/cache";
import { createAuthClient } from "@/lib/supabase/server";
import { STATUTS_VALIDES } from "./statuts";

export type UpdateStatutResult = { success: true } | { success: false; error: string };

export async function updatePreInscriptionStatut(
  id: string,
  statut: string
): Promise<UpdateStatutResult> {
  if (!STATUTS_VALIDES.includes(statut as (typeof STATUTS_VALIDES)[number])) {
    return { success: false, error: "Statut invalide." };
  }

  const supabase = await createAuthClient();

  const { error } = await supabase.from("pre_inscriptions").update({ statut }).eq("id", id);

  if (error) {
    console.error("[admin/pre-inscriptions] Erreur mise à jour statut :", error);
    return { success: false, error: "Erreur lors de la mise à jour du statut." };
  }

  revalidatePath("/admin/pre-inscriptions");
  revalidatePath("/admin");
  return { success: true };
}
