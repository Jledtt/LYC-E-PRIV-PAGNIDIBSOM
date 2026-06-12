"use server";

import { revalidatePath } from "next/cache";
import { createAuthClient } from "@/lib/supabase/server";
import { STATUTS_VALIDES } from "./statuts";

export type UpdateStatutResult = { success: true } | { success: false; error: string };

export async function updateContactStatut(
  id: string,
  statut: string
): Promise<UpdateStatutResult> {
  if (!STATUTS_VALIDES.includes(statut as (typeof STATUTS_VALIDES)[number])) {
    return { success: false, error: "Statut invalide." };
  }

  const supabase = await createAuthClient();

  const { error } = await supabase.from("contacts").update({ statut }).eq("id", id);

  if (error) {
    console.error("[admin/messages] Erreur mise à jour statut :", error);
    return { success: false, error: "Erreur lors de la mise à jour du statut." };
  }

  revalidatePath("/admin/messages");
  revalidatePath("/admin");
  return { success: true };
}
