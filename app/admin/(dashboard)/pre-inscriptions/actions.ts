"use server";

import { revalidatePath } from "next/cache";
import { createAuthClient } from "@/lib/supabase/server";
import { sendChangementStatut } from "@/lib/email/send";
import type { StatutChangement } from "@/lib/email/templates";
import { STATUTS_VALIDES } from "./statuts";
import { CLASSES } from "@/lib/scolarite";

export type UpdateStatutResult = { success: true } | { success: false; error: string };

// Seuls ces statuts ont un email dédié (cf. lib/email/templates.ts) ; les
// transitions vers "nouveau"/"contacte" n'envoient rien.
const STATUT_EMAIL_MAP: Partial<Record<string, StatutChangement>> = {
  accepte: "accepte",
  refuse: "refuse",
  dossier_recu: "en_attente",
};

export async function updatePreInscriptionStatut(
  id: string,
  statut: string
): Promise<UpdateStatutResult> {
  if (!STATUTS_VALIDES.includes(statut as (typeof STATUTS_VALIDES)[number])) {
    return { success: false, error: "Statut invalide." };
  }

  const supabase = await createAuthClient();

  // Récupéré avant l'update pour ne notifier que si le statut change
  // réellement, et pour disposer des champs nécessaires à l'email.
  const { data: existing } = await supabase
    .from("pre_inscriptions")
    .select("statut, eleve_nom, eleve_prenom, classe_souhaitee, parent_nom, parent_prenom, parent_email")
    .eq("id", id)
    .maybeSingle();

  const { error } = await supabase.from("pre_inscriptions").update({ statut }).eq("id", id);

  if (error) {
    console.error("[admin/pre-inscriptions] Erreur mise à jour statut :", error);
    return { success: false, error: "Erreur lors de la mise à jour du statut." };
  }

  revalidatePath("/admin/pre-inscriptions");
  revalidatePath("/admin");

  // Email best-effort : n'échoue jamais l'action (sendChangementStatut ne
  // throw pas).
  const statutEmail = STATUT_EMAIL_MAP[statut];
  if (existing && existing.statut !== statut && statutEmail && existing.parent_email) {
    await sendChangementStatut({
      to: existing.parent_email,
      nomEleve: existing.eleve_nom,
      prenomEleve: existing.eleve_prenom,
      classesouhaitee: existing.classe_souhaitee,
      statut: statutEmail,
      nomParent: `${existing.parent_prenom} ${existing.parent_nom}`,
    });
  }

  return { success: true };
}

export async function updateClasseActuelle(
  id: string,
  classeActuelle: string | null
): Promise<UpdateStatutResult> {
  if (classeActuelle !== null && !(CLASSES as readonly string[]).includes(classeActuelle)) {
    return { success: false, error: "Classe invalide." };
  }

  const authClient = await createAuthClient();
  const {
    data: { user },
  } = await authClient.auth.getUser();
  if (!user) return { success: false, error: "Non authentifié." };

  const { data: profile } = await authClient
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();
  if (profile?.role !== "admin") return { success: false, error: "Accès refusé." };

  const { error } = await authClient
    .from("pre_inscriptions")
    .update({ classe_actuelle: classeActuelle })
    .eq("id", id);

  if (error) {
    console.error("[admin/pre-inscriptions] Erreur update classe_actuelle :", error);
    return { success: false, error: "Erreur lors de la mise à jour." };
  }

  revalidatePath(`/admin/pre-inscriptions/${id}`);
  revalidatePath("/admin/pre-inscriptions");
  return { success: true };
}
