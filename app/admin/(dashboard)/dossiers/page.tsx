import type { Metadata } from "next";
import Link from "next/link";
import { createAuthClient } from "@/lib/supabase/server";
import DossiersList from "./DossiersList";

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

  const rowsWithCounts = rows.map((row) => ({
    ...row,
    aVerifier: aVerifierByDossier.get(row.id) ?? 0,
  }));

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

      {!error && <DossiersList rows={rowsWithCounts} />}

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
