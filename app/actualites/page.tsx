import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { createPublicClient } from "@/lib/supabase/public";

export const metadata: Metadata = {
  title: "Actualités",
  description:
    "Retrouvez les actualités, annonces et événements du Lycée Privé Pagnidibsom à Ouagadougou.",
};

interface ArticleSummary {
  slug: string;
  title: string;
  excerpt: string | null;
  cover_image_url: string | null;
  published_at: string | null;
}

async function getPublishedArticles(): Promise<ArticleSummary[]> {
  const supabase = createPublicClient();

  const { data, error } = await supabase
    .from("articles")
    .select("slug, title, excerpt, cover_image_url, published_at")
    .eq("status", "published")
    .order("published_at", { ascending: false });

  if (error) {
    console.error("[actualites] Erreur chargement des articles :", error);
    return [];
  }

  return data ?? [];
}

export default async function ActualitesPage() {
  const articles = await getPublishedArticles();

  return (
    <>
      <section className="bg-primary-800 text-white py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <h1
            className="text-3xl sm:text-4xl font-bold heading-serif mb-3"
            style={{ fontFamily: "var(--font-lora), Georgia, serif" }}
          >
            Actualités
          </h1>
        </div>
      </section>

      {articles.length === 0 ? (
        <section className="max-w-4xl mx-auto px-4 py-20 text-center flex flex-col items-center gap-6">
          <div
            className="w-20 h-20 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center text-4xl"
            aria-hidden="true"
          >
            🔔
          </div>
          <h2
            className="text-2xl font-bold text-primary-800 heading-serif"
            style={{ fontFamily: "var(--font-lora), Georgia, serif" }}
          >
            Bientôt disponible
          </h2>
          <p className="text-neutral-600 max-w-md">
            Notre espace d&rsquo;actualités est en cours de construction. Retrouvez bientôt nos
            annonces, événements et informations importantes.
          </p>
          <p className="text-sm text-neutral-500">
            En attendant, suivez-nous sur Facebook pour rester informé.
          </p>
        </section>
      ) : (
        <section className="max-w-5xl mx-auto px-4 py-14 sm:py-20">
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {articles.map((article) => (
              <article
                key={article.slug}
                className="bg-white border border-neutral-200 rounded-xl overflow-hidden flex flex-col"
              >
                {article.cover_image_url && (
                  <div className="relative h-48">
                    <Image
                      src={article.cover_image_url}
                      alt=""
                      fill
                      className="object-cover"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    />
                  </div>
                )}
                <div className="p-5 flex flex-col gap-2 flex-1">
                  {article.published_at && (
                    <p className="text-xs text-neutral-500">
                      {new Date(article.published_at).toLocaleDateString("fr-FR", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}
                    </p>
                  )}
                  <h2
                    className="text-lg font-bold text-primary-800 heading-serif"
                    style={{ fontFamily: "var(--font-lora), Georgia, serif" }}
                  >
                    <Link href={`/actualites/${article.slug}`} className="hover:underline">
                      {article.title}
                    </Link>
                  </h2>
                  {article.excerpt && (
                    <p className="text-sm text-neutral-600 line-clamp-3">{article.excerpt}</p>
                  )}
                  <Link
                    href={`/actualites/${article.slug}`}
                    className="text-sm text-primary-700 font-medium mt-auto hover:underline"
                  >
                    Lire la suite →
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </section>
      )}
    </>
  );
}
