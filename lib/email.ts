/**
 * Envoi d'email via Resend.
 * Si RESEND_API_KEY est absent, fait un no-op et log en console.
 */
export async function sendNotificationEmail(opts: {
  subject: string;
  html: string;
}): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.CONTACT_NOTIFICATION_EMAIL;

  if (!apiKey || !to) {
    console.log("[email] Resend non configuré — email ignoré :", opts.subject);
    return;
  }

  const { Resend } = await import("resend");
  const resend = new Resend(apiKey);

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://kiswensida.bf";
  const domain = new URL(siteUrl).hostname;

  const { error } = await resend.emails.send({
    from: `Kiswensida <noreply@${domain}>`,
    to,
    subject: opts.subject,
    html: opts.html,
  });

  if (error) {
    console.error("[email] Erreur Resend :", error);
  }
}
