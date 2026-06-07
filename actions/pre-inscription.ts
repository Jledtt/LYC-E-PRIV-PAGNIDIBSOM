"use server";

import { preInscriptionSchema } from "@/lib/schemas";
import { createServerClient } from "@/lib/supabase/server";
import { sendNotificationEmail } from "@/lib/email";

export type ActionResult = { success: true } | { success: false; error: string; fieldErrors?: Record<string, string[]> };

export async function submitPreInscription(formData: FormData): Promise<ActionResult> {
  const raw = Object.fromEntries(formData.entries());
  const parsed = preInscriptionSchema.safeParse(raw);

  if (!parsed.success) {
    const fieldErrors: Record<string, string[]> = {};
    for (const [key, msgs] of Object.entries(parsed.error.flatten().fieldErrors)) {
      if (msgs) fieldErrors[key] = msgs;
    }
    return { success: false, error: "Veuillez corriger les erreurs dans le formulaire.", fieldErrors };
  }

  const data = parsed.data;

  /* Ignore silencieusement si honeypot rempli */
  if (data.website) {
    return { success: true };
  }

  const supabase = createServerClient();

  const { error: dbError } = await supabase.from("pre_inscriptions").insert({
    eleve_nom: data.eleveNom,
    eleve_prenom: data.elevePrenom,
    eleve_date_naissance: data.eleveDateNaissance,
    eleve_sexe: data.eleveSexe,
    classe_souhaitee: data.classeSouhaitee,
    serie: data.serie ?? null,
    ecole_precedente: data.ecolePrecedente ?? null,
    parent_nom: data.parentNom,
    parent_prenom: data.parentPrenom,
    parent_telephone: data.parentTelephone,
    parent_email: data.parentEmail ?? null,
    parent_profession: data.parentProfession ?? null,
    quartier_ville: data.quartierVille,
    message: data.message ?? null,
    statut: "nouveau",
  });

  if (dbError) {
    console.error("[pre-inscription] Erreur Supabase :", dbError);
    return { success: false, error: "Une erreur est survenue. Veuillez réessayer." };
  }

  await sendNotificationEmail({
    subject: `Nouvelle pré-inscription — ${data.elevePrenom} ${data.eleveNom}`,
    html: `
      <h2>Nouvelle demande de pré-inscription</h2>
      <p><strong>Élève :</strong> ${data.elevePrenom} ${data.eleveNom}, classe souhaitée : ${data.classeSouhaitee}${data.serie ? " série " + data.serie : ""}</p>
      <p><strong>Parent :</strong> ${data.parentPrenom} ${data.parentNom}</p>
      <p><strong>Téléphone :</strong> ${data.parentTelephone}</p>
      ${data.parentEmail ? `<p><strong>Email :</strong> ${data.parentEmail}</p>` : ""}
      <p><strong>Quartier/Ville :</strong> ${data.quartierVille}</p>
      ${data.message ? `<p><strong>Message :</strong> ${data.message}</p>` : ""}
    `,
  });

  return { success: true };
}
