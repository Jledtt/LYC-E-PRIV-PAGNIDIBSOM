import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { createAuthClient } from "@/lib/supabase/server";
import StatusSelect from "../StatusSelect";
import ClasseActuelleSelect from "../ClasseActuelleSelect";
import { STATUT_OPTIONS } from "../statuts";
import DossierTokenSection from "./DossierTokenSection";
import TelechargerPdfButton from "./TelechargerPdfButton";

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
  eleve_ethnie: string | null;
  eleve_religion: string | null;
  eleve_telephone_domicile: string | null;
  classe_souhaitee: string;
  serie: string | null;
  classe_redoublee: boolean | null;
  ecole_precedente: string | null;
  secteur: string | null;
  pere_nom: string | null;
  pere_prenom: string | null;
  pere_profession: string | null;
  pere_service: string | null;
  pere_telephone: string | null;
  pere_email: string | null;
  mere_nom: string | null;
  mere_prenom: string | null;
  mere_profession: string | null;
  mere_service: string | null;
  mere_telephone: string | null;
  mere_email: string | null;
  parent_nom: string;
  parent_prenom: string;
  parent_telephone: string;
  parent_email: string | null;
  quartier_ville: string;
  message: string | null;
  statut: string;
  classe_actuelle: string | null;
  dossier_token: string | null;
  sante_asthme: boolean;
  sante_cardiopathie: boolean;
  sante_diabete: boolean;
  sante_drepanocytose: boolean;
  sante_hta: boolean;
  sante_epilepsie: boolean;
  aptitude_sport: boolean | null;
}

interface PageProps {
  params: Promise<{ id: string }>;
}

const PATHOLOGIE_LABELS: Array<{ key: keyof PreInscriptionDetail; label: string }> = [
  { key: "sante_asthme", label: "Asthme" },
  { key: "sante_cardiopathie", label: "Cardiopathie" },
  { key: "sante_diabete", label: "Diabète" },
  { key: "sante_drepanocytose", label: "Drépanocytose" },
  { key: "sante_hta", label: "HTA" },
  { key: "sante_epilepsie", label: "Épilepsie" },
];

function Badge({ label, color }: { label: string; color: "red" | "green" | "gray" }) {
  const colorClasses = {
    red: "bg-red-100 text-red-700",
    green: "bg-green-100 text-green-700",
    gray: "bg-neutral-100 text-neutral-600",
  }[color];
  return (
    <span className={`inline-block text-xs font-medium px-2.5 py-1 rounded-full ${colorClasses}`}>
      {label}
    </span>
  );
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
      "id, created_at, eleve_nom, eleve_prenom, eleve_date_naissance, eleve_lieu_naissance, eleve_nationalite, eleve_sexe, eleve_ethnie, eleve_religion, eleve_telephone_domicile, classe_souhaitee, serie, classe_redoublee, ecole_precedente, secteur, pere_nom, pere_prenom, pere_profession, pere_service, pere_telephone, pere_email, mere_nom, mere_prenom, mere_profession, mere_service, mere_telephone, mere_email, parent_nom, parent_prenom, parent_telephone, parent_email, quartier_ville, message, statut, classe_actuelle, dossier_token, sante_asthme, sante_cardiopathie, sante_diabete, sante_drepanocytose, sante_hta, sante_epilepsie, aptitude_sport"
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
          <TelechargerPdfButton id={p.id} />
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
            <Champ label="Ethnie" value={p.eleve_ethnie} />
            <Champ label="Religion" value={p.eleve_religion} />
            <Champ label="Téléphone domicile" value={p.eleve_telephone_domicile} />
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
                <Champ label="Service / Employeur" value={p.pere_service} />
                <Champ label="Téléphone" value={p.pere_telephone} />
                <Champ label="Email" value={p.pere_email} />
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
                <Champ label="Service / Employeur" value={p.mere_service} />
                <Champ label="Téléphone" value={p.mere_telephone} />
                <Champ label="Email" value={p.mere_email} />
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

      <div className="bg-white border border-neutral-200 rounded-lg p-5 mt-6">
        <h2 className="font-semibold text-primary-800 mb-4">Observations particulières</h2>

        <div className="mb-4">
          <dt className="text-xs font-semibold text-neutral-500 uppercase tracking-wide mb-2">
            Pathologies connues
          </dt>
          <div className="flex flex-wrap gap-2">
            {PATHOLOGIE_LABELS.filter(({ key }) => p[key]).length > 0 ? (
              PATHOLOGIE_LABELS.filter(({ key }) => p[key]).map(({ key, label }) => (
                <Badge key={key} label={label} color="red" />
              ))
            ) : (
              <span className="text-sm text-neutral-500">Aucune pathologie signalée</span>
            )}
          </div>
        </div>

        <div>
          <dt className="text-xs font-semibold text-neutral-500 uppercase tracking-wide mb-2">
            Aptitude au sport
          </dt>
          {p.aptitude_sport === true && <Badge label="Apte" color="green" />}
          {p.aptitude_sport === false && <Badge label="Inapte" color="red" />}
          {p.aptitude_sport === null && <Badge label="Non renseigné" color="gray" />}
        </div>
      </div>

      <DossierTokenSection dossierToken={p.dossier_token} />
    </div>
  );
}
