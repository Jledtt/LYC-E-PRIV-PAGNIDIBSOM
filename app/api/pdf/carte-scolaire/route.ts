import { NextRequest } from "next/server";
import { createElement } from "react";
import { Readable } from "node:stream";
import { renderToStream } from "@react-pdf/renderer";
import { createServerClient } from "@/lib/supabase/server";
import { requireAdminSession } from "@/lib/pdf/route-auth";
import CarteScolairePDF from "@/lib/pdf/carteScolaire/CarteScolairePDF";
import { buildCardContent, isEligibleForCard, type StudentForCard } from "@/lib/pdf/carteScolaire/buildCardContent";

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

  const denied = await requireAdminSession();
  if (denied) return denied;

  const supabase = createServerClient();
  const { data, error } = await supabase
    .from("pre_inscriptions")
    .select(
      "eleve_nom, eleve_prenom, eleve_date_naissance, eleve_lieu_naissance, classe_actuelle, classe_souhaitee, photo_path, contact_urgence_telephone"
    )
    .eq("id", id)
    .maybeSingle();

  if (error) {
    console.error("[api/pdf/carte-scolaire] Erreur lecture dossier :", error);
    return new Response("Erreur lors de la récupération du dossier.", { status: 500 });
  }

  if (!data) {
    return new Response("Dossier introuvable.", { status: 404 });
  }

  const student = data as StudentForCard;

  if (!isEligibleForCard(student)) {
    return new Response(
      "Photo et/ou contact d'urgence manquants — complétez la fiche élève avant de générer la carte.",
      { status: 400 }
    );
  }

  const { data: signed, error: signedError } = await supabase.storage
    .from("photos-eleves")
    .createSignedUrl(student.photo_path as string, 300);

  if (signedError || !signed) {
    console.error("[api/pdf/carte-scolaire] Erreur URL signée photo :", signedError);
    return new Response("Erreur lors de la récupération de la photo.", { status: 500 });
  }

  const content = buildCardContent(student, signed.signedUrl);

  const stream = await renderToStream(
    createElement(CarteScolairePDF, { content }) as Parameters<typeof renderToStream>[0]
  );

  return new Response(Readable.toWeb(stream as unknown as Readable) as ReadableStream, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="carte-${slugifyFilename(student.eleve_nom)}-${slugifyFilename(student.eleve_prenom)}.pdf"`,
    },
  });
}
