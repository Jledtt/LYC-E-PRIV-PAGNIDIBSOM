import { resend, FROM_EMAIL, ADMIN_EMAIL } from "./resend";
import {
  confirmationPreInscription,
  notificationAdmin,
  changementStatut,
  bienvenueEspaceParent,
  type ConfirmationPreInscriptionParams,
  type NotificationAdminParams,
  type ChangementStatutParams,
  type BienvenueEspaceParentParams,
} from "./templates";

export interface SendResult {
  success: boolean;
}

const FROM = `Lycée Privé Pagnidibsom <${FROM_EMAIL}>`;

export async function sendConfirmationPreInscription(
  params: ConfirmationPreInscriptionParams & { to: string }
): Promise<SendResult> {
  try {
    const { subject, html } = confirmationPreInscription(params);
    const { error } = await resend.emails.send({
      from: FROM,
      to: params.to,
      subject,
      html,
    });

    if (error) {
      console.error(
        `[email] Erreur envoi confirmation pré-inscription : code=${error.name} message=${error.message}`
      );
      return { success: false };
    }

    return { success: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error(`[email] Erreur inattendue confirmation pré-inscription : ${message}`);
    return { success: false };
  }
}

export async function sendNotificationAdmin(
  params: NotificationAdminParams
): Promise<SendResult> {
  try {
    const { subject, html } = notificationAdmin(params);
    const { error } = await resend.emails.send({
      from: FROM,
      to: ADMIN_EMAIL,
      subject,
      html,
    });

    if (error) {
      console.error(
        `[email] Erreur envoi notification admin (to=${ADMIN_EMAIL}) : code=${error.name} message=${error.message}`
      );
      return { success: false };
    }

    return { success: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error(`[email] Erreur inattendue notification admin : ${message}`);
    return { success: false };
  }
}

export async function sendChangementStatut(
  params: ChangementStatutParams & { to: string }
): Promise<SendResult> {
  try {
    const { subject, html } = changementStatut(params);
    const { error } = await resend.emails.send({
      from: FROM,
      to: params.to,
      subject,
      html,
    });

    if (error) {
      console.error(
        `[email] Erreur envoi changement de statut : code=${error.name} message=${error.message}`
      );
      return { success: false };
    }

    return { success: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error(`[email] Erreur inattendue changement de statut : ${message}`);
    return { success: false };
  }
}

export async function sendBienvenueEspaceParent(
  params: BienvenueEspaceParentParams & { to: string }
): Promise<SendResult> {
  try {
    const { subject, html } = bienvenueEspaceParent(params);
    const { error } = await resend.emails.send({
      from: FROM,
      to: params.to,
      subject,
      html,
    });

    if (error) {
      console.error(
        `[email] Erreur envoi bienvenue espace parent : code=${error.name} message=${error.message}`
      );
      return { success: false };
    }

    return { success: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error(`[email] Erreur inattendue bienvenue espace parent : ${message}`);
    return { success: false };
  }
}
