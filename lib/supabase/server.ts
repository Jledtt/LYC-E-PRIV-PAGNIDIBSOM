import { createClient } from "@supabase/supabase-js";

/**
 * Client Supabase côté serveur avec la clé service_role.
 * Ne jamais importer côté client.
 */
export function createServerClient() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    throw new Error(
      "Variables d'environnement manquantes : SUPABASE_URL et SUPABASE_SERVICE_ROLE_KEY sont requises."
    );
  }

  return createClient(url, key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}
