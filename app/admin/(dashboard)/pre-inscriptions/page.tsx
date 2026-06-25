import type { Metadata } from "next";
import Link from "next/link";
import { createAuthClient } from "@/lib/supabase/server";
import StatusSelect from "./StatusSelect";

export const metadata: Metadata = {
  title: "Pré-inscriptions",
};

export const dynamic = "force-dynamic";

const PAGE_SIZE = 50;

interface PreInscriptionRow {
  id: string;
  created_at: string;
  eleve_nom: string;
  eleve_prenom: string;
  classe_souhaitee: string;
  serie: string | null;
  parent_nom: string;
  parent_prenom: string;
  parent_telephone: string;
  statut: string;
}

interface PageProps {
  searchParams: Promise<{ page?: string }>;
}

export default async function AdminPreInscriptionsPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const page = Math.max(1, Number(params.page) || 1);
  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  const supabase = await createAuthClient();

  const { data, count, error } = await supabase
    .from("pre_inscriptions")
    .select(
      "id, created_at, eleve_nom, eleve_prenom, classe_souhaitee, serie, parent_nom, parent_prenom, parent_telephone, statut",
      { count: "exact" }
    )
    .order("created_at", { ascending: false })
    .range(from, to);

  const rows = (data ?? []) as PreInscriptionRow[];
  const totalPages = count ? Math.max(1, Math.ceil(count / PAGE_SIZE)) : 1;

  return (
    <div>
      <h1 className="text-2xl font-bold text-primary-800 heading-serif mb-6">
        Pré-inscriptions
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
              <th className="px-4 py-3">Série</th>
              <th className="px-4 py-3">Parent</th>
              <th className="px-4 py-3">Téléphone</th>
              <th className="px-4 py-3">Statut</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100">
            {rows.map((row) => (
              <tr key={row.id}>
                <td className="px-4 py-3 whitespace-nowrap">
                  {new Date(row.created_at).toLocaleDateString("fr-FR")}
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <Link
                    href={`/admin/pre-inscriptions/${row.id}`}
                    className="text-primary-700 font-medium hover:underline"
                  >
                    {row.eleve_prenom} {row.eleve_nom}
                  </Link>
                </td>
                <td className="px-4 py-3 whitespace-nowrap">{row.classe_souhaitee}</td>
                <td className="px-4 py-3">{row.serie ?? "—"}</td>
                <td className="px-4 py-3 whitespace-nowrap">
                  {row.parent_prenom} {row.parent_nom}
                </td>
                <td className="px-4 py-3 whitespace-nowrap">{row.parent_telephone}</td>
                <td className="px-4 py-3">
                  <StatusSelect id={row.id} currentStatut={row.statut} />
                </td>
              </tr>
            ))}
            {rows.length === 0 && !error && (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-neutral-500">
                  Aucune pré-inscription pour le moment.
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
              href={`/admin/pre-inscriptions?page=${p}`}
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
