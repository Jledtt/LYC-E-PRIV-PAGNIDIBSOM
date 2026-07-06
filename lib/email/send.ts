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
    console.log("[email] Envoi vers:", params.to, "depuis:", FROM_EMAIL);
    const { error } = await resend.emails.send({
      from: FROM,
      to: params.to,
      subject,
      html,
    });

    if (error) {
      console.error("[email] Erreur complète:", JSON.stringify(error, null, 2));
      return { success: false };
    }

    return { success: true };
  } catch (err) {
    const serialized = err instanceof Error ? { name: err.name, message: err.message, stack: err.stack } : err;
    console.error("[email] Erreur complète:", JSON.stringify(serialized, null, 2));
    return { success: false };
  }
}

export async function sendNotificationAdmin(
  params: NotificationAdminParams
): Promise<SendResult> {
  try {
    const { subject, html } = notificationAdmin(params);
    console.log("[email] Envoi vers:", ADMIN_EMAIL, "depuis:", FROM_EMAIL);
    const { error } = await resend.emails.send({
      from: FROM,
      to: ADMIN_EMAIL,
      subject,
      html,
    });

    if (error) {
      console.error("[email] Erreur complète:", JSON.stringify(error, null, 2));
      return { success: false };
    }

    return { success: true };
  } catch (err) {
    const serialized = err instanceof Error ? { name: err.name, message: err.message, stack: err.stack } : err;
    console.error("[email] Erreur complète:", JSON.stringify(serialized, null, 2));
    return { success: false };
  }
}

export async function sendChangementStatut(
  params: ChangementStatutParams & { to: string }
): Promise<SendResult> {
  try {
    const { subject, html } = changementStatut(params);
    console.log("[email] Envoi vers:", params.to, "depuis:", FROM_EMAIL);
    const { error } = await resend.emails.send({
      from: FROM,
      to: params.to,
      subject,
      html,
    });

    if (error) {
      console.error("[email] Erreur complète:", JSON.stringify(error, null, 2));
      return { success: false };
    }

    return { success: true };
  } catch (err) {
    const serialized = err instanceof Error ? { name: err.name, message: err.message, stack: err.stack } : err;
    console.error("[email] Erreur complète:", JSON.stringify(serialized, null, 2));
    return { success: false };
  }
}

export async function sendBienvenueEspaceParent(
  params: BienvenueEspaceParentParams & { to: string }
): Promise<SendResult> {
  try {
    const { subject, html } = bienvenueEspaceParent(params);
    console.log("[email] Envoi vers:", params.to, "depuis:", FROM_EMAIL);
    const { error } = await resend.emails.send({
      from: FROM,
      to: params.to,
      subject,
      html,
    });

    if (error) {
      console.error("[email] Erreur complète:", JSON.stringify(error, null, 2));
      return { success: false };
    }

    return { success: true };
  } catch (err) {
    const serialized = err instanceof Error ? { name: err.name, message: err.message, stack: err.stack } : err;
    console.error("[email] Erreur complète:", JSON.stringify(serialized, null, 2));
    return { success: false };
  }
}
