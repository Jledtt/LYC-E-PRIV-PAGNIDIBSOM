import { NextRequest } from "next/server";
import { createElement } from "react";
import { Readable } from "node:stream";
import { renderToStream } from "@react-pdf/renderer";
import { createServerClient } from "@/lib/supabase/server";
import PlancheCartesScolairesPDF from "@/lib/pdf/carteScolaire/PlancheCartesScolairesPDF";
import { buildCardContent, isEligibleForCard, type StudentForCard } from "@/lib/pdf/carteScolaire/buildCardContent";

export const runtime = "nodejs";

interface StudentRow extends StudentForCard {
  id: string;
}

export async function POST(request: NextRequest) {
  let ids: unknown;
  try {
    const body = await request.json();
    ids = body?.ids;
  } catch {
    return new Response("Corps de requête JSON invalide.", { status: 400 });
  }

  if (!Array.isArray(ids) || ids.length === 0 || !ids.every((id) => typeof id === "string")) {
    return new Response("Le champ 'ids' doit être un tableau non vide d'identifiants.", {
      status: 400,
    });
  }

  const supabase = createServerClient();
  const { data, error } = await supabase
    .from("pre_inscriptions")
    .select(
      "id, eleve_nom, eleve_prenom, eleve_date_naissance, eleve_lieu_naissance, classe_actuelle, classe_souhaitee, photo_path, contact_urgence_telephone"
    )
    .in("id", ids);

  if (error) {
    console.error("[api/pdf/cartes-scolaires-lot] Erreur lecture dossiers :", error);
    return new Response("Erreur lors de la récupération des dossiers.", { status: 500 });
  }

  const students = (data ?? []) as StudentRow[];
  const eligibles = students.filter(isEligibleForCard);

  if (eligibles.length === 0) {
    return new Response(
      "Aucun élève sélectionné n'a de photo et de contact d'urgence renseignés.",
      { status: 400 }
    );
  }

  const contents = await Promise.all(
    eligibles.map(async (student) => {
      const { data: signed, error: signedError } = await supabase.storage
        .from("photos-eleves")
        .createSignedUrl(student.photo_path as string, 300);

      if (signedError || !signed) {
        console.error(
          "[api/pdf/cartes-scolaires-lot] Erreur URL signée photo pour",
          student.id,
          signedError
        );
        return null;
      }

      return buildCardContent(student, signed.signedUrl);
    })
  );

  const validContents = contents.filter((c): c is NonNullable<typeof c> => c !== null);

  if (validContents.length === 0) {
    return new Response("Erreur lors de la récupération des photos des élèves sélectionnés.", {
      status: 500,
    });
  }

  const stream = await renderToStream(
    createElement(PlancheCartesScolairesPDF, {
      contents: validContents,
    }) as Parameters<typeof renderToStream>[0]
  );

  return new Response(Readable.toWeb(stream as unknown as Readable) as ReadableStream, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="cartes-scolaires-${new Date().toISOString().slice(0, 10)}.pdf"`,
    },
  });
}
