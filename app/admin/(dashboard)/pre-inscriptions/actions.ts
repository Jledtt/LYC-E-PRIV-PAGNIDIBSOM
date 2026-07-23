"use server";

import { revalidatePath } from "next/cache";
import { createAuthClient } from "@/lib/supabase/server";
import { sendChangementStatut } from "@/lib/email/send";
import type { StatutChangement } from "@/lib/email/templates";
import { STATUTS_VALIDES } from "./statuts";
import { CLASSES } from "@/lib/scolarite";
import { ALLOWED_PHOTO_TYPES, MAX_PHOTO_SIZE_BYTES } from "./photo-constants";

const TELEPHONE_REGEX = /^(\+?226)?[0-9\s\-]{8,15}$/;

async function requireAdmin(authClient: Awaited<ReturnType<typeof createAuthClient>>) {
  const {
    data: { user },
  } = await authClient.auth.getUser();
  if (!user) return null;

  const { data: profile } = await authClient
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();
  if (profile?.role !== "admin") return null;

  return user;
}

export type UpdateStatutResult = { success: true } | { success: false; error: string };

// Seuls ces statuts ont un email dédié (cf. lib/email/templates.ts) ; les
// transitions vers "nouveau"/"contacte" n'envoient rien.
const STATUT_EMAIL_MAP: Partial<Record<string, StatutChangement>> = {
  accepte: "accepte",
  refuse: "refuse",
  dossier_recu: "en_attente",
};

export async function updatePreInscriptionStatut(
  id: string,
  statut: string
): Promise<UpdateStatutResult> {
  if (!STATUTS_VALIDES.includes(statut as (typeof STATUTS_VALIDES)[number])) {
    return { success: false, error: "Statut invalide." };
  }

  const supabase = await createAuthClient();
  const user = await requireAdmin(supabase);
  if (!user) return { success: false, error: "Accès refusé." };

  // Récupéré avant l'update pour ne notifier que si le statut change
  // réellement, et pour disposer des champs nécessaires à l'email.
  const { data: existing } = await supabase
    .from("pre_inscriptions")
    .select("statut, eleve_nom, eleve_prenom, classe_souhaitee, parent_nom, parent_prenom, parent_email")
    .eq("id", id)
    .maybeSingle();

  const { data: updated, error } = await supabase
    .from("pre_inscriptions")
    .update({ statut })
    .eq("id", id)
    .select("id");

  if (error) {
    console.error("[admin/pre-inscriptions] Erreur mise à jour statut :", error);
    return { success: false, error: "Erreur lors de la mise à jour du statut." };
  }

  if (!updated || updated.length === 0) {
    return { success: false, error: "Dossier introuvable." };
  }

  revalidatePath("/admin/pre-inscriptions");
  revalidatePath("/admin");

  // Email best-effort : n'échoue jamais l'action (sendChangementStatut ne
  // throw pas).
  const statutEmail = STATUT_EMAIL_MAP[statut];
  if (existing && existing.statut !== statut && statutEmail && existing.parent_email) {
    await sendChangementStatut({
      to: existing.parent_email,
      nomEleve: existing.eleve_nom,
      prenomEleve: existing.eleve_prenom,
      classesouhaitee: existing.classe_souhaitee,
      statut: statutEmail,
      nomParent: `${existing.parent_prenom} ${existing.parent_nom}`,
    });
  }

  return { success: true };
}

export async function updateClasseActuelle(
  id: string,
  classeActuelle: string | null
): Promise<UpdateStatutResult> {
  if (classeActuelle !== null && !(CLASSES as readonly string[]).includes(classeActuelle)) {
    return { success: false, error: "Classe invalide." };
  }

  const authClient = await createAuthClient();
  const {
    data: { user },
  } = await authClient.auth.getUser();
  if (!user) return { success: false, error: "Non authentifié." };

  const { data: profile } = await authClient
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();
  if (profile?.role !== "admin") return { success: false, error: "Accès refusé." };

  const { error } = await authClient
    .from("pre_inscriptions")
    .update({ classe_actuelle: classeActuelle })
    .eq("id", id);

  if (error) {
    console.error("[admin/pre-inscriptions] Erreur update classe_actuelle :", error);
    return { success: false, error: "Erreur lors de la mise à jour." };
  }

  revalidatePath(`/admin/pre-inscriptions/${id}`);
  revalidatePath("/admin/pre-inscriptions");
  return { success: true };
}

export async function updateContactUrgence(
  id: string,
  telephone: string
): Promise<UpdateStatutResult> {
  const trimmed = telephone.trim();
  if (trimmed && !TELEPHONE_REGEX.test(trimmed)) {
    return { success: false, error: "Numéro de téléphone invalide." };
  }

  const authClient = await createAuthClient();
  const user = await requireAdmin(authClient);
  if (!user) return { success: false, error: "Accès refusé." };

  const { error } = await authClient
    .from("pre_inscriptions")
    .update({ contact_urgence_telephone: trimmed || null })
    .eq("id", id);

  if (error) {
    console.error("[admin/pre-inscriptions] Erreur update contact_urgence_telephone :", error);
    return { success: false, error: "Erreur lors de la mise à jour." };
  }

  revalidatePath(`/admin/pre-inscriptions/${id}`);
  return { success: true };
}

const PHOTO_EXTENSIONS: Record<(typeof ALLOWED_PHOTO_TYPES)[number], string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
};

export async function uploadPhotoEleve(id: string, formData: FormData): Promise<UpdateStatutResult> {
  const authClient = await createAuthClient();
  const user = await requireAdmin(authClient);
  if (!user) return { success: false, error: "Accès refusé." };

  const file = formData.get("file") as File | null;
  if (!file || file.size === 0) {
    return { success: false, error: "Veuillez sélectionner une photo." };
  }

  if (!ALLOWED_PHOTO_TYPES.includes(file.type as (typeof ALLOWED_PHOTO_TYPES)[number])) {
    return { success: false, error: "Format non supporté (JPEG ou PNG uniquement)." };
  }

  if (file.size > MAX_PHOTO_SIZE_BYTES) {
    return { success: false, error: "Photo trop volumineuse (2 Mo maximum)." };
  }

  const { data: existing } = await authClient
    .from("pre_inscriptions")
    .select("photo_path")
    .eq("id", id)
    .maybeSingle();

  const ext = PHOTO_EXTENSIONS[file.type as (typeof ALLOWED_PHOTO_TYPES)[number]];
  const path = `${id}/photo.${ext}`;

  // Upload AVANT toute suppression : si l'envoi échoue, l'ancienne photo doit
  // survivre (ne jamais laisser l'élève sans photo). La suppression de
  // l'ancien fichier orphelin (cas d'un changement de format png->jpg, chemin
  // différent) n'a lieu qu'après confirmation du succès, tout en bas.
  const { error: uploadError } = await authClient.storage.from("photos-eleves").upload(path, file, {
    contentType: file.type,
    upsert: true,
  });

  if (uploadError) {
    console.error("[admin/pre-inscriptions] Erreur upload photo élève :", uploadError);
    return { success: false, error: "Erreur lors de l'envoi de la photo." };
  }

  const { error: updateError } = await authClient
    .from("pre_inscriptions")
    .update({ photo_path: path })
    .eq("id", id);

  if (updateError) {
    console.error("[admin/pre-inscriptions] Erreur update photo_path :", updateError);
    return { success: false, error: "Erreur lors de l'enregistrement de la photo." };
  }

  // Nouvelle photo en place et référencée : on peut retirer l'ancien fichier
  // s'il portait un chemin différent (sinon ups:true l'a déjà écrasé).
  if (existing?.photo_path && existing.photo_path !== path) {
    await authClient.storage.from("photos-eleves").remove([existing.photo_path]);
  }

  revalidatePath(`/admin/pre-inscriptions/${id}`);
  return { success: true };
}
