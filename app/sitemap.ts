import type { MetadataRoute } from "next";
import { siteConfig } from "@/config/site";
import { createPublicClient } from "@/lib/supabase/public";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = siteConfig.url;
  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: base, lastModified: now, changeFrequency: "monthly", priority: 1 },
    { url: `${base}/ecole`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${base}/formations`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${base}/admission`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${base}/tarifs`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${base}/pre-inscription`, lastModified: now, changeFrequency: "monthly", priority: 0.9 },
    { url: `${base}/contact`, lastModified: now, changeFrequency: "yearly", priority: 0.7 },
    { url: `${base}/actualites`, lastModified: now, changeFrequency: "weekly", priority: 0.5 },
  ];

  const supabase = createPublicClient();
  const { data } = await supabase
    .from("articles")
    .select("slug, updated_at")
    .eq("status", "published")
    .order("published_at", { ascending: false });

  const articleRoutes: MetadataRoute.Sitemap = (data ?? []).map((article) => ({
    url: `${base}/actualites/${article.slug}`,
    lastModified: new Date(article.updated_at),
    changeFrequency: "monthly",
    priority: 0.6,
  }));

  return [...staticRoutes, ...articleRoutes];
}
