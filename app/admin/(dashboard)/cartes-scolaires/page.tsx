import type { Metadata } from "next";
import { createAuthClient } from "@/lib/supabase/server";
import { siteConfig } from "@/config/site";
import CartesScolairesSelector, { type EleveCarteRow } from "./CartesScolairesSelector";

export const metadata: Metadata = { title: "Cartes scolaires" };

export const dynamic = "force-dynamic";

interface PreInscriptionRow {
  id: string;
  eleve_nom: string;
  eleve_prenom: string;
  classe_actuelle: string | null;
  classe_souhaitee: string;
  photo_path: string | null;
  contact_urgence_telephone: string | null;
}

export default async function CartesScolairesPage() {
  const supabase = await createAuthClient();

  const { data, error } = await supabase
    .from("pre_inscriptions")
    .select(
      "id, eleve_nom, eleve_prenom, classe_actuelle, classe_souhaitee, photo_path, contact_urgence_telephone"
    )
    .eq("statut", "accepte")
    .order("eleve_nom", { ascending: true });

  if (error) {
    console.error("[admin/cartes-scolaires] Erreur lecture pre_inscriptions :", error);
  }

  const rows: EleveCarteRow[] = (data ?? []).map((p: PreInscriptionRow) => ({
    id: p.id,
    nom: p.eleve_nom,
    prenom: p.eleve_prenom,
    classe: p.classe_actuelle ?? p.classe_souhaitee,
    eligible: Boolean(p.photo_path) && Boolean(p.contact_urgence_telephone),
  }));

  const ordreClasses: string[] = siteConfig.classeOptions.map((c) => c.value);
  const classesPresentes = [...new Set(rows.map((r) => r.classe))].sort(
    (a, b) => ordreClasses.indexOf(a) - ordreClasses.indexOf(b)
  );

  const rowsParClasse = classesPresentes.map((classe) => ({
    classe,
    eleves: rows.filter((r) => r.classe === classe),
  }));

  return (
    <div>
      <h1 className="text-2xl font-bold text-primary-800 heading-serif mb-2">
        Cartes scolaires
      </h1>
      <p className="text-neutral-500 text-sm mb-6">
        Sélectionnez les élèves (dossiers acceptés) pour générer leurs cartes scolaires en lot —
        planche A4 de 8 cartes avec traits de coupe. Les élèves sans photo ou sans contact
        d&rsquo;urgence renseignés ne peuvent pas être sélectionnés.
      </p>

      {error && (
        <p
          role="alert"
          className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700 text-sm mb-4"
        >
          Erreur lors du chargement des données.
        </p>
      )}

      {rows.length === 0 && !error ? (
        <p className="text-sm text-neutral-500 italic">
          Aucun dossier accepté pour le moment.
        </p>
      ) : (
        <CartesScolairesSelector rowsParClasse={rowsParClasse} />
      )}
    </div>
  );
}
