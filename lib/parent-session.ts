import { cache } from "react";
import { createAuthClient } from "@/lib/supabase/server";

export interface ParentSession {
  userId: string;
  email: string | null;
  displayName: string | null;
}

/**
 * Vérifie la session Supabase ET le rôle 'parent' (table profiles).
 *
 * createAuthClient() est appelé À CHAQUE invocation de cette fonction (pas
 * de singleton) : il lit cookies() de next/headers au moment de l'appel,
 * donc reflète toujours les cookies de la requête en cours. Le cache()
 * React ci-dessous ne mémoïse PAS ce client entre requêtes HTTP — Next.js
 * scope cette mémoïsation par requête (AsyncLocalStorage) ; elle sert
 * uniquement à éviter d'appeler deux fois Supabase quand layout ET page
 * lisent la session sur un même rendu.
 */
export const getParentSession = cache(async function getParentSession(): Promise<ParentSession | null> {
  try {
    const supabase = await createAuthClient();

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    // Ne JAMAIS avaler cette erreur en silence : c'est le seul signal qui
    // distingue "pas de cookie de session du tout" (réponse locale
    // immédiate, aucun appel réseau Supabase) d'un vrai problème réseau/JWT.
    if (userError) {
      console.error("[parent-session] Erreur getUser() :", userError.message);
    }

    if (!user) return null;

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("role, display_name")
      .eq("id", user.id)
      .maybeSingle();

    if (profileError) {
      console.error("[parent-session] Erreur lecture profile :", profileError.message);
    }

    if (!profile || profile.role !== "parent") return null;

    return {
      userId: user.id,
      email: user.email ?? null,
      displayName: profile.display_name ?? null,
    };
  } catch (err) {
    console.error("[parent-session] Erreur inattendue :", err);
    return null;
  }
});
