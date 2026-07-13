import type { Metadata } from "next";
import { createAuthClient } from "@/lib/supabase/server";
import { siteConfig } from "@/config/site";
import ConfigPaiementsTable, { type ConfigPaiementRow } from "./ConfigPaiementsTable";

export const metadata: Metadata = { title: "Configuration des paiements" };

export const dynamic = "force-dynamic";

interface ConfigPaiementDb {
  id: string;
  classe: string;
  frais_dossier: number;
  frais_scolarite: number;
  annee_scolaire: string;
}

export default async function ConfigPaiementsPage() {
  const supabase = await createAuthClient();

  const { data, error } = await supabase
    .from("config_paiements")
    .select("id, classe, frais_dossier, frais_scolarite, annee_scolaire");

  if (error) {
    console.error("[admin/config-paiements] Erreur lecture config_paiements :", error);
  }

  const rowsDb = (data ?? []) as ConfigPaiementDb[];
  const labelParClasse = new Map<string, string>(
    siteConfig.classeOptions.map((c) => [c.value, c.label])
  );
  const ordre: string[] = siteConfig.classeOptions.map((c) => c.value);

  const rows: ConfigPaiementRow[] = rowsDb
    .map((r) => ({
      id: r.id,
      classe: r.classe,
      label: labelParClasse.get(r.classe) ?? r.classe,
      fraisDossier: r.frais_dossier,
      fraisScolarite: r.frais_scolarite,
    }))
    .sort((a, b) => ordre.indexOf(a.classe) - ordre.indexOf(b.classe));

  const anneeScolaire = rowsDb[0]?.annee_scolaire ?? "";

  return (
    <div>
      <h1 className="text-2xl font-bold text-primary-800 heading-serif mb-2">
        Configuration des paiements
      </h1>
      <p className="text-neutral-500 text-sm mb-6">
        Tarifs par classe pour l&rsquo;année scolaire {anneeScolaire || "en cours"}. Ces montants
        alimentent les frais de dossier et de scolarité affichés aux familles.
      </p>

      {rows.length === 0 ? (
        <p className="text-sm text-neutral-500 italic">Aucune configuration trouvée.</p>
      ) : (
        <ConfigPaiementsTable rows={rows} />
      )}
    </div>
  );
}
