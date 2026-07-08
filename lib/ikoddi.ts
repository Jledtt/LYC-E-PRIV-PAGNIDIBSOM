import { Ikoddi, SMSStatus } from "ikoddi-client-sdk";

// Expéditeur SMS : IKODDI_SENDER_ID (ex. "LPP", alphanumérique, 11
// caractères max selon les opérateurs) doit être approuvé dans le dashboard
// Ikoddi avant utilisation en production — tant qu'il ne l'est pas, ou en
// l'absence de variable d'environnement, on retombe sur le numéro de
// l'école comme expéditeur.
function getSenderIdDefaut(): string {
  return process.env.IKODDI_SENDER_ID || "22672816159";
}

function getIkoddiClient(): Ikoddi {
  const apiKey = process.env.IKODDI_API_KEY;
  const groupId = process.env.IKODDI_GROUP_ID;

  if (!apiKey || !groupId) {
    throw new Error(
      "Variables d'environnement manquantes : IKODDI_API_KEY et IKODDI_GROUP_ID sont requises."
    );
  }

  return new Ikoddi().withApiKey(apiKey).withGroupId(groupId);
}

/**
 * Normalise un numéro burkinabè au format international attendu par Ikoddi
 * ("226XXXXXXXX", sans "+"). Retourne null si le numéro est invalide.
 */
export function formaterNumeroBF(numero: string): string | null {
  let n = numero.replace(/[\s\-]/g, "").replace(/^\+/, "");

  if (n.startsWith("0")) {
    n = "226" + n.slice(1);
  } else if (!n.startsWith("226")) {
    n = "226" + n;
  }

  const reste = n.slice(3);
  if (!/^\d{8}$/.test(reste)) {
    return null;
  }

  return n;
}

export interface EnvoyerSMSParams {
  numeros: string[];
  message: string;
  campagne: string;
  expediteur?: string;
}

export interface EnvoyerSMSResult {
  success: boolean;
  envoyes: number;
  echecs: number;
}

/** N'expose jamais d'exception : un échec Ikoddi ne doit jamais faire planter l'appelant. */
export async function envoyerSMS({
  numeros,
  message,
  campagne,
  expediteur = getSenderIdDefaut(),
}: EnvoyerSMSParams): Promise<EnvoyerSMSResult> {
  const numerosValides = numeros
    .map(formaterNumeroBF)
    .filter((n): n is string => n !== null);

  if (numerosValides.length === 0) {
    return { success: false, envoyes: 0, echecs: numeros.length };
  }

  try {
    const client = getIkoddiClient();
    const resultats = await client.sendSMS(numerosValides, expediteur, message, campagne);

    const echecsInvalides = numeros.length - numerosValides.length;
    const envoyes = resultats.filter(
      (r) => r.status !== SMSStatus.SendingError && r.status !== SMSStatus.Error
    ).length;
    const echecs = resultats.length - envoyes + echecsInvalides;

    return { success: envoyes > 0, envoyes, echecs };
  } catch (err) {
    console.error("[ikoddi] Erreur envoi SMS :", err instanceof Error ? err.message : err);
    return { success: false, envoyes: 0, echecs: numeros.length };
  }
}
