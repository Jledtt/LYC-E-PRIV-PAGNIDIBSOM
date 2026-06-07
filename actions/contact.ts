"use server";

import { contactSchema } from "@/lib/schemas";
import { createServerClient } from "@/lib/supabase/server";
import { sendNotificationEmail } from "@/lib/email";
import type { ActionResult } from "@/actions/pre-inscription";

export async function submitContact(formData: FormData): Promise<ActionResult> {
  const raw = Object.fromEntries(formData.entries());
  const parsed = contactSchema.safeParse(raw);

  if (!parsed.success) {
    const fieldErrors: Record<string, string[]> = {};
    for (const [key, msgs] of Object.entries(parsed.error.flatten().fieldErrors)) {
      if (msgs) fieldErrors[key] = msgs;
    }
    return { success: false, error: "Veuillez corriger les erreurs dans le formulaire.", fieldErrors };
  }

  const data = parsed.data;

  if (data.website) {
    return { success: true };
  }

  const supabase = createServerClient();

  const { error: dbError } = await supabase.from("contacts").insert({
    nom: data.nom,
    telephone: data.telephone ?? null,
    email: data.email ?? null,
    message: data.message,
    statut: "nouveau",
  });

  if (dbError) {
    console.error("[contact] Erreur Supabase :", dbError);
    return { success: false, error: "Une erreur est survenue. Veuillez réessayer." };
  }

  await sendNotificationEmail({
    subject: `Nouveau message de contact — ${data.nom}`,
    html: `
      <h2>Nouveau message de contact</h2>
      <p><strong>Nom :</strong> ${data.nom}</p>
      ${data.telephone ? `<p><strong>Téléphone :</strong> ${data.telephone}</p>` : ""}
      ${data.email ? `<p><strong>Email :</strong> ${data.email}</p>` : ""}
      <p><strong>Message :</strong></p>
      <p>${data.message.replace(/\n/g, "<br>")}</p>
    `,
  });

  return { success: true };
}
