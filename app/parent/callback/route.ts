import { createServerClient as createSsrClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@/lib/supabase/server";

/**
 * Callback OAuth Google (PKCE) pour l'espace parent. Google est l'unique
 * fournisseur d'authentification (pas d'inscription email/password) : le
 * profil 'parent' est créé ici, au premier login — jamais avant.
 *
 * La réponse de redirection est construite EN PREMIER, puis les cookies de
 * session sont écrits directement sur elle (response.cookies.set), même
 * pattern request+response que lib/supabase/middleware.ts. On évite
 * volontairement createAuthClient() (qui passe par cookies() de
 * next/headers) : une mutation via cookies() n'est pas garantie de se
 * propager sur un NextResponse.redirect() construit séparément, ce qui
 * provoquait la perte des cookies de session juste après ce callback.
 */
export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");

  if (code) {
    const response = NextResponse.redirect(new URL("/parent/rattacher", request.url));

    const supabase = createSsrClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) =>
              response.cookies.set(name, value, options)
            );
          },
        },
      }
    );

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

      return response;
    }

    console.error("[parent-callback] Erreur exchangeCodeForSession :", error);
  }

  return NextResponse.redirect(new URL("/parent/login", request.url));
}
