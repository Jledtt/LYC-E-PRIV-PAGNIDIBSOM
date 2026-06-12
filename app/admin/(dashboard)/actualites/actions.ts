"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createAuthClient } from "@/lib/supabase/server";
import { STATUTS_VALIDES } from "./statuts";
import { ALLOWED_IMAGE_TYPES, MAX_IMAGE_SIZE_BYTES } from "./image";

export type ActionResult = { success: true } | { success: false; error: string };

type AuthClient = Awaited<ReturnType<typeof createAuthClient>>;

// Défense en profondeur : RLS (is_admin()) protège déjà la table articles,
// mais on vérifie aussi le rôle ici pour renvoyer un message clair plutôt
// qu'une erreur RLS brute, et pour récupérer le display_name de l'auteur.
async function getAdminUser(
  supabase: AuthClient
): Promise<{ id: string; displayName: string | null } | null> {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, display_name")
    .eq("id", user.id)
    .maybeSingle();

  if (profile?.role !== "admin") return null;

  return { id: user.id, displayName: profile.display_name ?? null };
}

type UploadResult = { success: true; url: string } | { success: false; error: string };

async function uploadCoverImage(supabase: AuthClient, file: File, slug: string): Promise<UploadResult> {
  if (!ALLOWED_IMAGE_TYPES.includes(file.type as (typeof ALLOWED_IMAGE_TYPES)[number])) {
    return { success: false, error: "Format d'image non supporté (JPEG, PNG ou WebP uniquement)." };
  }

  if (file.size > MAX_IMAGE_SIZE_BYTES) {
    return { success: false, error: "Image trop volumineuse (5 Mo maximum)." };
  }

  const ext = file.name.split(".").pop() || "jpg";
  const path = `${slug}-${Date.now()}.${ext}`;

  const { error } = await supabase.storage.from("article-images").upload(path, file, {
    contentType: file.type,
    upsert: false,
  });

  if (error) {
    console.error("[admin/actualites] Erreur upload image :", error);
    return { success: false, error: "Erreur lors de l'envoi de l'image de couverture." };
  }

  const { data } = supabase.storage.from("article-images").getPublicUrl(path);
  return { success: true, url: data.publicUrl };
}

interface ArticleFormFields {
  title: string;
  slug: string;
  excerpt: string | null;
  content: string;
  status: string;
}

function readFormFields(formData: FormData): ArticleFormFields | { error: string } {
  const title = (formData.get("title") as string | null)?.trim() ?? "";
  const slug = (formData.get("slug") as string | null)?.trim() ?? "";
  const excerptRaw = (formData.get("excerpt") as string | null)?.trim() ?? "";
  const content = (formData.get("content") as string | null) ?? "";
  const status = (formData.get("status") as string | null) ?? "draft";

  if (!title) return { error: "Le titre est requis." };
  if (!slug) return { error: "Le slug est requis." };
  if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(slug)) {
    return { error: "Le slug ne doit contenir que des lettres minuscules, des chiffres et des tirets." };
  }
  if (!content.trim()) return { error: "Le contenu est requis." };
  if (!STATUTS_VALIDES.includes(status as (typeof STATUTS_VALIDES)[number])) {
    return { error: "Statut invalide." };
  }

  return { title, slug, excerpt: excerptRaw || null, content, status };
}

export async function createArticle(formData: FormData): Promise<ActionResult> {
  const supabase = await createAuthClient();

  const admin = await getAdminUser(supabase);
  if (!admin) {
    return { success: false, error: "Accès non autorisé." };
  }

  const fields = readFormFields(formData);
  if ("error" in fields) {
    return { success: false, error: fields.error };
  }

  let coverImageUrl: string | null = null;
  const file = formData.get("cover_image") as File | null;
  if (file && file.size > 0) {
    const uploadResult = await uploadCoverImage(supabase, file, fields.slug);
    if (!uploadResult.success) {
      return uploadResult;
    }
    coverImageUrl = uploadResult.url;
  }

  const { data, error } = await supabase
    .from("articles")
    .insert({
      slug: fields.slug,
      title: fields.title,
      excerpt: fields.excerpt,
      content: fields.content,
      cover_image_url: coverImageUrl,
      status: fields.status,
      published_at: fields.status === "published" ? new Date().toISOString() : null,
      author_id: admin.id,
      author_display_name: admin.displayName,
    })
    .select("id")
    .single();

  if (error) {
    if (error.code === "23505") {
      return { success: false, error: "Ce slug est déjà utilisé par un autre article." };
    }
    console.error("[admin/actualites] Erreur création article :", error);
    return { success: false, error: "Erreur lors de la création de l'article." };
  }

  revalidatePath("/admin/actualites");
  revalidatePath("/actualites");
  if (fields.status === "published") {
    revalidatePath(`/actualites/${fields.slug}`);
  }

  redirect(`/admin/actualites/${data.id}`);
}

export async function updateArticle(id: string, formData: FormData): Promise<ActionResult> {
  const supabase = await createAuthClient();

  const admin = await getAdminUser(supabase);
  if (!admin) {
    return { success: false, error: "Accès non autorisé." };
  }

  const { data: existing, error: fetchError } = await supabase
    .from("articles")
    .select("slug, cover_image_url, published_at")
    .eq("id", id)
    .maybeSingle();

  if (fetchError || !existing) {
    return { success: false, error: "Article introuvable." };
  }

  const fields = readFormFields(formData);
  if ("error" in fields) {
    return { success: false, error: fields.error };
  }

  let coverImageUrl = existing.cover_image_url as string | null;
  const file = formData.get("cover_image") as File | null;
  if (file && file.size > 0) {
    const uploadResult = await uploadCoverImage(supabase, file, fields.slug);
    if (!uploadResult.success) {
      return uploadResult;
    }
    coverImageUrl = uploadResult.url;
  } else if (formData.get("remove_cover_image") === "on") {
    coverImageUrl = null;
  }

  const { error } = await supabase
    .from("articles")
    .update({
      slug: fields.slug,
      title: fields.title,
      excerpt: fields.excerpt,
      content: fields.content,
      cover_image_url: coverImageUrl,
      status: fields.status,
      published_at:
        fields.status === "published" ? existing.published_at ?? new Date().toISOString() : existing.published_at,
    })
    .eq("id", id);

  if (error) {
    if (error.code === "23505") {
      return { success: false, error: "Ce slug est déjà utilisé par un autre article." };
    }
    console.error("[admin/actualites] Erreur mise à jour article :", error);
    return { success: false, error: "Erreur lors de la mise à jour de l'article." };
  }

  revalidatePath("/admin/actualites");
  revalidatePath("/actualites");
  revalidatePath(`/actualites/${existing.slug}`);
  if (fields.slug !== existing.slug) {
    revalidatePath(`/actualites/${fields.slug}`);
  }

  return { success: true };
}

export async function updateArticleStatus(id: string, status: string): Promise<ActionResult> {
  if (!STATUTS_VALIDES.includes(status as (typeof STATUTS_VALIDES)[number])) {
    return { success: false, error: "Statut invalide." };
  }

  const supabase = await createAuthClient();

  if (!(await getAdminUser(supabase))) {
    return { success: false, error: "Accès non autorisé." };
  }

  const { data: article, error: fetchError } = await supabase
    .from("articles")
    .select("slug, published_at")
    .eq("id", id)
    .maybeSingle();

  if (fetchError || !article) {
    return { success: false, error: "Article introuvable." };
  }

  const update: { status: string; published_at?: string } = { status };
  if (status === "published" && !article.published_at) {
    update.published_at = new Date().toISOString();
  }

  const { error } = await supabase.from("articles").update(update).eq("id", id);

  if (error) {
    console.error("[admin/actualites] Erreur changement de statut :", error);
    return { success: false, error: "Erreur lors du changement de statut." };
  }

  revalidatePath("/admin/actualites");
  revalidatePath("/actualites");
  revalidatePath(`/actualites/${article.slug}`);
  return { success: true };
}

export async function deleteArticle(id: string): Promise<ActionResult> {
  const supabase = await createAuthClient();

  if (!(await getAdminUser(supabase))) {
    return { success: false, error: "Accès non autorisé." };
  }

  const { data: article } = await supabase.from("articles").select("slug").eq("id", id).maybeSingle();

  const { error } = await supabase.from("articles").delete().eq("id", id);

  if (error) {
    console.error("[admin/actualites] Erreur suppression article :", error);
    return { success: false, error: "Erreur lors de la suppression de l'article." };
  }

  revalidatePath("/admin/actualites");
  revalidatePath("/actualites");
  if (article?.slug) {
    revalidatePath(`/actualites/${article.slug}`);
  }
  return { success: true };
}
