"use server";

import { revalidatePath } from "next/cache";
import { createAuthClient } from "@/lib/supabase/server";
import { CLASSES, JOURS, CRENEAUX, type Classe, type Jour, type Creneau } from "@/lib/scolarite";

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

export interface UpsertCellulesPayload {
  classe: Classe;
  jour: Jour;
  creneau: Creneau;
  matiere: string;
  enseignant: string | null;
  salle: string | null;
}

export async function upsertCellule(payload: UpsertCellulesPayload): Promise<ActionResult> {
  if (!(await requireAdmin())) return { success: false, error: "Accès refusé." };

  if (!(CLASSES as readonly string[]).includes(payload.classe))
    return { success: false, error: "Classe invalide." };
  if (!(JOURS as readonly string[]).includes(payload.jour))
    return { success: false, error: "Jour invalide." };
  if (!(CRENEAUX as readonly string[]).includes(payload.creneau))
    return { success: false, error: "Créneau invalide." };
  if (!payload.matiere.trim()) return { success: false, error: "La matière est requise." };

  const supabase = await createAuthClient();
  const { error } = await supabase.from("emploi_du_temps").upsert(
    {
      classe: payload.classe,
      jour: payload.jour,
      creneau: payload.creneau,
      matiere: payload.matiere.trim(),
      enseignant: payload.enseignant,
      salle: payload.salle,
    },
    { onConflict: "classe,jour,creneau" }
  );

  if (error) {
    console.error("[admin/emploi-du-temps] Erreur upsert :", error);
    return { success: false, error: "Erreur lors de la sauvegarde." };
  }

  revalidatePath("/admin/emploi-du-temps");
  return { success: true };
}

export async function supprimerCellule(id: string): Promise<ActionResult> {
  if (!(await requireAdmin())) return { success: false, error: "Accès refusé." };

  const supabase = await createAuthClient();
  const { error } = await supabase.from("emploi_du_temps").delete().eq("id", id);

  if (error) {
    console.error("[admin/emploi-du-temps] Erreur suppression :", error);
    return { success: false, error: "Erreur lors de la suppression." };
  }

  revalidatePath("/admin/emploi-du-temps");
  return { success: true };
}
