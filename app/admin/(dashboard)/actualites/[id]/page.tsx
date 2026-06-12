import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { createAuthClient } from "@/lib/supabase/server";
import ArticleForm from "../ArticleForm";

export const metadata: Metadata = {
  title: "Modifier l'article",
};

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EditArticlePage({ params }: PageProps) {
  const { id } = await params;
  const supabase = await createAuthClient();

  const { data: article } = await supabase
    .from("articles")
    .select("id, slug, title, excerpt, content, cover_image_url, status")
    .eq("id", id)
    .maybeSingle();

  if (!article) {
    notFound();
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-primary-800 heading-serif mb-6">Modifier l&rsquo;article</h1>
      <ArticleForm mode="edit" article={article} />
    </div>
  );
}
