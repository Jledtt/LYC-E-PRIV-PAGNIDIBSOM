"use server";

import { headers } from "next/headers";
import { contactSchema } from "@/lib/schemas";
import { createServerClient } from "@/lib/supabase/server";
import { sendNotificationEmail } from "@/lib/email";
import { escapeHtml } from "@/lib/email/escape";
import type { ActionResult } from "@/actions/pre-inscription";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";

export async function submitContact(formData: FormData): Promise<ActionResult> {
  // Rate-limit : 3 soumissions / 10 min par IP.
  // Bucket isolé de la pré-inscription pour ne pas les pénaliser mutuellement.
  const headersList = await headers();
  const ip = getClientIp(headersList);
  const { allowed } = checkRateLimit(`contact:${ip}`);
  if (!allowed) {
    return {
      success: false,
      error:
        "Trop de tentatives. Veuillez patienter quelques minutes avant de réessayer.",
    };
  }

  const raw = Object.fromEntries(formData.entries());
  const parsed = contactSchema.safeParse(raw);

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
    const { error: dbError } = await supabase.from("contacts").insert({
      nom: data.nom,
      telephone: data.telephone ?? null,
      email: data.email ?? null,
      message: data.message,
      statut: "nouveau",
    });

    if (dbError) {
      console.error("[contact] Erreur Supabase :", dbError);
      return {
        success: false,
        error:
          "Une erreur est survenue lors de l'envoi. Veuillez réessayer ou appeler le +226 72 81 61 59.",
      };
    }
  } catch (err) {
    console.error("[contact] Erreur inattendue :", err);
    return {
      success: false,
      error:
        "Une erreur inattendue est survenue. Veuillez réessayer ou appeler le +226 72 81 61 59.",
    };
  }

  // L'email est best-effort : son échec ne doit JAMAIS faire échouer
  // un message de contact déjà enregistré en base.
  try {
    await sendNotificationEmail({
      subject: `Nouveau message de contact — ${data.nom}`,
      html: `
        <h2>Nouveau message de contact</h2>
        <p><strong>Nom :</strong> ${escapeHtml(data.nom)}</p>
        ${data.telephone ? `<p><strong>Téléphone :</strong> ${escapeHtml(data.telephone)}</p>` : ""}
        ${data.email ? `<p><strong>Email :</strong> ${escapeHtml(data.email)}</p>` : ""}
        <p><strong>Message :</strong></p>
        <p>${escapeHtml(data.message).replace(/\n/g, "<br>")}</p>
      `,
    });
  } catch (err) {
    console.error("[contact] Envoi email échoué (non bloquant) :", err);
  }

  return { success: true };
}