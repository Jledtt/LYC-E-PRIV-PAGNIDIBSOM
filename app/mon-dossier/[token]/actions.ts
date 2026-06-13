"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { createServerClient } from "@/lib/supabase/server";
import { getDossierByToken } from "@/lib/dossier-token";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { ALLOWED_PIECE_TYPES, MAX_IMAGE_SIZE_BYTES, MAX_PDF_SIZE_BYTES } from "./upload-constants";

export type UploadPieceResult = { success: true } | { success: false; error: string };

const EXTENSIONS: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "application/pdf": "pdf",
};

export async function uploadPieceAction(
  token: string,
  pieceCode: string,
  formData: FormData
): Promise<UploadPieceResult> {
  // Rate-limit dédié à l'upload : bucket isolé des autres formulaires
  // publics, seuil plus permissif (un parent dépose plusieurs pièces).
  const headersList = await headers();
  const ip = getClientIp(headersList);
  const { allowed } = checkRateLimit(`dossier-upload:${ip}`, 10, 10 * 60 * 1000);
  if (!allowed) {
    return {
      success: false,
      error: "Trop de tentatives. Veuillez patienter quelques minutes avant de réessayer.",
    };
  }

  const result = await getDossierByToken(token);
  if (result.status !== "valid") {
    return { success: false, error: "Lien invalide ou expiré." };
  }

  const { dossier } = result;
  const pieceType = dossier.pieceTypes.find((p) => p.code === pieceCode);
  if (!pieceType || !pieceType.depot_en_ligne) {
    return { success: false, error: "Pièce invalide." };
  }

  const file = formData.get("file") as File | null;
  if (!file || file.size === 0) {
    return { success: false, error: "Veuillez sélectionner un fichier." };
  }

  if (!ALLOWED_PIECE_TYPES.includes(file.type as (typeof ALLOWED_PIECE_TYPES)[number])) {
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

  const ext = EXTENSIONS[file.type];
  const path = `${dossier.preInscriptionId}/${pieceCode}.${ext}`;

  const supabase = createServerClient();

  const { error: uploadError } = await supabase.storage.from("dossier-pieces").upload(path, file, {
    contentType: file.type,
    upsert: true,
  });

  if (uploadError) {
    console.error("[mon-dossier] Erreur upload pièce :", uploadError);
    return { success: false, error: "Erreur lors de l'envoi du fichier. Veuillez réessayer." };
  }

  const { error: upsertError } = await supabase.from("dossier_pieces").upsert(
    {
      pre_inscription_id: dossier.preInscriptionId,
      piece_code: pieceCode,
      statut: "recu",
      fichier_path: path,
      motif_refus: null,
    },
    { onConflict: "pre_inscription_id,piece_code" }
  );

  if (upsertError) {
    console.error("[mon-dossier] Erreur enregistrement dossier_pieces :", upsertError);
    return { success: false, error: "Erreur lors de l'enregistrement. Veuillez réessayer." };
  }

  revalidatePath(`/mon-dossier/${token}`);
  return { success: true };
}
