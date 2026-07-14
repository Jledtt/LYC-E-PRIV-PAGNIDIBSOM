import { createBrowserClient } from "@supabase/ssr";

/**
 * Client Supabase côté navigateur (clé anon).
 * Réservé aux composants client du back-office (/admin) :
 * connexion (signInWithPassword), déconnexion, et lectures/écritures
 * passant par les policies RLS sous l'identité de l'utilisateur connecté.
 * Ne donne accès qu'à ce que les policies RLS autorisent — jamais de
 * clé service_role ici.
 */
export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    throw new Error(
      "Variables d'environnement manquantes : NEXT_PUBLIC_SUPABASE_URL et NEXT_PUBLIC_SUPABASE_ANON_KEY sont requises."
    );
  }

  // autoRefreshToken désactivé : ce client (singleton @supabase/ssr) reste
  // vivant en tâche de fond tant que l'onglet est ouvert. Son timer de
  // rafraîchissement entrait en course avec celui de middleware.ts (qui
  // rafraîchit déjà la session côté serveur à chaque requête protégée),
  // provoquant une révocation de session par la détection de réutilisation
  // de refresh token de Supabase (déconnexions aléatoires en production).
  return createBrowserClient(url, key, {
    auth: { autoRefreshToken: false },
  });
}
