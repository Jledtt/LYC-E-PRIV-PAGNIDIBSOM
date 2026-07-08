import { createServerClient } from "@/lib/supabase/server";
import { resend, FROM_EMAIL } from "@/lib/email/resend";
import { notificationParent } from "@/lib/email/templates";
import { envoyerSMS } from "@/lib/ikoddi";

const FROM = `Lycée Privé Pagnidibsom <${FROM_EMAIL}>`;

export interface Destinataire {
  nom: string;
  email: string | null;
  telephone: string | null;
  eleveNom: string;
  elevePrenom: string;
  preInscriptionId: string;
}

/**
 * Résout, pour un ensemble de parent_id (comptes Espace Parent), leur email
 * de compte (auth.users). Passe par l'Auth Admin API (auth.admin.getUserById)
 * — la seule voie possible pour lire l'email d'un AUTRE utilisateur, cette
 * donnée n'étant pas dupliquée dans public.profiles et le schéma `auth`
 * n'étant pas exposé via PostgREST. C'est pourquoi ce module utilise
 * createServerClient() (service_role) malgré la règle générale du
 * back-office (cf. lib/supabase/server.ts) : l'accès aux AUTRES tables reste
 * décidé par les policies RLS `is_admin()`, seule cette résolution d'email
 * requiert le service_role.
 */
async function resolveParentEmails(
  supabase: ReturnType<typeof createServerClient>,
  parentIds: string[]
): Promise<Map<string, string | null>> {
  const uniques = [...new Set(parentIds)];
  const entries = await Promise.all(
    uniques.map(async (id) => {
      try {
        const { data, error } = await supabase.auth.admin.getUserById(id);
        if (error) {
          console.error("[notifications] Erreur getUserById :", id, error.message);
          return [id, null] as const;
        }
        return [id, data.user?.email ?? null] as const;
      } catch (err) {
        console.error("[notifications] Erreur inattendue getUserById :", id, err);
        return [id, null] as const;
      }
    })
  );
  return new Map(entries);
}

/**
 * Récupère les destinataires (un par pré-inscription) : email et téléphone
 * résolus par priorité — compte Espace Parent rattaché (OAuth) d'abord,
 * puis contact déclaré, puis téléphone père/mère.
 */
export async function getDestinataires(preInscriptionIds?: string[]): Promise<Destinataire[]> {
  const supabase = createServerClient();

  let query = supabase
    .from("pre_inscriptions")
    .select(
      "id, eleve_nom, eleve_prenom, parent_nom, parent_prenom, parent_email, parent_telephone, pere_telephone, mere_telephone"
    );

  if (preInscriptionIds && preInscriptionIds.length > 0) {
    query = query.in("id", preInscriptionIds);
  }

  const { data: preInscriptions, error } = await query;

  if (error) {
    console.error("[notifications] Erreur lecture pre_inscriptions :", error.message);
    return [];
  }

  const ids = (preInscriptions ?? []).map((p) => p.id as string);

  const { data: rattachements, error: rattachementsError } = await supabase
    .from("parent_eleves")
    .select("parent_id, pre_inscription_id, profiles(display_name)")
    .in("pre_inscription_id", ids.length > 0 ? ids : ["00000000-0000-0000-0000-000000000000"]);

  if (rattachementsError) {
    console.error("[notifications] Erreur lecture parent_eleves :", rattachementsError.message);
  }

  const rattachementParPreInscription = new Map<
    string,
    { parentId: string; displayName: string | null }
  >();
  for (const r of rattachements ?? []) {
    const profile = r.profiles as unknown as { display_name: string | null } | null;
    rattachementParPreInscription.set(r.pre_inscription_id as string, {
      parentId: r.parent_id as string,
      displayName: profile?.display_name ?? null,
    });
  }

  const emailsParParentId = await resolveParentEmails(
    supabase,
    [...rattachementParPreInscription.values()].map((r) => r.parentId)
  );

  return (preInscriptions ?? []).map((p) => {
    const rattachement = rattachementParPreInscription.get(p.id as string);
    const emailRattache = rattachement ? emailsParParentId.get(rattachement.parentId) ?? null : null;

    const nom = rattachement?.displayName || `${p.parent_prenom} ${p.parent_nom}`;
    const email = emailRattache ?? (p.parent_email as string | null);
    const telephone =
      (p.parent_telephone as string | null) ||
      (p.pere_telephone as string | null) ||
      (p.mere_telephone as string | null);

    return {
      nom,
      email,
      telephone,
      eleveNom: p.eleve_nom as string,
      elevePrenom: p.eleve_prenom as string,
      preInscriptionId: p.id as string,
    };
  });
}

async function envoyerEmails(
  destinataires: Destinataire[],
  sujet: string,
  contenu: string
): Promise<{ envoyes: number; echecs: number; erreurs: string[] }> {
  const cibles = destinataires.filter((d) => d.email);

  for (const d of destinataires.filter((d) => !d.email)) {
    console.warn(
      `[notifications] Aucun email pour ${d.elevePrenom} ${d.eleveNom} — email non envoyé.`
    );
  }

  if (cibles.length === 0) {
    return { envoyes: 0, echecs: 0, erreurs: [] };
  }

  const { html, subject } = notificationParent({ sujet, contenu });

  const resultats = await Promise.allSettled(
    cibles.map((d) =>
      resend.emails.send({ from: FROM, to: d.email!, subject, html })
    )
  );

  let envoyes = 0;
  const erreurs: string[] = [];
  resultats.forEach((r, i) => {
    if (r.status === "fulfilled" && !r.value.error) {
      envoyes += 1;
    } else {
      const detail =
        r.status === "fulfilled" ? r.value.error?.message : (r.reason as Error)?.message;
      erreurs.push(`${cibles[i].email} : ${detail ?? "erreur inconnue"}`);
    }
  });

  return { envoyes, echecs: cibles.length - envoyes, erreurs };
}

async function envoyerSMSGroupe(
  destinataires: Destinataire[],
  contenu: string
): Promise<{ envoyes: number; echecs: number; erreurs: string[] }> {
  const cibles = destinataires.filter((d) => d.telephone);

  for (const d of destinataires.filter((d) => !d.telephone)) {
    console.warn(
      `[notifications] Aucun téléphone pour ${d.elevePrenom} ${d.eleveNom} — SMS non envoyé.`
    );
  }

  if (cibles.length === 0) {
    return { envoyes: 0, echecs: 0, erreurs: [] };
  }

  const resultat = await envoyerSMS({
    numeros: cibles.map((d) => d.telephone!),
    message: contenu,
    campagne: `notification-${new Date().toISOString().slice(0, 10)}`,
  });

  return {
    envoyes: resultat.envoyes,
    echecs: resultat.echecs,
    erreurs: resultat.success ? [] : ["Échec d'envoi SMS (voir logs serveur)"],
  };
}

export interface EnvoyerNotificationParams {
  sujet: string;
  contenu: string;
  canaux: ("email" | "sms")[];
  preInscriptionIds?: string[];
  modeleId?: string;
}

export interface EnvoyerNotificationResult {
  success: boolean;
  email: { envoyes: number; echecs: number; erreurs: string[] };
  sms: { envoyes: number; echecs: number; erreurs: string[] };
}

/** N'expose jamais d'exception : les échecs partiels sont reflétés dans le résultat, jamais throw. */
export async function envoyerNotification({
  sujet,
  contenu,
  canaux,
  preInscriptionIds,
}: EnvoyerNotificationParams): Promise<EnvoyerNotificationResult> {
  try {
    const destinataires = await getDestinataires(preInscriptionIds);

    const [email, sms] = await Promise.all([
      canaux.includes("email")
        ? envoyerEmails(destinataires, sujet, contenu)
        : Promise.resolve({ envoyes: 0, echecs: 0, erreurs: [] }),
      canaux.includes("sms")
        ? envoyerSMSGroupe(destinataires, contenu)
        : Promise.resolve({ envoyes: 0, echecs: 0, erreurs: [] }),
    ]);

    return {
      success: email.envoyes > 0 || sms.envoyes > 0,
      email,
      sms,
    };
  } catch (err) {
    console.error("[notifications] Erreur inattendue envoyerNotification :", err);
    return {
      success: false,
      email: { envoyes: 0, echecs: 0, erreurs: ["Erreur inattendue"] },
      sms: { envoyes: 0, echecs: 0, erreurs: ["Erreur inattendue"] },
    };
  }
}
