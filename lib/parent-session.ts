import { cache } from "react";
import { createAuthClient } from "@/lib/supabase/server";

export interface ParentSession {
  userId: string;
  email: string | null;
  displayName: string | null;
}

/**
 * Vérifie la session Supabase ET le rôle 'parent' (table profiles). Mis en
 * cache (React cache()) pour dédupliquer les appels entre layout et page
 * sur un même rendu serveur — le middleware ne vérifie que la présence
 * d'une session, pas le rôle (cf. lib/supabase/middleware.ts).
 */
export const getParentSession = cache(async function getParentSession(): Promise<ParentSession | null> {
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

  if (!profile || profile.role !== "parent") return null;

  return {
    userId: user.id,
    email: user.email ?? null,
    displayName: profile.display_name ?? null,
  };
});
