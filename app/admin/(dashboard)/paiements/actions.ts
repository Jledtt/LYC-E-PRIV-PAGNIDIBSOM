"use server";

import { revalidatePath } from "next/cache";
import { createAuthClient, createServerClient } from "@/lib/supabase/server";
import { sendPaiementValide } from "@/lib/email/send";

export type ActionResult = { success: true } | { success: false; error: string };

const TYPE_FRAIS_LABELS: Record<string, string> = {
  frais_dossier: "Frais de dossier",
  frais_scolarite: "Frais de scolarité",
};

export async function validatePaiementAction(paiementId: string): Promise<ActionResult> {
  const supabase = await createAuthClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Session expirée." };
  }

  const { data: paiement, error: updateError } = await supabase
    .from("paiements")
    .update({
      statut: "valide",
      valide_par: user.id,
      valide_le: new Date().toISOString(),
      commentaire_admin: null,
    })
    .eq("id", paiementId)
    .select("id, pre_inscription_id, type_frais, montant")
    .maybeSingle();

  if (updateError) {
    console.error("[admin/paiements] Erreur validation :", updateError);
    return { success: false, error: "Erreur lors de la validation." };
  }

  if (!paiement) {
    return { success: false, error: "Paiement introuvable." };
  }

  revalidatePath("/admin/paiements");

  // Email de confirmation — best-effort, ne doit JAMAIS faire échouer une
  // validation déjà enregistrée en base (même garde qu'actions/pre-inscription.ts).
  // Résolution de l'email du parent via service_role : identique au motif
  // documenté dans lib/email/notifications.ts (auth.users non exposé via RLS).
  try {
    const serverClient = createServerClient();

    const { data: preInscription } = await serverClient
      .from("pre_inscriptions")
      .select("eleve_nom, eleve_prenom")
      .eq("id", paiement.pre_inscription_id)
      .maybeSingle();

    const { data: rattachement } = await serverClient
      .from("parent_eleves")
      .select("parent_id")
      .eq("pre_inscription_id", paiement.pre_inscription_id)
      .limit(1)
      .maybeSingle();

    if (preInscription && rattachement) {
      const { data: authUser } = await serverClient.auth.admin.getUserById(rattachement.parent_id);
      const email = authUser.user?.email;
      if (email) {
        await sendPaiementValide({
          to: email,
          nomEleve: preInscription.eleve_nom,
          prenomEleve: preInscription.eleve_prenom,
          typeFrais: TYPE_FRAIS_LABELS[paiement.type_frais] ?? paiement.type_frais,
          montant: paiement.montant,
        });
      }
    }
  } catch (err) {
    console.error("[admin/paiements] Erreur envoi email confirmation :", err);
  }

  return { success: true };
}

export async function rejectPaiementAction(
  paiementId: string,
  commentaire: string
): Promise<ActionResult> {
  const trimmed = commentaire.trim();
  if (!trimmed) {
    return { success: false, error: "Le motif est requis." };
  }

  const supabase = await createAuthClient();

  const { data, error } = await supabase
    .from("paiements")
    .update({ statut: "rejete", commentaire_admin: trimmed, valide_par: null, valide_le: null })
    .eq("id", paiementId)
    .select("id");

  if (error) {
    console.error("[admin/paiements] Erreur rejet :", error);
    return { success: false, error: "Erreur lors du rejet." };
  }

  if (!data || data.length === 0) {
    return { success: false, error: "Paiement introuvable." };
  }

  revalidatePath("/admin/paiements");
  return { success: true };
}
