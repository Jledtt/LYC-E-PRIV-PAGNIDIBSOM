import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

/**
 * Rafraîchit la session Supabase (cookies) à chaque requête matchée par
 * middleware.ts (/admin/*, /parent/dashboard/*, /parent/rattacher/*) et
 * protège l'accès :
 *  - /admin/* : pas de session + route protégée -> redirect /admin/login ;
 *    session présente + /admin/login -> redirect /admin
 *  - /parent/dashboard/*, /parent/rattacher/* : pas de session -> redirect
 *    /parent/login (les autres routes /parent/* — login, callback — ne
 *    sont pas matchées, donc jamais interceptées ici)
 *
 * La vérification du RÔLE (admin ou parent, table profiles) se fait plus
 * bas dans l'arbre (app/admin/(dashboard)/layout.tsx, lib/parent-session.ts) :
 * ce middleware ne vérifie que la présence d'une session valide, pour
 * rester léger sur toutes les routes protégées.
 */
export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;
  const isAdminRoute = pathname.startsWith("/admin");
  const isLoginPage = pathname === "/admin/login";
  // Pages admin accessibles sans session (réinitialisation mot de passe)
  const isAdminPublicPage =
    isLoginPage ||
    pathname === "/admin/mot-de-passe-oublie" ||
    pathname === "/admin/reinitialiser-mot-de-passe";

  // Toute redirection doit repartir de supabaseResponse (pas d'un
  // NextResponse.redirect() "nu") : c'est lui qui porte les éventuels
  // Set-Cookie écrits par setAll() ci-dessus (rafraîchissement de session).
  // Construire une redirection à côté sans copier ces cookies les perdrait
  // silencieusement — cf. avertissement officiel @supabase/ssr.
  function redirect(targetPath: string) {
    const url = request.nextUrl.clone();
    url.pathname = targetPath;
    const response = NextResponse.redirect(url);
    supabaseResponse.cookies.getAll().forEach((cookie) => {
      response.cookies.set(cookie);
    });
    return response;
  }

  if (isAdminRoute) {
    if (!user && !isAdminPublicPage) {
      return redirect("/admin/login");
    }

    if (user && isLoginPage) {
      return redirect("/admin");
    }
  }

  // /parent/dashboard/* et /parent/rattacher/* uniquement (cf. matcher dans
  // middleware.ts) : /parent/login et /parent/callback ne passent jamais
  // par ce middleware.
  if (pathname.startsWith("/parent") && !user) {
    return redirect("/parent/login");
  }

  return supabaseResponse;
}
