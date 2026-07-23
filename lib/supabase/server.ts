import { cache } from "react";
import { createClient } from "@supabase/supabase-js";
import { createServerClient as createSupabaseServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

/**
 * Deux clients Supabase côté serveur, pour deux usages distincts :
 *
 * 1. createServerClient() — clé service_role, bypass RLS.
 *    Réservé aux Server Actions des formulaires PUBLICS
 *    (actions/pre-inscription.ts, actions/contact.ts). Ne JAMAIS
 *    l'utiliser pour le back-office /admin ni l'exposer côté client.
 *
 * 2. createAuthClient() — clé anon + session utilisateur (cookies).
 *    Réservé au back-office /admin (middleware, layouts, pages, server
 *    actions admin). Toutes les requêtes passent par les policies RLS :
 *    défense en profondeur même si une route admin fuit.
 *
 *    Enveloppé dans cache() de React (mémoïsation par requête, via
 *    l'AsyncLocalStorage de Next.js) : sans ça, chaque layout/page qui
 *    l'appelle crée sa propre instance indépendante, et getUser() déclenche
 *    un refresh dès que la session est expirée — indépendamment du flag
 *    autoRefreshToken, qui ne gate QUE le timer de fond côté navigateur
 *    (cf. GoTrueClient.__loadSession()). Deux instances non coordonnées qui
 *    tentent chacune ce refresh sur la même requête HTTP : la première
 *    réussit mais son cookie rafraîchi est perdu (setAll() no-op en Server
 *    Component, cf. plus bas) ; la seconde présente alors à Supabase un
 *    refresh token déjà consommé par la première -> détection de
 *    réutilisation -> révocation de toute la session. cache() garantit une
 *    seule instance donc au plus un seul getUser()/refresh par requête.
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

export const createAuthClient = cache(async function createAuthClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    throw new Error(
      "Variables d'environnement manquantes : NEXT_PUBLIC_SUPABASE_URL et NEXT_PUBLIC_SUPABASE_ANON_KEY sont requises."
    );
  }

  const cookieStore = await cookies();

  return createSupabaseServerClient(url, key, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        } catch {
          // setAll() peut être appelé depuis un Server Component, où
          // l'écriture de cookies est interdite. Sans effet ici car le
          // middleware se charge du rafraîchissement de session.
        }
      },
    },
  });
});
