"use server";

import crypto from "crypto";
import { revalidatePath } from "next/cache";
import { createAuthClient } from "@/lib/supabase/server";
import {
  ALLOWED_PREUVE_TYPES,
  MAX_IMAGE_SIZE_BYTES,
  MAX_PDF_SIZE_BYTES,
  TYPES_FRAIS,
} from "./upload-constants";

export type DeclarerVirementResult = { success: true } | { success: false; error: string };

const EXTENSIONS: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "application/pdf": "pdf",
};

const TYPES_FRAIS_VALUES = TYPES_FRAIS.map((t) => t.value);

export async function declarerVirement(formData: FormData): Promise<DeclarerVirementResult> {
  const supabase = await createAuthClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Vous devez être connecté à l'Espace Parent." };
  }

  const preInscriptionId = formData.get("preInscriptionId");
  const typeFrais = formData.get("typeFrais");
  const montantRaw = formData.get("montant");
  const referenceVirement = formData.get("referenceVirement");
  const file = formData.get("file") as File | null;

  if (typeof preInscriptionId !== "string" || !preInscriptionId) {
    return { success: false, error: "Élève invalide." };
  }

  if (typeof typeFrais !== "string" || !TYPES_FRAIS_VALUES.includes(typeFrais as (typeof TYPES_FRAIS_VALUES)[number])) {
    return { success: false, error: "Type de frais invalide." };
  }

  const montant = Number(montantRaw);
  if (!Number.isFinite(montant) || montant <= 0) {
    return { success: false, error: "Montant invalide." };
  }

  if (!file || file.size === 0) {
    return { success: false, error: "Veuillez joindre le justificatif du virement." };
  }

  if (!ALLOWED_PREUVE_TYPES.includes(file.type as (typeof ALLOWED_PREUVE_TYPES)[number])) {
    return { success: false, error: "Format de fichier non supporté (image ou PDF uniquement)." };
  }

  const isPdf = file.type === "application/pdf";
  const maxSize = isPdf ? MAX_PDF_SIZE_BYTES : MAX_IMAGE_SIZE_BYTES;
  if (file.size > maxSize) {
    return {
      success: false,
      error: isPdf
        ? "Fichier PDF trop volumineux (5 Mo maximum)."
        : "Image trop volumineuse (2 Mo maximum).",
    };
  }

  // Vérifie le rattachement AVANT tout upload — RLS bloquerait de toute
  // façon l'INSERT dans paiements, mais on veut un message clair ici plutôt
  // qu'un fichier orphelin dans le bucket suivi d'une erreur RLS.
  const { data: rattachement, error: rattachementError } = await supabase
    .from("parent_eleves")
    .select("pre_inscription_id")
    .eq("parent_id", user.id)
    .eq("pre_inscription_id", preInscriptionId)
    .maybeSingle();

  if (rattachementError) {
    console.error("[parent/paiement] Erreur vérification rattachement :", rattachementError);
    return { success: false, error: "Erreur lors de la vérification du dossier." };
  }

  if (!rattachement) {
    return { success: false, error: "Ce dossier n'est pas rattaché à votre compte." };
  }

  const ext = EXTENSIONS[file.type];
  const path = `${preInscriptionId}/${crypto.randomUUID()}.${ext}`;

  const { error: uploadError } = await supabase.storage.from("preuves-paiement").upload(path, file, {
    contentType: file.type,
    upsert: false,
  });

  if (uploadError) {
    console.error("[parent/paiement] Erreur upload justificatif :", uploadError);
    return { success: false, error: "Erreur lors de l'envoi du justificatif. Veuillez réessayer." };
  }

  const { error: insertError } = await supabase.from("paiements").insert({
    pre_inscription_id: preInscriptionId,
    type_frais: typeFrais,
    montant: Math.round(montant),
    mode_paiement: "virement_bancaire",
    statut: "en_attente",
    reference_virement: typeof referenceVirement === "string" && referenceVirement.trim() ? referenceVirement.trim() : null,
    preuve_path: path,
  });

  if (insertError) {
    console.error("[parent/paiement] Erreur enregistrement paiement :", insertError);
    return { success: false, error: "Erreur lors de l'enregistrement de votre déclaration. Veuillez réessayer." };
  }

  revalidatePath("/parent/paiement");
  revalidatePath("/parent/dashboard");
  return { success: true };
}
