"use client";

import { useState, useTransition } from "react";
import FormField, { inputClasses } from "@/components/ui/FormField";
import MarkdownContent from "@/components/MarkdownContent";
import { slugify } from "@/lib/slugify";
import { ALLOWED_IMAGE_TYPES } from "./image";
import { createArticle, updateArticle, type ActionResult } from "./actions";

interface ArticleData {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  content: string;
  cover_image_url: string | null;
  status: string;
}

interface ArticleFormProps {
  mode: "create" | "edit";
  article?: ArticleData;
}

export default function ArticleForm({ mode, article }: ArticleFormProps) {
  const [isPending, startTransition] = useTransition();
  const [result, setResult] = useState<ActionResult | null>(null);
  const [success, setSuccess] = useState(false);

  const [title, setTitle] = useState(article?.title ?? "");
  const [slug, setSlug] = useState(article?.slug ?? "");
  // En édition, on ne fait jamais suivre le slug au titre automatiquement :
  // changer le slug d'un article existant casse son URL publique.
  const [slugEdited, setSlugEdited] = useState(mode === "edit");
  const [excerpt, setExcerpt] = useState(article?.excerpt ?? "");
  const [content, setContent] = useState(article?.content ?? "");
  const [showPreview, setShowPreview] = useState(false);
  const [coverPreview, setCoverPreview] = useState<string | null>(article?.cover_image_url ?? null);
  const [removeCover, setRemoveCover] = useState(false);

  const isPublished = (article?.status ?? "draft") === "published";

  function handleTitleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const value = e.target.value;
    setTitle(value);
    if (!slugEdited) {
      setSlug(slugify(value));
    }
  }

  function handleSlugChange(e: React.ChangeEvent<HTMLInputElement>) {
    setSlugEdited(true);
    setSlug(e.target.value);
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      setCoverPreview(URL.createObjectURL(file));
      setRemoveCover(false);
    }
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const submitter = (e.nativeEvent as SubmitEvent).submitter as HTMLButtonElement | null;
    const status = submitter?.value === "published" ? "published" : article?.status ?? "draft";

    const formData = new FormData(form);
    formData.set("status", status);
    if (removeCover) {
      formData.set("remove_cover_image", "on");
    }

    setResult(null);
    setSuccess(false);
    startTransition(async () => {
      const res =
        mode === "create" ? await createArticle(formData) : await updateArticle(article!.id, formData);
      if (!res.success) {
        setResult(res);
      } else {
        setSuccess(true);
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5 max-w-3xl">
      {result && !result.success && (
        <div role="alert" className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700 text-sm">
          {result.error}
        </div>
      )}
      {success && (
        <div role="status" className="bg-green-50 border border-green-200 rounded-lg p-4 text-green-700 text-sm">
          Modifications enregistrées.
        </div>
      )}

      <FormField id="title" label="Titre" required>
        <input
          id="title"
          name="title"
          type="text"
          required
          value={title}
          onChange={handleTitleChange}
          className={inputClasses}
        />
      </FormField>

      <FormField id="slug" label="Slug" required hint="Utilisé dans l'URL publique : /actualites/...">
        <input
          id="slug"
          name="slug"
          type="text"
          required
          value={slug}
          onChange={handleSlugChange}
          className={inputClasses}
        />
      </FormField>

      <FormField id="excerpt" label="Extrait" hint="Résumé court affiché dans la liste des actualités (facultatif)">
        <textarea
          id="excerpt"
          name="excerpt"
          rows={2}
          value={excerpt}
          onChange={(e) => setExcerpt(e.target.value)}
          className={inputClasses}
        />
      </FormField>

      <FormField id="cover_image" label="Image de couverture" hint="JPEG, PNG ou WebP, 5 Mo maximum (facultatif)">
        <input
          id="cover_image"
          name="cover_image"
          type="file"
          accept={ALLOWED_IMAGE_TYPES.join(",")}
          onChange={handleFileChange}
          className={inputClasses}
        />
      </FormField>

      {coverPreview && !removeCover && (
        <div className="flex flex-col gap-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={coverPreview}
            alt=""
            className="rounded-lg max-h-48 object-cover border border-neutral-200"
          />
          {mode === "edit" && article?.cover_image_url && (
            <label className="flex items-center gap-2 text-sm text-neutral-600">
              <input
                type="checkbox"
                checked={removeCover}
                onChange={(e) => {
                  setRemoveCover(e.target.checked);
                  if (e.target.checked) setCoverPreview(null);
                }}
              />
              Supprimer l&rsquo;image de couverture
            </label>
          )}
        </div>
      )}

      <div className="flex flex-col gap-1.5">
        <div className="flex items-center justify-between">
          <label htmlFor="content" className="text-sm font-medium text-neutral-800">
            Contenu (Markdown)
            <span className="text-red-600 ml-0.5" aria-hidden="true">
              *
            </span>
          </label>
          <button
            type="button"
            onClick={() => setShowPreview((v) => !v)}
            className="text-sm text-primary-700 hover:underline"
          >
            {showPreview ? "Revenir à l'édition" : "Aperçu"}
          </button>
        </div>
        {showPreview ? (
          <div className="border border-neutral-300 rounded px-4 py-3 bg-white min-h-64">
            <MarkdownContent content={content} />
          </div>
        ) : (
          <textarea
            id="content"
            name="content"
            rows={16}
            required
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className={`${inputClasses} font-mono`}
          />
        )}
      </div>

      <div className="flex flex-wrap gap-3">
        <button
          type="submit"
          value={mode === "create" ? "draft" : article?.status ?? "draft"}
          disabled={isPending}
          className="bg-white border-2 border-primary-800 text-primary-800 hover:bg-primary-50 disabled:opacity-50 font-semibold px-5 py-2.5 rounded transition-colors"
        >
          {mode === "create" ? "Enregistrer comme brouillon" : "Enregistrer"}
        </button>
        {!isPublished && (
          <button
            type="submit"
            value="published"
            disabled={isPending}
            className="bg-primary-800 hover:bg-primary-900 disabled:opacity-50 text-white font-semibold px-5 py-2.5 rounded transition-colors"
          >
            {mode === "create" ? "Publier" : "Enregistrer et publier"}
          </button>
        )}
      </div>
    </form>
  );
}
