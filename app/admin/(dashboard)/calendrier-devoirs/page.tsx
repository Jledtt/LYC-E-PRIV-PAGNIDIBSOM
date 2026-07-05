import type { Metadata } from "next";
import Link from "next/link";
import { createAuthClient } from "@/lib/supabase/server";
import {
  CLASSES,
  TRIMESTRES,
  TRIMESTRE_LABELS,
  getAnneeScolaire,
  getTrimestreDateRange,
  getTrimestreaCtuel,
  type Classe,
  type Trimestre,
} from "@/lib/scolarite";
import DevoirsAdmin, { type DevoirRow } from "./DevoirsAdmin";

export const metadata: Metadata = { title: "Calendrier des devoirs" };
export const dynamic = "force-dynamic";

interface PageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

const selectorBase =
  "px-3 py-1.5 rounded text-sm font-medium transition-colors";
const selectorActive = "bg-primary-800 text-white";
const selectorInactive =
  "bg-white border border-neutral-300 text-neutral-700 hover:border-primary-600 hover:text-primary-700";

export default async function CalendrierDevoirsPage({ searchParams }: PageProps) {
  const params = await searchParams;

  const classeParam = typeof params.classe === "string" ? params.classe : undefined;
  const classe: Classe = (CLASSES as readonly string[]).includes(classeParam ?? "")
    ? (classeParam as Classe)
    : CLASSES[0];

  const trimestreParam = typeof params.trimestre === "string" ? params.trimestre : undefined;
  const trimestre: Trimestre = (TRIMESTRES as readonly string[]).includes(trimestreParam ?? "")
    ? (trimestreParam as Trimestre)
    : getTrimestreaCtuel();

  const { annee, anneeN1 } = getAnneeScolaire();
  const dateRange = getTrimestreDateRange(trimestre, annee, anneeN1);

  const supabase = await createAuthClient();
  const { data: rows } = await supabase
    .from("calendrier_devoirs")
    .select("id, date_devoir, matiere, heure_debut, heure_fin, type")
    .eq("classe", classe)
    .gte("date_devoir", dateRange.gte)
    .lte("date_devoir", dateRange.lte)
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
          Devoirs et compositions par classe et trimestre.
        </p>
      </div>

      {/* Sélecteur de classe */}
      <div className="flex flex-wrap gap-2">
        {CLASSES.map((c) => (
          <Link
            key={c}
            href={`/admin/calendrier-devoirs?classe=${encodeURIComponent(c)}&trimestre=${trimestre}`}
            className={[selectorBase, c === classe ? selectorActive : selectorInactive].join(" ")}
          >
            {c}
          </Link>
        ))}
      </div>

      {/* Sélecteur de trimestre */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          {TRIMESTRES.map((t) => (
            <Link
              key={t}
              href={`/admin/calendrier-devoirs?classe=${encodeURIComponent(classe)}&trimestre=${t}`}
              className={[selectorBase, t === trimestre ? selectorActive : selectorInactive].join(" ")}
            >
              {TRIMESTRE_LABELS[t]}
            </Link>
          ))}
        </div>

        <a
          href={`/api/pdf/calendrier-devoirs?classe=${encodeURIComponent(classe)}&trimestre=${trimestre.replace("T", "")}`}
          target="_blank"
          rel="noopener noreferrer"
          className="px-3 py-1.5 rounded text-sm font-medium border border-primary-700 text-primary-700 hover:bg-primary-50 transition-colors"
        >
          📄 PDF
        </a>
      </div>

      <DevoirsAdmin classe={classe} trimestre={trimestre} devoirs={devoirs} />
    </div>
  );
}
