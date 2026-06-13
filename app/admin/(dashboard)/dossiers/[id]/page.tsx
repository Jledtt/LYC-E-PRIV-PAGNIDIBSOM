import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { createAuthClient } from "@/lib/supabase/server";
import ValidatePieceButton from "../ValidatePieceButton";
import RefusePieceForm from "../RefusePieceForm";
import { STATUT_PIECE_LABELS, STATUT_PIECE_BADGE_CLASSES, STATUT_PRE_INSCRIPTION_LABELS } from "../statuts";

export const metadata: Metadata = {
  title: "Détail du dossier",
};

export const dynamic = "force-dynamic";

interface PieceType {
  code: string;
  label: string;
  description: string | null;
  depot_en_ligne: boolean;
  ordre: number;
}

interface DossierPiece {
  piece_code: string;
  statut: string;
  motif_refus: string | null;
  fichier_path: string | null;
}

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function AdminDossierDetailPage({ params }: PageProps) {
  const { id } = await params;
  const supabase = await createAuthClient();

  const { data: preInscription } = await supabase
    .from("pre_inscriptions")
    .select(
      "id, created_at, eleve_nom, eleve_prenom, classe_souhaitee, serie, parent_nom, parent_prenom, parent_telephone, parent_email, statut, dossier_token"
    )
    .eq("id", id)
    .maybeSingle();

  if (!preInscription || !preInscription.dossier_token) {
    notFound();
  }

  const { data: pieceTypesData } = await supabase
    .from("piece_types")
    .select("code, label, description, depot_en_ligne, ordre")
    .order("ordre", { ascending: true });

  const { data: dossierPiecesData } = await supabase
    .from("dossier_pieces")
    .select("piece_code, statut, motif_refus, fichier_path")
    .eq("pre_inscription_id", preInscription.id);

  const pieceTypes = (pieceTypesData ?? []) as PieceType[];
  const dossierPieces = (dossierPiecesData ?? []) as DossierPiece[];

  // URLs signées (300 s) pour les pièces déposées — générées côté serveur,
  // bucket "dossier-pieces" privé.
  const signedUrls = new Map<string, string>();
  await Promise.all(
    pieceTypes
      .filter((pt) => pt.depot_en_ligne)
      .map(async (pt) => {
        const piece = dossierPieces.find((dp) => dp.piece_code === pt.code);
        if (!piece?.fichier_path) return;
        const { data, error } = await supabase.storage
          .from("dossier-pieces")
          .createSignedUrl(piece.fichier_path, 300);
        if (!error && data) {
          signedUrls.set(pt.code, data.signedUrl);
        }
      })
  );

  const statutLabel = STATUT_PRE_INSCRIPTION_LABELS[preInscription.statut] ?? preInscription.statut;

  return (
    <div>
      <h1 className="text-2xl font-bold text-primary-800 heading-serif mb-2">
        {preInscription.eleve_prenom} {preInscription.eleve_nom}
      </h1>
      <p className="text-neutral-600 mb-6">
        {preInscription.classe_souhaitee}
        {preInscription.serie ? ` — série ${preInscription.serie}` : ""} · Demande du{" "}
        {new Date(preInscription.created_at).toLocaleDateString("fr-FR")}
      </p>

      <div className="bg-white border border-neutral-200 rounded-lg p-5 mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <p className="text-sm text-[#1F2937]">
          <span className="font-semibold">Parent :</span> {preInscription.parent_prenom}{" "}
          {preInscription.parent_nom} — {preInscription.parent_telephone}
          {preInscription.parent_email ? ` — ${preInscription.parent_email}` : ""}
        </p>
        <span className="inline-block px-3 py-1 rounded text-xs font-semibold bg-primary-50 text-primary-800 whitespace-nowrap">
          Statut pré-inscription : {statutLabel}
        </span>
      </div>

      <div className="flex flex-col gap-4">
        {pieceTypes.map((pieceType) => {
          const piece = dossierPieces.find((dp) => dp.piece_code === pieceType.code);
          const statut = piece?.statut ?? "attendu";
          const signedUrl = signedUrls.get(pieceType.code);

          return (
            <div key={pieceType.code} className="bg-white border border-neutral-200 rounded-lg p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h2 className="font-semibold text-primary-800">{pieceType.label}</h2>
                  {pieceType.description && (
                    <p className="text-sm text-neutral-600 mt-1">{pieceType.description}</p>
                  )}
                </div>

                {pieceType.depot_en_ligne && (
                  <span
                    className={[
                      "inline-block px-2 py-0.5 rounded text-xs font-medium whitespace-nowrap",
                      STATUT_PIECE_BADGE_CLASSES[statut] ?? "bg-neutral-100 text-neutral-600",
                    ].join(" ")}
                  >
                    {STATUT_PIECE_LABELS[statut] ?? statut}
                  </span>
                )}
              </div>

              {!pieceType.depot_en_ligne ? (
                <p className="mt-3 text-sm text-[#1F2937] bg-[#FFFDF8] border border-accent-200 rounded-lg p-3">
                  À apporter directement par la famille — aucun dépôt en ligne attendu.
                </p>
              ) : (
                <div className="mt-3 flex flex-wrap items-start gap-3">
                  {piece?.fichier_path &&
                    (signedUrl ? (
                      <a
                        href={signedUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-1.5 rounded text-sm font-medium text-primary-700 hover:bg-primary-50 transition-colors whitespace-nowrap"
                      >
                        Voir le fichier
                      </a>
                    ) : (
                      <p className="text-xs text-red-600">Lien du fichier indisponible.</p>
                    ))}

                  {statut === "recu" && (
                    <>
                      <ValidatePieceButton preInscriptionId={preInscription.id} pieceCode={pieceType.code} />
                      <RefusePieceForm preInscriptionId={preInscription.id} pieceCode={pieceType.code} />
                    </>
                  )}

                  {statut === "valide" && (
                    <RefusePieceForm preInscriptionId={preInscription.id} pieceCode={pieceType.code} />
                  )}

                  {statut === "a_refaire" && piece?.motif_refus && (
                    <p className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg p-3 w-full">
                      Motif communiqué au parent : {piece.motif_refus}
                    </p>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
