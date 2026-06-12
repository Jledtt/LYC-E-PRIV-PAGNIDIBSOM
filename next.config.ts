import type { NextConfig } from "next";

// Hôte du bucket Supabase Storage (article-images), pour autoriser
// next/image à charger les couvertures d'articles depuis l'URL publique.
const supabaseHostname = process.env.NEXT_PUBLIC_SUPABASE_URL
  ? new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).hostname
  : undefined;

const nextConfig: NextConfig = {
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: supabaseHostname
      ? [
          {
            protocol: "https",
            hostname: supabaseHostname,
            pathname: "/storage/v1/object/public/**",
          },
        ]
      : [],
  },
  experimental: {
    serverActions: {
      // Relevé de 1mb : nécessaire pour l'upload des images de couverture
      // d'articles (max 5 Mo, cf. app/admin/(dashboard)/actualites/image.ts).
      bodySizeLimit: "6mb",
    },
  },
};

export default nextConfig;
