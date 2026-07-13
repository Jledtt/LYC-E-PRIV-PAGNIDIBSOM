import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getParentSession } from "@/lib/parent-session";
import { getParentDossiers } from "@/actions/parent-auth";
import { createAuthClient } from "@/lib/supabase/server";
import { COORDONNEES_BANCAIRES } from "@/config/paiement";
import DeclarerVirementForm, { type EleveOption } from "./DeclarerVirementForm";

export const metadata: Metadata = { title: "Déclarer un paiement" };

export const dynamic = "force-dynamic";

const STATUT_LABELS: Record<string, string> = {
  en_attente: "En attente de vérification",
  valide: "Validé",
  rejete: "Rejeté",
};

const STATUT_BADGE_CLASSES: Record<string, string> = {
  en_attente: "bg-accent-100 text-accent-800",
  valide: "bg-green-100 text-green-700",
  rejete: "bg-red-50 text-red-700",
};

const TYPE_FRAIS_LABELS: Record<string, string> = {
  frais_dossier: "Frais de dossier",
  frais_scolarite: "Frais de scolarité",
};

function formatMontant(montant: number): string {
  return `${montant.toLocaleString("fr-FR")} FCFA`;
}

export default async function PaiementPage() {
  const session = await getParentSession();
  if (!session) {
    redirect("/parent/login");
  }

  const dossiers = await getParentDossiers();
  if (dossiers.length === 0) {
    redirect("/parent/rattacher");
  }

  const eleves: EleveOption[] = dossiers.map((d) => ({
    preInscriptionId: d.preInscriptionId,
    label: `${d.elevePrenom} ${d.eleveNom} (${d.classeActuelle ?? d.classeSouhaitee})`,
  }));

  const supabase = await createAuthClient();
  const { data: paiements, error } = await supabase
    .from("paiements")
    .select("id, pre_inscription_id, type_frais, montant, statut, commentaire_admin, created_at")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("[parent/paiement] Erreur lecture paiements :", error);
  }

  const dossierLabelParId = new Map(eleves.map((el) => [el.preInscriptionId, el.label]));

  return (
    <div className="max-w-3xl mx-auto px-4 py-10 flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-bold text-primary-800 heading-serif">
          Déclarer un paiement par virement
        </h1>
        <p className="text-neutral-500 text-sm mt-1">
          Effectuez votre virement auprès de votre banque, puis déclarez-le ci-dessous avec le
          justificatif correspondant. Notre équipe le validera après vérification sur notre
          relevé bancaire.
        </p>
      </div>

      {/* Coordonnées bancaires */}
      <div className="bg-white border border-neutral-200 rounded-lg shadow-sm p-6">
        <h2 className="text-sm font-semibold text-neutral-800 uppercase tracking-wide mb-4">
          Coordonnées bancaires du lycée
        </h2>
        <dl className="grid sm:grid-cols-2 gap-x-6 gap-y-3 text-sm">
          <div>
            <dt className="text-neutral-500">Banque</dt>
            <dd className="font-medium text-neutral-800">{COORDONNEES_BANCAIRES.banque}</dd>
          </div>
          <div>
            <dt className="text-neutral-500">Titulaire du compte</dt>
            <dd className="font-medium text-neutral-800">{COORDONNEES_BANCAIRES.titulaire}</dd>
          </div>
          <div>
            <dt className="text-neutral-500">IBAN</dt>
            <dd className="font-medium text-neutral-800 font-mono">{COORDONNEES_BANCAIRES.iban}</dd>
          </div>
          <div>
            <dt className="text-neutral-500">Code SWIFT / BIC</dt>
            <dd className="font-medium text-neutral-800 font-mono">{COORDONNEES_BANCAIRES.swift}</dd>
          </div>
          <div>
            <dt className="text-neutral-500">Numéro de compte</dt>
            <dd className="font-medium text-neutral-800 font-mono">
              {COORDONNEES_BANCAIRES.numeroCompte}
            </dd>
          </div>
          <div>
            <dt className="text-neutral-500">Type de compte</dt>
            <dd className="font-medium text-neutral-800">{COORDONNEES_BANCAIRES.typeCompte}</dd>
          </div>
          <div className="sm:col-span-2">
            <dt className="text-neutral-500">Adresse de la banque</dt>
            <dd className="font-medium text-neutral-800">{COORDONNEES_BANCAIRES.adresseBanque}</dd>
          </div>
        </dl>
      </div>

      {/* Formulaire de déclaration */}
      <div className="bg-white border border-neutral-200 rounded-lg shadow-sm p-6">
        <h2 className="text-sm font-semibold text-neutral-800 uppercase tracking-wide mb-4">
          Déclarer mon virement
        </h2>
        <DeclarerVirementForm eleves={eleves} />
      </div>

      {/* Historique des déclarations */}
      {paiements && paiements.length > 0 && (
        <div className="bg-white border border-neutral-200 rounded-lg shadow-sm p-6">
          <h2 className="text-sm font-semibold text-neutral-800 uppercase tracking-wide mb-4">
            Mes déclarations
          </h2>
          <ul className="flex flex-col gap-3">
            {paiements.map((p) => (
              <li
                key={p.id}
                className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-sm border-b border-neutral-100 pb-3 last:border-0 last:pb-0"
              >
                <div>
                  <p className="font-medium text-neutral-800">
                    {dossierLabelParId.get(p.pre_inscription_id) ?? "Élève"} —{" "}
                    {TYPE_FRAIS_LABELS[p.type_frais] ?? p.type_frais}
                  </p>
                  <p className="text-neutral-500">
                    {formatMontant(p.montant)} · déclaré le{" "}
                    {new Date(p.created_at).toLocaleDateString("fr-FR")}
                  </p>
                  {p.statut === "rejete" && p.commentaire_admin && (
                    <p className="text-xs text-red-600 mt-1">{p.commentaire_admin}</p>
                  )}
                </div>
                <span
                  className={[
                    "inline-block text-xs font-medium px-2.5 py-1 rounded-full self-start",
                    STATUT_BADGE_CLASSES[p.statut] ?? "bg-neutral-100 text-neutral-600",
                  ].join(" ")}
                >
                  {STATUT_LABELS[p.statut] ?? p.statut}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
