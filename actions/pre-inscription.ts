"use server";

import crypto from "crypto";
import { headers } from "next/headers";
import { preInscriptionSchema } from "@/lib/schemas";
import { createServerClient } from "@/lib/supabase/server";
import { sendNotificationEmail } from "@/lib/email";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { siteConfig } from "@/config/site";

export type ActionResult =
  | { success: true; dossierUrl?: string }
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

  // Token d'accès au dossier (espace parent, brique 3b) : pas de session
  // Supabase côté parent, le secret du token + son expiration font foi.
  const dossierToken = crypto.randomBytes(32).toString("base64url");
  const dossierTokenExpiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 j
  const dossierUrl = `${siteConfig.url}/mon-dossier/${dossierToken}`;

  let preInscriptionId: string | null = null;

  try {
    const { data: inserted, error: dbError } = await supabase
      .from("pre_inscriptions")
      .insert({
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
        dossier_token: dossierToken,
        dossier_token_expires_at: dossierTokenExpiresAt.toISOString(),
      })
      .select("id")
      .single();

    if (dbError) {
      console.error("[pre-inscription] Erreur Supabase :", dbError);
      return {
        success: false,
        error:
          "Une erreur est survenue lors de l'enregistrement. Veuillez réessayer ou appeler le +226 72 81 61 59.",
      };
    }

    preInscriptionId = inserted?.id ?? null;
  } catch (err) {
    console.error("[pre-inscription] Erreur inattendue :", err);
    return {
      success: false,
      error:
        "Une erreur inattendue est survenue. Veuillez réessayer ou appeler le +226 72 81 61 59.",
    };
  }

  // Initialisation du suivi des pièces du dossier (best-effort) : son échec
  // ne doit JAMAIS faire échouer une inscription déjà enregistrée en base.
  if (preInscriptionId) {
    try {
      const { data: pieceTypes, error: pieceTypesError } = await supabase
        .from("piece_types")
        .select("code")
        .eq("depot_en_ligne", true);

      if (pieceTypesError) throw pieceTypesError;

      if (pieceTypes && pieceTypes.length > 0) {
        const { error: dossierPiecesError } = await supabase.from("dossier_pieces").insert(
          pieceTypes.map((pieceType) => ({
            pre_inscription_id: preInscriptionId,
            piece_code: pieceType.code,
            statut: "attendu",
          }))
        );

        if (dossierPiecesError) {
          console.error(
            "[pre-inscription] Erreur création dossier_pieces (non bloquant) :",
            dossierPiecesError
          );
        }
      }
    } catch (err) {
      console.error("[pre-inscription] Erreur dossier_pieces inattendue (non bloquant) :", err);
    }
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

  return { success: true, dossierUrl };
}