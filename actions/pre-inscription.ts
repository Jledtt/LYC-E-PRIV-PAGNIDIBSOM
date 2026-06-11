"use server";

import { headers } from "next/headers";
import { preInscriptionSchema } from "@/lib/schemas";
import { createServerClient } from "@/lib/supabase/server";
import { sendNotificationEmail } from "@/lib/email";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";

export type ActionResult =
  | { success: true }
  | { success: false; error: string; fieldErrors?: Record<string, string[]> };

export async function submitPreInscription(formData: FormData): Promise<ActionResult> {
  // Rate-limit : 3 soumissions / 10 min par IP.
  // Bucket isolé du formulaire contact pour ne pas les pénaliser mutuellement.
  const headersList = await headers();
  const ip = getClientIp(headersList);
  const { allowed } = checkRateLimit(`pre-inscription:${ip}`);
  if (!allowed) {
    return {
      success: false,
      error:
        "Trop de tentatives. Veuillez patienter quelques minutes avant de réessayer.",
    };
  }

  const raw = Object.fromEntries(formData.entries());
  const parsed = preInscriptionSchema.safeParse(raw);

  if (!parsed.success) {
    const fieldErrors: Record<string, string[]> = {};
    for (const [key, msgs] of Object.entries(parsed.error.flatten().fieldErrors)) {
      if (msgs) fieldErrors[key] = msgs;
    }
    return {
      success: false,
      error: "Veuillez corriger les erreurs dans le formulaire.",
      fieldErrors,
    };
  }

  const data = parsed.data;

  /* Faux succès silencieux si le honeypot est rempli (bot) */
  if (data.website) {
    return { success: true };
  }

  const supabase = createServerClient();

  try {
    // PHASE 2 : génération dossier_token ici
    //   const dossierToken = crypto.randomBytes(32).toString("base64url");
    //   const dossierTokenExpiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 j
    //   Ajouter dossier_token + dossier_token_expires_at à l'objet insert ci-dessous.

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
      return {
        success: false,
        error:
          "Une erreur est survenue lors de l'enregistrement. Veuillez réessayer ou appeler le +226 72 81 61 59.",
      };
    }
  } catch (err) {
    console.error("[pre-inscription] Erreur inattendue :", err);
    return {
      success: false,
      error:
        "Une erreur inattendue est survenue. Veuillez réessayer ou appeler le +226 72 81 61 59.",
    };
  }

  // L'email est best-effort : son échec ne doit JAMAIS faire échouer
  // une inscription déjà enregistrée en base.
  try {
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
  } catch (err) {
    console.error("[pre-inscription] Envoi email échoué (non bloquant) :", err);
  }

  return { success: true };
}