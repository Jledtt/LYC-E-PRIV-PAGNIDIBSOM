import { NextResponse, type NextRequest } from "next/server";
import { createAuthClient, createServerClient } from "@/lib/supabase/server";

/**
 * Callback OAuth Google (PKCE) pour l'espace parent. Google est l'unique
 * fournisseur d'authentification (pas d'inscription email/password) : le
 * profil 'parent' est créé ici, au premier login — jamais avant.
 */
export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");

  if (code) {
    const supabase = await createAuthClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error && data.user) {
      const serviceClient = createServerClient();
      const displayName =
        typeof data.user.user_metadata?.full_name === "string"
          ? data.user.user_metadata.full_name
          : typeof data.user.user_metadata?.name === "string"
            ? data.user.user_metadata.name
            : null;

      // ignoreDuplicates : ne touche pas à un profil déjà existant (ex.
      // compte admin) — n'insère que si aucune ligne ne correspond à id.
      const { error: profileError } = await serviceClient.from("profiles").upsert(
        { id: data.user.id, role: "parent", display_name: displayName },
        { onConflict: "id", ignoreDuplicates: true }
      );

      if (profileError) {
        console.error("[parent-callback] Erreur upsert profile :", profileError);
      }

      return NextResponse.redirect(new URL("/parent/rattacher", request.url));
    }

    console.error("[parent-callback] Erreur exchangeCodeForSession :", error);
  }

  return NextResponse.redirect(new URL("/parent/login", request.url));
}
