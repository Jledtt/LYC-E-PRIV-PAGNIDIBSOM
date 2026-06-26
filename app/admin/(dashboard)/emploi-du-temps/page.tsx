import type { Metadata } from "next";
import Link from "next/link";
import { createAuthClient } from "@/lib/supabase/server";
import { CLASSES, type Classe } from "@/lib/scolarite";
import EmploiDuTempsGrid, { type CellulesMap } from "./EmploiDuTempsGrid";

export const metadata: Metadata = { title: "Emploi du temps" };
export const dynamic = "force-dynamic";

interface PageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function EmploiDuTempsPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const classeParam = typeof params.classe === "string" ? params.classe : undefined;
  const classe: Classe = (CLASSES as readonly string[]).includes(classeParam ?? "")
    ? (classeParam as Classe)
    : CLASSES[0];

  const supabase = await createAuthClient();
  const { data: rows } = await supabase
    .from("emploi_du_temps")
    .select("id, jour, creneau, matiere, enseignant, salle")
    .eq("classe", classe);

  const cellules: CellulesMap = {};
  for (const r of rows ?? []) {
    cellules[`${r.jour}__${r.creneau}`] = {
      id: r.id,
      matiere: r.matiere,
      enseignant: r.enseignant ?? null,
      salle: r.salle ?? null,
    };
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-primary-800 heading-serif mb-1">
          Emploi du temps
        </h1>
        <p className="text-sm text-neutral-500">
          Cliquez sur une cellule pour ajouter ou modifier un cours.
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {CLASSES.map((c) => (
          <Link
            key={c}
            href={`/admin/emploi-du-temps?classe=${encodeURIComponent(c)}`}
            className={[
              "px-3 py-1.5 rounded text-sm font-medium transition-colors",
              c === classe
                ? "bg-primary-800 text-white"
                : "bg-white border border-neutral-300 text-neutral-700 hover:border-primary-600 hover:text-primary-700",
            ].join(" ")}
          >
            {c}
          </Link>
        ))}
      </div>

      <EmploiDuTempsGrid classe={classe} cellules={cellules} />
    </div>
  );
}
