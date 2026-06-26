import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { createAuthClient } from "@/lib/supabase/server";
import StatusSelect from "../StatusSelect";
import ClasseActuelleSelect from "../ClasseActuelleSelect";
import { STATUT_OPTIONS } from "../statuts";

export const metadata: Metadata = {
  title: "Détail de la pré-inscription",
};

export const dynamic = "force-dynamic";

const STATUT_LABELS: Record<string, string> = Object.fromEntries(
  STATUT_OPTIONS.map((o) => [o.value, o.label])
);

interface PreInscriptionDetail {
  id: string;
  created_at: string;
  eleve_nom: string;
  eleve_prenom: string;
  eleve_date_naissance: string;
  eleve_lieu_naissance: string | null;
  eleve_nationalite: string | null;
  eleve_sexe: string;
  classe_souhaitee: string;
  serie: string | null;
  classe_redoublee: boolean | null;
  ecole_precedente: string | null;
  secteur: string | null;
  pere_nom: string | null;
  pere_prenom: string | null;
  pere_profession: string | null;
  pere_telephone: string | null;
  mere_nom: string | null;
  mere_prenom: string | null;
  mere_profession: string | null;
  mere_telephone: string | null;
  parent_nom: string;
  parent_prenom: string;
  parent_telephone: string;
  parent_email: string | null;
  quartier_ville: string;
  message: string | null;
  statut: string;
  classe_actuelle: string | null;
}

interface PageProps {
  params: Promise<{ id: string }>;
}

function Champ({ label, value }: { label: string; value: string | null | undefined }) {
  return (
    <div>
      <dt className="text-xs font-semibold text-neutral-500 uppercase tracking-wide">{label}</dt>
      <dd className="text-sm text-[#1F2937] mt-0.5">{value || "—"}</dd>
    </div>
  );
}

export default async function AdminPreInscriptionDetailPage({ params }: PageProps) {
  const { id } = await params;
  const supabase = await createAuthClient();

  const { data } = await supabase
    .from("pre_inscriptions")
    .select(
      "id, created_at, eleve_nom, eleve_prenom, eleve_date_naissance, eleve_lieu_naissance, eleve_nationalite, eleve_sexe, classe_souhaitee, serie, classe_redoublee, ecole_precedente, secteur, pere_nom, pere_prenom, pere_profession, pere_telephone, mere_nom, mere_prenom, mere_profession, mere_telephone, parent_nom, parent_prenom, parent_telephone, parent_email, quartier_ville, message, statut, classe_actuelle"
    )
    .eq("id", id)
    .maybeSingle();

  if (!data) {
    notFound();
  }

  const p = data as PreInscriptionDetail;
  const hasPere = Boolean(p.pere_nom || p.pere_prenom || p.pere_profession || p.pere_telephone);
  const hasMere = Boolean(p.mere_nom || p.mere_prenom || p.mere_profession || p.mere_telephone);

  return (
    <div>
      <Link
        href="/admin/pre-inscriptions"
        className="inline-flex items-center gap-1 text-sm text-primary-700 hover:underline mb-4"
      >
        <span aria-hidden="true">←</span> Retour à la liste
      </Link>

      <div className="flex flex-wrap items-start justify-between gap-3 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-primary-800 heading-serif">
            {p.eleve_prenom} {p.eleve_nom}
          </h1>
          <p className="text-neutral-600 mt-1">
            {p.classe_souhaitee}
            {p.serie ? ` — série ${p.serie}` : ""} · Demande du{" "}
            {new Date(p.created_at).toLocaleDateString("fr-FR")}
          </p>
        </div>
        <div className="flex flex-wrap gap-3 items-start">
          <StatusSelect id={p.id} currentStatut={p.statut} />
          <ClasseActuelleSelect id={p.id} currentClasse={p.classe_actuelle} />
        </div>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <section className="bg-white border border-neutral-200 rounded-lg p-5">
          <h2 className="font-semibold text-primary-800 mb-4">Élève</h2>
          <dl className="grid grid-cols-2 gap-4">
            <Champ label="Nom" value={p.eleve_nom} />
            <Champ label="Prénom" value={p.eleve_prenom} />
            <Champ
              label="Date de naissance"
              value={new Date(p.eleve_date_naissance).toLocaleDateString("fr-FR")}
            />
            <Champ label="Lieu de naissance" value={p.eleve_lieu_naissance} />
            <Champ label="Nationalité" value={p.eleve_nationalite} />
            <Champ label="Sexe" value={p.eleve_sexe === "M" ? "Masculin" : "Féminin"} />
            <Champ label="Classe souhaitée" value={p.classe_souhaitee} />
            <Champ label="Série" value={p.serie} />
            <Champ label="Classe redoublée" value={p.classe_redoublee ? "Oui" : "Non"} />
            <Champ label="École précédente" value={p.ecole_precedente} />
            <Champ label="Secteur" value={p.secteur} />
            <Champ label="Quartier / Ville" value={p.quartier_ville} />
          </dl>
        </section>

        <section className="flex flex-col gap-6">
          <div className="bg-white border border-neutral-200 rounded-lg p-5">
            <h2 className="font-semibold text-primary-800 mb-4">Père</h2>
            {hasPere ? (
              <dl className="grid grid-cols-2 gap-4">
                <Champ label="Nom" value={p.pere_nom} />
                <Champ label="Prénom" value={p.pere_prenom} />
                <Champ label="Profession" value={p.pere_profession} />
                <Champ label="Téléphone" value={p.pere_telephone} />
              </dl>
            ) : (
              <p className="text-sm text-neutral-500">Non renseigné.</p>
            )}
          </div>

          <div className="bg-white border border-neutral-200 rounded-lg p-5">
            <h2 className="font-semibold text-primary-800 mb-4">Mère / Tutrice</h2>
            {hasMere ? (
              <dl className="grid grid-cols-2 gap-4">
                <Champ label="Nom" value={p.mere_nom} />
                <Champ label="Prénom" value={p.mere_prenom} />
                <Champ label="Profession" value={p.mere_profession} />
                <Champ label="Téléphone" value={p.mere_telephone} />
              </dl>
            ) : (
              <p className="text-sm text-neutral-500">Non renseignée.</p>
            )}
          </div>

          <div className="bg-white border border-neutral-200 rounded-lg p-5">
            <h2 className="font-semibold text-primary-800 mb-4">Contact principal</h2>
            <dl className="grid grid-cols-2 gap-4">
              <Champ label="Contact déclaré" value={`${p.parent_prenom} ${p.parent_nom}`} />
              <Champ label="Téléphone (WhatsApp)" value={p.parent_telephone} />
              <Champ label="Email" value={p.parent_email} />
              <Champ label="Statut" value={STATUT_LABELS[p.statut] ?? p.statut} />
            </dl>
          </div>
        </section>
      </div>

      {p.message && (
        <div className="bg-white border border-neutral-200 rounded-lg p-5 mt-6">
          <h2 className="font-semibold text-primary-800 mb-2">Message</h2>
          <p className="text-sm text-[#1F2937] whitespace-pre-wrap">{p.message}</p>
        </div>
      )}
    </div>
  );
}
