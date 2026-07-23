import { createAuthClient } from "@/lib/supabase/server";

/**
 * Garde admin partagée des Server Actions du back-office (contexte RLS via
 * createAuthClient / cookies). Vérifie profiles.role === 'admin'.
 *
 * NB : les route handlers /api/pdf/* utilisent une variante distincte
 * (lib/pdf/route-auth.ts, retour Response HTTP) — contexte et contrat
 * différents, volontairement non fusionnés.
 */

export interface AdminIdentity {
  id: string;
  displayName: string | null;
}

/**
 * Identité admin (id + displayName) ou null si non authentifié / non-admin.
 * Crée son propre client : createAuthClient() est mémoïsé par cache() React
 * (une instance par requête), donc aucun getUser() dupliqué vs les appelants.
 */
export async function getAdminIdentity(): Promise<AdminIdentity | null> {
  const supabase = await createAuthClient();
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

/** Garde booléenne pour les cas qui n'ont besoin que du oui/non. */
export async function isAdmin(): Promise<boolean> {
  return (await getAdminIdentity()) !== null;
}
