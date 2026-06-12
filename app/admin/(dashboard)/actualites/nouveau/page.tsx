import type { Metadata } from "next";
import ArticleForm from "../ArticleForm";

export const metadata: Metadata = {
  title: "Nouvel article",
};

export default function NewArticlePage() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-primary-800 heading-serif mb-6">Nouvel article</h1>
      <ArticleForm mode="create" />
    </div>
  );
}
