import type { Metadata } from "next";
import Link from "next/link";
import { createAuthClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Dossiers d'inscription",
};

export const dynamic = "force-dynamic";

const PAGE_SIZE = 50;

interface DossierRow {
  id: string;
  created_at: string;
  eleve_nom: string;
  eleve_prenom: string;
  classe_souhaitee: string;
  serie: string | null;
  parent_nom: string;
  parent_prenom: string;
  parent_telephone: string;
}

interface PageProps {
  searchParams: Promise<{ page?: string }>;
}

export default async function AdminDossiersPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const page = Math.max(1, Number(params.page) || 1);
  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  const supabase = await createAuthClient();

  const { data, count, error } = await supabase
    .from("pre_inscriptions")
    .select(
      "id, created_at, eleve_nom, eleve_prenom, classe_souhaitee, serie, parent_nom, parent_prenom, parent_telephone",
      { count: "exact" }
    )
    .not("dossier_token", "is", null)
    .order("created_at", { ascending: false })
    .range(from, to);

  const rows = (data ?? []) as DossierRow[];
  const totalPages = count ? Math.max(1, Math.ceil(count / PAGE_SIZE)) : 1;

  // Compte des pièces "reçues, à vérifier" par dossier — une requête
  // groupée, regroupement client (volume faible actuellement).
  const aVerifierByDossier = new Map<string, number>();
  if (rows.length > 0) {
    const { data: pieces } = await supabase
      .from("dossier_pieces")
      .select("pre_inscription_id")
      .eq("statut", "recu")
      .in("pre_inscription_id", rows.map((r) => r.id));

    for (const piece of pieces ?? []) {
      aVerifierByDossier.set(
        piece.pre_inscription_id,
        (aVerifierByDossier.get(piece.pre_inscription_id) ?? 0) + 1
      );
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-primary-800 heading-serif mb-6">
        Dossiers d&apos;inscription
      </h1>

      {error && (
        <p
          role="alert"
          className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700 text-sm mb-4"
        >
          Erreur lors du chargement des données.
        </p>
      )}

      <div className="bg-white border border-neutral-200 rounded-lg shadow-sm overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="bg-neutral-50 text-neutral-600 uppercase text-xs">
            <tr>
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3">Élève</th>
              <th className="px-4 py-3">Classe</th>
              <th className="px-4 py-3">Parent</th>
              <th className="px-4 py-3">Téléphone</th>
              <th className="px-4 py-3">Pièces</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100">
            {rows.map((row) => {
              const aVerifier = aVerifierByDossier.get(row.id) ?? 0;
              return (
                <tr key={row.id}>
                  <td className="px-4 py-3 whitespace-nowrap">
                    {new Date(row.created_at).toLocaleDateString("fr-FR")}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    {row.eleve_prenom} {row.eleve_nom}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    {row.classe_souhaitee}
                    {row.serie ? ` (${row.serie})` : ""}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    {row.parent_prenom} {row.parent_nom}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">{row.parent_telephone}</td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    {aVerifier > 0 ? (
                      <span className="inline-block px-2 py-0.5 rounded text-xs font-semibold bg-accent-100 text-accent-800">
                        {aVerifier} pièce{aVerifier > 1 ? "s" : ""} à vérifier
                      </span>
                    ) : (
                      <span className="text-neutral-400 text-xs">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <Link
                      href={`/admin/dossiers/${row.id}`}
                      className="text-primary-700 hover:underline font-medium"
                    >
                      Ouvrir
                    </Link>
                  </td>
                </tr>
              );
            })}
            {rows.length === 0 && !error && (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-neutral-500">
                  Aucun dossier pour le moment.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <nav aria-label="Pagination" className="flex items-center justify-center gap-2 mt-6">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <Link
              key={p}
              href={`/admin/dossiers?page=${p}`}
              aria-current={p === page ? "page" : undefined}
              className={[
                "px-3 py-1.5 rounded text-sm font-medium transition-colors",
                p === page
                  ? "bg-primary-800 text-white"
                  : "bg-white border border-neutral-200 text-neutral-600 hover:bg-neutral-100",
              ].join(" ")}
            >
              {p}
            </Link>
          ))}
        </nav>
      )}
    </div>
  );
}
