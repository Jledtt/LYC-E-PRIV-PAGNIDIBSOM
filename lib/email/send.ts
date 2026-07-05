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
      console.error("[email] Erreur envoi confirmation pré-inscription :", error);
      return { success: false };
    }

    return { success: true };
  } catch (err) {
    console.error("[email] Erreur inattendue confirmation pré-inscription :", err);
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
      console.error("[email] Erreur envoi notification admin :", error);
      return { success: false };
    }

    return { success: true };
  } catch (err) {
    console.error("[email] Erreur inattendue notification admin :", err);
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
      console.error("[email] Erreur envoi changement de statut :", error);
      return { success: false };
    }

    return { success: true };
  } catch (err) {
    console.error("[email] Erreur inattendue changement de statut :", err);
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
      console.error("[email] Erreur envoi bienvenue espace parent :", error);
      return { success: false };
    }

    return { success: true };
  } catch (err) {
    console.error("[email] Erreur inattendue bienvenue espace parent :", err);
    return { success: false };
  }
}
