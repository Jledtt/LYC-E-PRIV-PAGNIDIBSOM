import { NextResponse, type NextRequest } from "next/server";
import { createAuthClient, createServerClient } from "@/lib/supabase/server";

/**
 * Callback de confirmation d'email Supabase (PKCE) pour l'inscription
 * parent. À la différence du back-office /admin (profils créés à la main),
 * le profil 'parent' est créé ici, une fois l'email confirmé — jamais avant
 * (cf. actions/parent-auth.ts -> registerParent).
 */
export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");

  if (code) {
    const supabase = await createAuthClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error && data.user) {
      const serviceClient = createServerClient();
      const displayName =
        typeof data.user.user_metadata?.display_name === "string"
          ? data.user.user_metadata.display_name
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
