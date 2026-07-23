import { NextRequest } from "next/server";
import { createElement } from "react";
import { Readable } from "node:stream";
import { renderToStream } from "@react-pdf/renderer";
import { createServerClient } from "@/lib/supabase/server";
import { requireSession } from "@/lib/pdf/route-auth";
import {
  CLASSES,
  TRIMESTRES,
  getAnneeScolaire,
  getTrimestreDateRange,
  type Classe,
  type Trimestre,
} from "@/lib/scolarite";
import CalendrierDevoirsPDF from "@/lib/pdf/CalendrierDevoirsPDF";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const classeParam = searchParams.get("classe");
  const trimestreParam = searchParams.get("trimestre");

  if (!classeParam || !(CLASSES as readonly string[]).includes(classeParam)) {
    return new Response("Classe invalide.", { status: 400 });
  }
  const classe = classeParam as Classe;

  const trimestreKey = `T${trimestreParam}` as Trimestre;
  if (!trimestreParam || !(TRIMESTRES as readonly string[]).includes(trimestreKey)) {
    return new Response("Trimestre invalide.", { status: 400 });
  }

  const denied = await requireSession();
  if (denied) return denied;

  const { annee, anneeN1 } = getAnneeScolaire();
  const { gte, lte } = getTrimestreDateRange(trimestreKey, annee, anneeN1);

  const supabase = createServerClient();
  const { data: rows, error } = await supabase
    .from("calendrier_devoirs")
    .select("date_devoir, matiere, heure_debut, heure_fin, type")
    .eq("classe", classe)
    .gte("date_devoir", gte)
    .lte("date_devoir", lte)
    .order("date_devoir", { ascending: true });

  if (error) {
    return new Response("Erreur lors de la récupération des devoirs.", { status: 500 });
  }

  const devoirs = (rows ?? []).map((r) => ({
    date_devoir: r.date_devoir as string,
    matiere: r.matiere as string,
    heure_debut: r.heure_debut ?? undefined,
    heure_fin: r.heure_fin ?? undefined,
    type: r.type as "devoir" | "composition",
  }));

  const trimestreNumero = Number(trimestreParam);

  const stream = await renderToStream(
    createElement(CalendrierDevoirsPDF, {
      classe,
      trimestre: trimestreNumero,
      devoirs,
      anneeScolaire: `${annee}-${anneeN1}`,
    }) as Parameters<typeof renderToStream>[0],
  );

  return new Response(Readable.toWeb(stream as unknown as Readable) as ReadableStream, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="calendrier-devoirs-${classe.replace(/\s+/g, "-")}-T${trimestreNumero}.pdf"`,
    },
  });
}
