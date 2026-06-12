import type { Metadata } from "next";
import Link from "next/link";
import { createAuthClient } from "@/lib/supabase/server";
import PublishToggle from "./PublishToggle";
import DeleteArticleButton from "./DeleteArticleButton";

export const metadata: Metadata = {
  title: "Actualités",
};

export const dynamic = "force-dynamic";

const PAGE_SIZE = 50;

interface ArticleRow {
  id: string;
  slug: string;
  title: string;
  status: string;
  published_at: string | null;
  updated_at: string;
}

interface PageProps {
  searchParams: Promise<{ page?: string }>;
}

export default async function AdminActualitesPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const page = Math.max(1, Number(params.page) || 1);
  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  const supabase = await createAuthClient();

  const { data, count, error } = await supabase
    .from("articles")
    .select("id, slug, title, status, published_at, updated_at", { count: "exact" })
    .order("updated_at", { ascending: false })
    .range(from, to);

  const rows = (data ?? []) as ArticleRow[];
  const totalPages = count ? Math.max(1, Math.ceil(count / PAGE_SIZE)) : 1;

  return (
    <div>
      <div className="flex items-center justify-between gap-4 mb-6">
        <h1 className="text-2xl font-bold text-primary-800 heading-serif">Actualités</h1>
        <Link
          href="/admin/actualites/nouveau"
          className="bg-primary-800 hover:bg-primary-900 text-white text-sm font-medium px-4 py-2 rounded transition-colors whitespace-nowrap"
        >
          Nouvel article
        </Link>
      </div>

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
              <th className="px-4 py-3">Titre</th>
              <th className="px-4 py-3">Statut</th>
              <th className="px-4 py-3">Publié le</th>
              <th className="px-4 py-3">Mis à jour</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100">
            {rows.map((row) => (
              <tr key={row.id}>
                <td className="px-4 py-3 max-w-sm">
                  <Link
                    href={`/admin/actualites/${row.id}`}
                    className="text-primary-700 hover:underline font-medium"
                  >
                    {row.title}
                  </Link>
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <span
                    className={[
                      "inline-block px-2 py-0.5 rounded text-xs font-medium",
                      row.status === "published"
                        ? "bg-accent-100 text-accent-800"
                        : "bg-neutral-100 text-neutral-600",
                    ].join(" ")}
                  >
                    {row.status === "published" ? "Publié" : "Brouillon"}
                  </span>
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  {row.published_at ? new Date(row.published_at).toLocaleDateString("fr-FR") : "—"}
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  {new Date(row.updated_at).toLocaleDateString("fr-FR")}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/admin/actualites/${row.id}`}
                      className="px-3 py-1.5 rounded text-sm font-medium text-primary-700 hover:bg-primary-50 transition-colors whitespace-nowrap"
                    >
                      Modifier
                    </Link>
                    <PublishToggle id={row.id} status={row.status} />
                    <DeleteArticleButton id={row.id} title={row.title} />
                  </div>
                </td>
              </tr>
            ))}
            {rows.length === 0 && !error && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-neutral-500">
                  Aucun article pour le moment.
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
              href={`/admin/actualites?page=${p}`}
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
