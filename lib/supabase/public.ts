import { createClient } from "@supabase/supabase-js";

/**
 * Client Supabase anonyme pour les lectures publiques côté serveur
 * (pages /actualites, sitemap...). Pas de cookies/session : uniquement les
 * lignes autorisées par les policies RLS pour le rôle anon (ex.
 * articles_public_select : status = 'published').
 */
export function createPublicClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    throw new Error(
      "Variables d'environnement manquantes : NEXT_PUBLIC_SUPABASE_URL et NEXT_PUBLIC_SUPABASE_ANON_KEY sont requises."
    );
  }

  return createClient(url, key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}
