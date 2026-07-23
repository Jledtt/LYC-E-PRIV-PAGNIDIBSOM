import { createAuthClient } from "@/lib/supabase/server";

/**
 * Gardes d'authentification des routes /api/pdf/*.
 *
 * Les cookies de session sont transmis par tous les appelants existants
 * (<a href> et window.open sont des navigations same-origin, le fetch du
 * sélecteur de cartes utilise credentials: same-origin par défaut) :
 * aucun changement côté client n'est nécessaire.
 *
 * Retour : une Response d'erreur à renvoyer telle quelle, ou null si OK.
 */

async function getSessionUser() {
  const supabase = await createAuthClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

/** 401 sans session, 403 si la session n'est pas admin (profiles.role). */
export async function requireAdminSession(): Promise<Response | null> {
  const user = await getSessionUser();
  if (!user) {
    return new Response("Authentification requise.", { status: 401 });
  }

  const supabase = await createAuthClient();
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  if (profile?.role !== "admin") {
    return new Response("Accès refusé.", { status: 403 });
  }
  return null;
}

/**
 * 401 sans session ; toute session authentifiée (admin ou parent) passe —
 * aligné sur les policies *_authenticated_select (qual=true) de
 * emploi_du_temps et calendrier_devoirs.
 */
export async function requireSession(): Promise<Response | null> {
  const user = await getSessionUser();
  if (!user) {
    return new Response("Authentification requise.", { status: 401 });
  }
  return null;
}
