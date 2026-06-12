import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { createPublicClient } from "@/lib/supabase/public";
import MarkdownContent from "@/components/MarkdownContent";

export const revalidate = 300;
export const dynamicParams = true;

interface PageProps {
  params: Promise<{ slug: string }>;
}

interface ArticleDetail {
  title: string;
  excerpt: string | null;
  content: string;
  cover_image_url: string | null;
  published_at: string | null;
  author_display_name: string | null;
}

async function getArticle(slug: string): Promise<ArticleDetail | null> {
  const supabase = createPublicClient();

  const { data, error } = await supabase
    .from("articles")
    .select("title, excerpt, content, cover_image_url, published_at, author_display_name")
    .eq("slug", slug)
    .eq("status", "published")
    .maybeSingle();

  if (error || !data) {
    return null;
  }

  return data;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const article = await getArticle(slug);

  if (!article) {
    return {};
  }

  return {
    title: article.title,
    description: article.excerpt ?? undefined,
    openGraph: {
      title: article.title,
      description: article.excerpt ?? undefined,
      images: article.cover_image_url ? [article.cover_image_url] : undefined,
    },
  };
}

export default async function ArticlePage({ params }: PageProps) {
  const { slug } = await params;
  const article = await getArticle(slug);

  if (!article) {
    notFound();
  }

  return (
    <>
      <section className="bg-primary-800 text-white py-12 px-4">
        <div className="max-w-3xl mx-auto">
          <Link href="/actualites" className="text-primary-200 text-sm hover:text-white">
            ← Retour aux actualités
          </Link>
          <h1
            className="text-3xl sm:text-4xl font-bold heading-serif mt-3 mb-2"
            style={{ fontFamily: "var(--font-lora), Georgia, serif" }}
          >
            {article.title}
          </h1>
          <p className="text-primary-200 text-sm">
            {article.published_at &&
              new Date(article.published_at).toLocaleDateString("fr-FR", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            {article.author_display_name && ` · ${article.author_display_name}`}
          </p>
        </div>
      </section>

      <article className="max-w-3xl mx-auto px-4 py-12">
        {article.cover_image_url && (
          <div className="relative h-64 sm:h-80 rounded-xl overflow-hidden mb-8">
            <Image
              src={article.cover_image_url}
              alt=""
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 768px"
              priority
            />
          </div>
        )}
        <MarkdownContent content={article.content} />
      </article>
    </>
  );
}
