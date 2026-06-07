import type { MetadataRoute } from "next";
import { siteConfig } from "@/config/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = siteConfig.url;
  const now = new Date();

  return [
    { url: base, lastModified: now, changeFrequency: "monthly", priority: 1 },
    { url: `${base}/ecole`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${base}/formations`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${base}/admission`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${base}/pre-inscription`, lastModified: now, changeFrequency: "monthly", priority: 0.9 },
    { url: `${base}/contact`, lastModified: now, changeFrequency: "yearly", priority: 0.7 },
    { url: `${base}/actualites`, lastModified: now, changeFrequency: "weekly", priority: 0.5 },
  ];
}
