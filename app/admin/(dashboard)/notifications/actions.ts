"use server";

import { revalidatePath } from "next/cache";
import { createAuthClient } from "@/lib/supabase/server";
import { getAdminIdentity } from "@/lib/require-admin";
import { getDestinataires, envoyerNotification as envoyerNotificationLib } from "@/lib/email/notifications";

const PAGE_SIZE = 10;

export interface ParentDisponible {
  preInscriptionId: string;
  eleveNom: string;
  elevePrenom: string;
  classe: string;
  nom: string;
  email: string | null;
  telephone: string | null;
}

export async function getParentsDisponibles(): Promise<ParentDisponible[]> {
  const admin = await getAdminIdentity();
  if (!admin) {
    throw new Error("Accès refusé.");
  }

  const destinataires = await getDestinataires();
  if (destinataires.length === 0) return [];

  const supabase = await createAuthClient();
  const ids = destinataires.map((d) => d.preInscriptionId);
  const { data, error } = await supabase
    .from("pre_inscriptions")
    .select("id, classe_actuelle, classe_souhaitee")
    .in("id", ids);

  if (error) {
    console.error("[admin/notifications] Erreur lecture classes :", error.message);
  }

  const classeParId = new Map(
    (data ?? []).map((p) => [p.id as string, (p.classe_actuelle ?? p.classe_souhaitee) as string])
  );

  return destinataires.map((d) => ({
    preInscriptionId: d.preInscriptionId,
    eleveNom: d.eleveNom,
    elevePrenom: d.elevePrenom,
    classe: classeParId.get(d.preInscriptionId) ?? "—",
    nom: d.nom,
    email: d.email,
    telephone: d.telephone,
  }));
}

export type EnvoyerNotificationInput = {
  sujet: string;
  contenu: string;
  canaux: ("email" | "sms")[];
  preInscriptionIds?: string[];
  modeleId?: string;
};

export type EnvoyerNotificationActionResult =
  | {
      success: true;
      email: { envoyes: number; echecs: number };
      sms: { envoyes: number; echecs: number };
    }
  | { success: false; error: string };

export async function envoyerNotification(
  data: EnvoyerNotificationInput
): Promise<EnvoyerNotificationActionResult> {
  const admin = await getAdminIdentity();
  if (!admin) {
    return { success: false, error: "Accès refusé." };
  }

  if (data.canaux.length === 0) {
    return { success: false, error: "Choisissez au moins un canal d'envoi (email ou SMS)." };
  }
  if (data.canaux.includes("email") && !data.sujet.trim()) {
    return { success: false, error: "Le sujet est requis pour un envoi par email." };
  }
  if (!data.contenu.trim()) {
    return { success: false, error: "Le contenu du message est requis." };
  }

  const cible = Boolean(data.preInscriptionIds && data.preInscriptionIds.length > 0);
  const destinataires = await getDestinataires(data.preInscriptionIds);

  const resultat = await envoyerNotificationLib({
    sujet: data.sujet,
    contenu: data.contenu,
    canaux: data.canaux,
    preInscriptionIds: data.preInscriptionIds,
    modeleId: data.modeleId,
  });

  const totalEnvoyes =
    (data.canaux.includes("email") ? resultat.email.envoyes : 0) +
    (data.canaux.includes("sms") ? resultat.sms.envoyes : 0);
  const totalEchecs =
    (data.canaux.includes("email") ? resultat.email.echecs : 0) +
    (data.canaux.includes("sms") ? resultat.sms.echecs : 0);

  const statut: "envoye" | "partiel" | "echec" =
    totalEnvoyes === 0 ? "echec" : totalEchecs > 0 ? "partiel" : "envoye";

  const supabase = await createAuthClient();
  const { error: insertError } = await supabase.from("notifications_envoyees").insert({
    type_envoi: cible ? "cible" : "masse",
    sujet: data.sujet,
    contenu: data.contenu,
    modele_id: data.modeleId ?? null,
    canaux: data.canaux,
    destinataires_count: destinataires.length,
    destinataires_emails: destinataires.filter((d) => d.email).map((d) => d.email),
    destinataires_telephones: destinataires.filter((d) => d.telephone).map((d) => d.telephone),
    destinataires_pre_inscription_ids: destinataires.map((d) => d.preInscriptionId),
    envoye_par: admin.id,
    statut,
    resultats: { email: resultat.email, sms: resultat.sms },
    erreurs: [...resultat.email.erreurs, ...resultat.sms.erreurs],
  });

  if (insertError) {
    console.error("[admin/notifications] Erreur sauvegarde historique :", insertError.message);
  }

  revalidatePath("/admin/notifications");

  return {
    success: true,
    email: { envoyes: resultat.email.envoyes, echecs: resultat.email.echecs },
    sms: { envoyes: resultat.sms.envoyes, echecs: resultat.sms.echecs },
  };
}

export interface NotificationHistorique {
  id: string;
  type_envoi: string;
  sujet: string;
  contenu: string;
  canaux: string[];
  destinataires_count: number;
  statut: string;
  resultats: { email?: { envoyes: number; echecs: number }; sms?: { envoyes: number; echecs: number } };
  erreurs: string[];
  created_at: string;
}

export async function getHistorique(
  page: number = 1
): Promise<{ rows: NotificationHistorique[]; totalPages: number }> {
  const supabase = await createAuthClient();
  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  const { data, count, error } = await supabase
    .from("notifications_envoyees")
    .select(
      "id, type_envoi, sujet, contenu, canaux, destinataires_count, statut, resultats, erreurs, created_at",
      { count: "exact" }
    )
    .order("created_at", { ascending: false })
    .range(from, to);

  if (error) {
    console.error("[admin/notifications] Erreur lecture historique :", error.message);
    return { rows: [], totalPages: 1 };
  }

  return {
    rows: (data ?? []) as unknown as NotificationHistorique[],
    totalPages: count ? Math.max(1, Math.ceil(count / PAGE_SIZE)) : 1,
  };
}

export interface ModeleMessage {
  id: string;
  nom: string;
  sujet: string;
  contenu: string;
  type: string;
  is_default: boolean;
}

export async function getModeles(): Promise<ModeleMessage[]> {
  const supabase = await createAuthClient();
  const { data, error } = await supabase
    .from("modeles_messages")
    .select("id, nom, sujet, contenu, type, is_default")
    .order("type", { ascending: true })
    .order("nom", { ascending: true });

  if (error) {
    console.error("[admin/notifications] Erreur lecture modèles :", error.message);
    return [];
  }

  return data ?? [];
}

export type UpsertModeleInput = {
  id?: string;
  nom: string;
  sujet: string;
  contenu: string;
  type: "masse" | "convocation" | "avertissement" | "reunion" | "autre";
};

export type UpsertModeleResult =
  | { success: true; modele: ModeleMessage }
  | { success: false; error: string };

export async function upsertModele(data: UpsertModeleInput): Promise<UpsertModeleResult> {
  const admin = await getAdminIdentity();
  if (!admin) return { success: false, error: "Accès refusé." };

  if (!data.nom.trim() || !data.sujet.trim() || !data.contenu.trim()) {
    return { success: false, error: "Nom, sujet et contenu sont requis." };
  }

  const supabase = await createAuthClient();

  const payload = {
    nom: data.nom.trim(),
    sujet: data.sujet.trim(),
    contenu: data.contenu,
    type: data.type,
    updated_at: new Date().toISOString(),
  };

  const { data: modele, error } = data.id
    ? await supabase
        .from("modeles_messages")
        .update(payload)
        .eq("id", data.id)
        .select("id, nom, sujet, contenu, type, is_default")
        .single()
    : await supabase
        .from("modeles_messages")
        .insert(payload)
        .select("id, nom, sujet, contenu, type, is_default")
        .single();

  if (error || !modele) {
    console.error("[admin/notifications] Erreur sauvegarde modèle :", error?.message);
    return { success: false, error: "Erreur lors de la sauvegarde du modèle." };
  }

  revalidatePath("/admin/notifications");
  return { success: true, modele };
}

export type SupprimerModeleResult = { success: true } | { success: false; error: string };

export async function supprimerModele(id: string): Promise<SupprimerModeleResult> {
  const admin = await getAdminIdentity();
  if (!admin) return { success: false, error: "Accès refusé." };

  const supabase = await createAuthClient();

  const { data: modele } = await supabase
    .from("modeles_messages")
    .select("is_default")
    .eq("id", id)
    .maybeSingle();

  if (!modele) {
    return { success: false, error: "Modèle introuvable." };
  }
  if (modele.is_default) {
    return { success: false, error: "Impossible de supprimer un modèle par défaut." };
  }

  const { error } = await supabase.from("modeles_messages").delete().eq("id", id);

  if (error) {
    console.error("[admin/notifications] Erreur suppression modèle :", error.message);
    return { success: false, error: "Erreur lors de la suppression." };
  }

  revalidatePath("/admin/notifications");
  return { success: true };
}
