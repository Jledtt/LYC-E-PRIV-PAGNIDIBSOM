import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

/**
 * Rafraîchit la session Supabase (cookies) à chaque requête matchée par
 * middleware.ts (/admin/*, /parent/dashboard/*, /parent/rattacher/*) et
 * protège l'accès :
 *  - /admin/* : pas de session + route protégée -> redirect /admin/login ;
 *    session présente + /admin/login -> redirect /admin
 *  - /parent/dashboard/*, /parent/rattacher/* : pas de session -> redirect
 *    /parent/login (les autres routes /parent/* — login, inscription,
 *    callback — ne sont pas matchées, donc jamais interceptées ici)
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

  if (isAdminRoute) {
    if (!user && !isLoginPage) {
      const url = request.nextUrl.clone();
      url.pathname = "/admin/login";
      return NextResponse.redirect(url);
    }

    if (user && isLoginPage) {
      const url = request.nextUrl.clone();
      url.pathname = "/admin";
      return NextResponse.redirect(url);
    }
  }

  // /parent/dashboard/* et /parent/rattacher/* uniquement (cf. matcher dans
  // middleware.ts) : /parent/login, /parent/inscription et /parent/callback
  // ne passent jamais par ce middleware.
  if (pathname.startsWith("/parent") && !user) {
    const url = request.nextUrl.clone();
    url.pathname = "/parent/login";
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}
