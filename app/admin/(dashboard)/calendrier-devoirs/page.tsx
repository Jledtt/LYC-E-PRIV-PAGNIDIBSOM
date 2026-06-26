import type { Metadata } from "next";
import Link from "next/link";
import { createAuthClient } from "@/lib/supabase/server";
import { CLASSES, type Classe } from "@/lib/scolarite";
import DevoirsAdmin, { type DevoirRow } from "./DevoirsAdmin";

export const metadata: Metadata = { title: "Calendrier des devoirs" };
export const dynamic = "force-dynamic";

interface PageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function CalendrierDevoirsPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const classeParam = typeof params.classe === "string" ? params.classe : undefined;
  const classe: Classe = (CLASSES as readonly string[]).includes(classeParam ?? "")
    ? (classeParam as Classe)
    : CLASSES[0];

  const supabase = await createAuthClient();
  const { data: rows } = await supabase
    .from("calendrier_devoirs")
    .select("id, date_devoir, matiere, heure_debut, heure_fin, type")
    .eq("classe", classe)
    .order("date_devoir", { ascending: true });

  const devoirs: DevoirRow[] = (rows ?? []).map((r) => ({
    id: r.id,
    date_devoir: r.date_devoir,
    matiere: r.matiere,
    heure_debut: r.heure_debut ?? null,
    heure_fin: r.heure_fin ?? null,
    type: r.type,
  }));

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-primary-800 heading-serif mb-1">
          Calendrier des devoirs
        </h1>
        <p className="text-sm text-neutral-500">
          Devoirs et compositions par classe, triés par date.
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {CLASSES.map((c) => (
          <Link
            key={c}
            href={`/admin/calendrier-devoirs?classe=${encodeURIComponent(c)}`}
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

      <DevoirsAdmin classe={classe} devoirs={devoirs} />
    </div>
  );
}
