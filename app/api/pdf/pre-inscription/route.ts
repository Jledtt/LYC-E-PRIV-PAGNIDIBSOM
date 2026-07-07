import { NextRequest } from "next/server";
import { createElement } from "react";
import { Readable } from "node:stream";
import { renderToStream } from "@react-pdf/renderer";
import { createServerClient } from "@/lib/supabase/server";
import PreInscriptionPDF from "@/lib/pdf/PreInscriptionPDF";

export const runtime = "nodejs";

function slugifyFilename(value: string): string {
  return value
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export async function GET(request: NextRequest) {
  const id = request.nextUrl.searchParams.get("id");
  if (!id) {
    return new Response("Paramètre id requis.", { status: 400 });
  }

  const supabase = createServerClient();
  const { data, error } = await supabase
    .from("pre_inscriptions")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    return new Response("Erreur lors de la récupération du dossier.", { status: 500 });
  }

  if (!data) {
    return new Response("Dossier introuvable.", { status: 404 });
  }

  const dossier = {
    id: data.id as string,
    eleve_nom: data.eleve_nom as string,
    eleve_prenom: data.eleve_prenom as string,
    eleve_date_naissance: data.eleve_date_naissance ?? undefined,
    eleve_lieu_naissance: data.eleve_lieu_naissance ?? undefined,
    eleve_nationalite: data.eleve_nationalite ?? undefined,
    eleve_sexe: data.eleve_sexe ?? undefined,
    eleve_classe_souhaitee: data.classe_souhaitee ?? undefined,
    classe_redoublee: data.classe_redoublee ?? undefined,
    ecole_precedente: data.ecole_precedente ?? undefined,
    secteur: data.secteur ?? undefined,
    quartier_ville: data.quartier_ville ?? undefined,
    pere_nom: data.pere_nom ?? undefined,
    pere_prenom: data.pere_prenom ?? undefined,
    pere_profession: data.pere_profession ?? undefined,
    pere_telephone: data.pere_telephone ?? undefined,
    mere_nom: data.mere_nom ?? undefined,
    mere_prenom: data.mere_prenom ?? undefined,
    mere_profession: data.mere_profession ?? undefined,
    mere_telephone: data.mere_telephone ?? undefined,
    contact_nom: `${data.parent_prenom ?? ""} ${data.parent_nom ?? ""}`.trim() || undefined,
    contact_telephone: data.parent_telephone ?? undefined,
    contact_email: data.parent_email ?? undefined,
    statut: data.statut ?? undefined,
    classe_actuelle: data.classe_actuelle ?? undefined,
    dossier_token: data.dossier_token ?? undefined,
    created_at: data.created_at ?? undefined,
  };

  const stream = await renderToStream(
    createElement(PreInscriptionPDF, { dossier }) as Parameters<typeof renderToStream>[0],
  );

  return new Response(Readable.toWeb(stream as unknown as Readable) as ReadableStream, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="dossier-${slugifyFilename(dossier.eleve_nom)}-${slugifyFilename(dossier.eleve_prenom)}.pdf"`,
    },
  });
}
