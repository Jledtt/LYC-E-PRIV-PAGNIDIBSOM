import { NextRequest } from "next/server";
import { createElement } from "react";
import { Readable } from "node:stream";
import { renderToStream } from "@react-pdf/renderer";
import { createServerClient } from "@/lib/supabase/server";
import { requireSession } from "@/lib/pdf/route-auth";
import { CLASSES, type Classe } from "@/lib/scolarite";
import EmploiDuTempsPDF from "@/lib/pdf/EmploiDuTempsPDF";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const classeParam = request.nextUrl.searchParams.get("classe");
  if (!classeParam || !(CLASSES as readonly string[]).includes(classeParam)) {
    return new Response("Classe invalide.", { status: 400 });
  }
  const classe = classeParam as Classe;

  const denied = await requireSession();
  if (denied) return denied;

  const supabase = createServerClient();
  const { data: rows, error } = await supabase
    .from("emploi_du_temps")
    .select("jour, creneau, matiere, enseignant, salle")
    .eq("classe", classe);

  if (error) {
    return new Response("Erreur lors de la récupération de l'emploi du temps.", { status: 500 });
  }

  const cours = (rows ?? []).map((r) => ({
    jour: r.jour as string,
    creneau: r.creneau as string,
    matiere: r.matiere as string,
    enseignant: r.enseignant ?? undefined,
    salle: r.salle ?? undefined,
  }));

  const stream = await renderToStream(
    createElement(EmploiDuTempsPDF, { classe, cours }) as Parameters<typeof renderToStream>[0],
  );

  return new Response(Readable.toWeb(stream as unknown as Readable) as ReadableStream, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="emploi-du-temps-${classe.replace(/\s+/g, "-")}.pdf"`,
    },
  });
}
