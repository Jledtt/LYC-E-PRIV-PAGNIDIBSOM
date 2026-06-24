import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getParentSession } from "@/lib/parent-session";
import { getParentDossiers } from "@/actions/parent-auth";

export const metadata: Metadata = { title: "Mon espace" };

export const dynamic = "force-dynamic";

const STATUT_PRE_INSCRIPTION_LABELS: Record<string, string> = {
  nouveau: "Nouveau",
  contacte: "Contacté",
  dossier_recu: "Dossier reçu",
  accepte: "Accepté",
  refuse: "Refusé",
};

const STATUT_PIECE_LABELS: Record<string, string> = {
  attendu: "En attente de dépôt",
  recu: "Reçu, à vérifier",
  valide: "Validé",
  a_refaire: "À refaire",
};

const STATUT_PIECE_BADGE_CLASSES: Record<string, string> = {
  attendu: "bg-neutral-100 text-neutral-600",
  recu: "bg-accent-100 text-accent-800",
  valide: "bg-green-100 text-green-700",
  a_refaire: "bg-red-50 text-red-700",
};

export default async function ParentDashboardPage() {
  const session = await getParentSession();
  if (!session) {
    redirect("/parent/login");
  }

  const dossiers = await getParentDossiers();
  if (dossiers.length === 0) {
    redirect("/parent/rattacher");
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-10 flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-bold text-primary-800 heading-serif">Mon espace</h1>
        <p className="text-neutral-500 text-sm mt-1">
          Suivi des dossiers d&rsquo;inscription rattachés à votre compte.
        </p>
      </div>

      {dossiers.map((d) => (
        <div
          key={d.preInscriptionId}
          className="bg-white border border-neutral-200 rounded-lg shadow-sm p-6 flex flex-col gap-4"
        >
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div>
              <h2 className="text-lg font-bold text-primary-800">
                {d.elevePrenom} {d.eleveNom}
              </h2>
              <p className="text-sm text-neutral-500">Classe souhaitée : {d.classeSouhaitee}</p>
            </div>
            <span className="inline-block text-xs font-medium px-2.5 py-1 rounded-full bg-primary-50 text-primary-700 self-start">
              {STATUT_PRE_INSCRIPTION_LABELS[d.statut] ?? d.statut}
            </span>
          </div>

          <div className="border-t border-neutral-200 pt-4">
            <h3 className="text-sm font-semibold text-neutral-800 mb-3">Pièces du dossier</h3>
            <ul className="flex flex-col gap-2">
              {d.pieces.map((p) => (
                <li key={p.pieceCode} className="flex items-center justify-between gap-3 text-sm">
                  <span className="text-neutral-700">{p.pieceLabel}</span>
                  <div className="flex items-center gap-2">
                    {p.motifRefus && <span className="text-xs text-red-600">{p.motifRefus}</span>}
                    <span
                      className={`text-xs font-medium px-2 py-1 rounded-full ${
                        STATUT_PIECE_BADGE_CLASSES[p.statut] ?? "bg-neutral-100 text-neutral-600"
                      }`}
                    >
                      {STATUT_PIECE_LABELS[p.statut] ?? p.statut}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          {d.dossierToken && (
            <Link
              href={`/mon-dossier/${d.dossierToken}`}
              className="self-start mt-2 text-sm font-semibold text-primary-700 underline"
            >
              Déposer ou consulter les pièces →
            </Link>
          )}
        </div>
      ))}
    </div>
  );
}
