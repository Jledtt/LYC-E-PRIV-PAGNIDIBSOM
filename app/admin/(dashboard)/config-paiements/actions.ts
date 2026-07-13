"use server";

import { revalidatePath } from "next/cache";
import { createAuthClient } from "@/lib/supabase/server";

export type ActionResult = { success: true } | { success: false; error: string };

export async function updateConfigPaiement(
  id: string,
  fraisDossier: number,
  fraisScolarite: number
): Promise<ActionResult> {
  if (
    !Number.isInteger(fraisDossier) ||
    fraisDossier < 0 ||
    !Number.isInteger(fraisScolarite) ||
    fraisScolarite < 0
  ) {
    return { success: false, error: "Les montants doivent être des entiers positifs ou nuls." };
  }

  const supabase = await createAuthClient();

  const { data, error } = await supabase
    .from("config_paiements")
    .update({ frais_dossier: fraisDossier, frais_scolarite: fraisScolarite })
    .eq("id", id)
    .select("id");

  if (error) {
    console.error("[admin/config-paiements] Erreur mise à jour :", error);
    return { success: false, error: "Erreur lors de l'enregistrement." };
  }

  if (!data || data.length === 0) {
    return { success: false, error: "Ligne introuvable." };
  }

  revalidatePath("/admin/config-paiements");
  return { success: true };
}
