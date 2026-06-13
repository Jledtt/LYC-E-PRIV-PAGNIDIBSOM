import { getDossierByToken } from "@/lib/dossier-token";
import DossierInvalide from "./DossierInvalide";
import UploadPieceForm from "./UploadPieceForm";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ token: string }>;
}

export default async function MonDossierPage({ params }: PageProps) {
  const { token } = await params;
  const result = await getDossierByToken(token);

  if (result.status !== "valid") {
    return <DossierInvalide status={result.status} />;
  }

  const { dossier } = result;

  return (
    <>
      <section className="bg-primary-800 text-white py-10 sm:py-14 px-4">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-2xl sm:text-3xl font-bold heading-serif mb-2">
            Mon dossier d&apos;inscription
          </h1>
          <p className="text-primary-200">
            {dossier.elevePrenom} {dossier.eleveNom} — {dossier.classeSouhaitee}
            {dossier.serie ? ` (série ${dossier.serie})` : ""}
          </p>
        </div>
      </section>

      <section className="max-w-2xl mx-auto px-4 py-10 sm:py-14">
        <p className="text-neutral-600 mb-8">
          Voici la liste des pièces nécessaires à votre dossier d&apos;inscription. Pour les pièces
          marquées « à déposer en ligne », vous pouvez envoyer une photo ou un PDF directement
          ci-dessous.
        </p>

        <div className="flex flex-col gap-5">
          {dossier.pieceTypes.map((pieceType) => {
            const piece = dossier.dossierPieces.find((p) => p.piece_code === pieceType.code);
            const statut = piece?.statut ?? "attendu";

            return (
              <div key={pieceType.code} className="border border-neutral-200 rounded-lg p-5 bg-white">
                <h2 className="font-semibold text-primary-800">{pieceType.label}</h2>
                {pieceType.description && (
                  <p className="text-sm text-neutral-600 mt-1">{pieceType.description}</p>
                )}

                {!pieceType.depot_en_ligne ? (
                  <p className="mt-3 text-sm text-[#1F2937] bg-[#FFFDF8] border border-accent-200 rounded-lg p-3">
                    Cette pièce est à apporter directement à l&apos;établissement.
                  </p>
                ) : statut === "valide" ? (
                  <p className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-green-700">
                    <span aria-hidden="true">✓</span> Validé
                  </p>
                ) : statut === "recu" ? (
                  <p className="mt-3 text-sm font-semibold text-accent-600">
                    Reçu, en cours de vérification
                  </p>
                ) : (
                  <>
                    {statut === "a_refaire" && piece?.motif_refus && (
                      <p
                        role="alert"
                        className="mt-3 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg p-3"
                      >
                        À corriger : {piece.motif_refus}
                      </p>
                    )}
                    <div className="mt-3">
                      <UploadPieceForm token={token} pieceCode={pieceType.code} pieceLabel={pieceType.label} />
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>
      </section>
    </>
  );
}
