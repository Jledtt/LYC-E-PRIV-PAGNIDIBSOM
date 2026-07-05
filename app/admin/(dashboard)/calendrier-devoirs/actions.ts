"use server";

import { revalidatePath } from "next/cache";
import { createAuthClient } from "@/lib/supabase/server";
import { CLASSES, TYPES_DEVOIR, type Classe, type TypeDevoir } from "@/lib/scolarite";

export type ActionResult = { success: true } | { success: false; error: string };

async function requireAdmin(): Promise<boolean> {
  const supabase = await createAuthClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return false;
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();
  return profile?.role === "admin";
}

export interface AjouterDevoirPayload {
  classe: Classe;
  date_devoir: string;
  matiere: string;
  heure_debut: string | null;
  heure_fin: string | null;
  type: TypeDevoir;
}

export async function ajouterDevoir(payload: AjouterDevoirPayload): Promise<ActionResult> {
  if (!(await requireAdmin())) return { success: false, error: "Accès refusé." };

  if (!(CLASSES as readonly string[]).includes(payload.classe))
    return { success: false, error: "Classe invalide." };
  if (!payload.date_devoir) return { success: false, error: "La date est requise." };
  if (!payload.matiere.trim()) return { success: false, error: "La matière est requise." };
  if (!(TYPES_DEVOIR as readonly string[]).includes(payload.type))
    return { success: false, error: "Type invalide." };

  const supabase = await createAuthClient();
  const { error } = await supabase.from("calendrier_devoirs").insert({
    classe: payload.classe,
    date_devoir: payload.date_devoir,
    matiere: payload.matiere.trim(),
    heure_debut: payload.heure_debut,
    heure_fin: payload.heure_fin,
    type: payload.type,
  });

  if (error) {
    console.error("[admin/calendrier-devoirs] Erreur ajout :", error);
    return { success: false, error: "Erreur lors de l'ajout." };
  }

  revalidatePath("/admin/calendrier-devoirs");
  return { success: true };
}

export async function supprimerDevoir(id: string): Promise<ActionResult> {
  if (!(await requireAdmin())) return { success: false, error: "Accès refusé." };

  const supabase = await createAuthClient();
  const { error } = await supabase.from("calendrier_devoirs").delete().eq("id", id);

  if (error) {
    console.error("[admin/calendrier-devoirs] Erreur suppression :", error);
    return { success: false, error: "Erreur lors de la suppression." };
  }

  revalidatePath("/admin/calendrier-devoirs");
  return { success: true };
}
