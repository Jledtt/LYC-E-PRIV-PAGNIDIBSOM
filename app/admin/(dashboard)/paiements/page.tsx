import type { Metadata } from "next";
import { createAuthClient } from "@/lib/supabase/server";
import ValiderPaiementButton from "./ValiderPaiementButton";
import RejeterPaiementForm from "./RejeterPaiementForm";

export const metadata: Metadata = { title: "Paiements" };

export const dynamic = "force-dynamic";

const TYPE_FRAIS_LABELS: Record<string, string> = {
  frais_dossier: "Frais de dossier",
  frais_scolarite: "Frais de scolarité",
};

const MODE_PAIEMENT_LABELS: Record<string, string> = {
  virement_bancaire: "Virement bancaire",
  especes: "Espèces",
  mobile_money: "Mobile Money",
};

interface PaiementEnAttente {
  id: string;
  pre_inscription_id: string;
  type_frais: string;
  montant: number;
  mode_paiement: string;
  reference_virement: string | null;
  preuve_path: string;
  created_at: string;
  pre_inscriptions: {
    eleve_nom: string;
    eleve_prenom: string;
    classe_souhaitee: string;
    classe_actuelle: string | null;
  } | null;
}

function formatMontant(montant: number): string {
  return `${montant.toLocaleString("fr-FR")} FCFA`;
}

export default async function AdminPaiementsPage() {
  const supabase = await createAuthClient();

  const { data, error } = await supabase
    .from("paiements")
    .select(
      "id, pre_inscription_id, type_frais, montant, mode_paiement, reference_virement, preuve_path, created_at, pre_inscriptions(eleve_nom, eleve_prenom, classe_souhaitee, classe_actuelle)"
    )
    .eq("statut", "en_attente")
    .order("created_at", { ascending: true });

  if (error) {
    console.error("[admin/paiements] Erreur lecture paiements :", error);
  }

  const paiements = (data ?? []) as unknown as PaiementEnAttente[];

  // URL signée (1h) vers le justificatif — bucket "preuves-paiement" privé.
  const signedUrls = new Map<string, string>();
  await Promise.all(
    paiements.map(async (p) => {
      const { data: signed, error: signedError } = await supabase.storage
        .from("preuves-paiement")
        .createSignedUrl(p.preuve_path, 3600);
      if (!signedError && signed) {
        signedUrls.set(p.id, signed.signedUrl);
      }
    })
  );

  return (
    <div>
      <h1 className="text-2xl font-bold text-primary-800 heading-serif mb-2">Paiements</h1>
      <p className="text-neutral-500 text-sm mb-6">
        Virements déclarés par les parents, en attente de vérification sur le relevé bancaire.
      </p>

      {paiements.length === 0 ? (
        <p className="text-sm text-neutral-500 italic">Aucun paiement en attente de validation.</p>
      ) : (
        <div className="flex flex-col gap-4">
          {paiements.map((p) => {
            const eleve = p.pre_inscriptions;
            const classe = eleve?.classe_actuelle ?? eleve?.classe_souhaitee ?? "";
            return (
              <div
                key={p.id}
                className="bg-white border border-neutral-200 rounded-lg shadow-sm p-5 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4"
              >
                <div className="flex flex-col gap-1 text-sm">
                  <p className="font-semibold text-primary-800">
                    {eleve ? `${eleve.eleve_prenom} ${eleve.eleve_nom}` : "Élève inconnu"}
                    {classe ? ` — ${classe}` : ""}
                  </p>
                  <p className="text-neutral-700">
                    {TYPE_FRAIS_LABELS[p.type_frais] ?? p.type_frais} · {formatMontant(p.montant)}
                  </p>
                  <p className="text-neutral-500">
                    {MODE_PAIEMENT_LABELS[p.mode_paiement] ?? p.mode_paiement}
                    {p.reference_virement ? ` · Réf. ${p.reference_virement}` : ""}
                  </p>
                  <p className="text-neutral-400 text-xs">
                    Déclaré le {new Date(p.created_at).toLocaleDateString("fr-FR")}
                  </p>
                  {signedUrls.has(p.id) && (
                    <a
                      href={signedUrls.get(p.id)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary-700 font-semibold hover:underline mt-1 self-start"
                    >
                      Voir le justificatif →
                    </a>
                  )}
                </div>

                <div className="flex flex-col sm:items-end gap-2">
                  <div className="flex gap-2">
                    <ValiderPaiementButton paiementId={p.id} />
                    <RejeterPaiementForm paiementId={p.id} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
