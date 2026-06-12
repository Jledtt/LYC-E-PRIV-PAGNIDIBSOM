import { redirect } from "next/navigation";
import { createAuthClient } from "@/lib/supabase/server";
import { signOut } from "@/app/admin/actions";
import AdminNav from "./AdminNav";

/**
 * Coquille du back-office (bandeau + navigation + déconnexion) et
 * vérification du RÔLE admin.
 *
 * Ce layout ne couvre PAS /admin/login (route séparée, hors du groupe
 * (dashboard)) : ainsi un utilisateur sans profil admin redirigé vers
 * /admin/login n'entre jamais dans une boucle de redirection avec ce
 * layout.
 *
 * Le middleware (lib/supabase/middleware.ts) garantit déjà la présence
 * d'une session avant d'arriver ici ; le `redirect` ci-dessous est une
 * sécurité supplémentaire (défense en profondeur).
 */
export default async function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createAuthClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/admin/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, display_name")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile || profile.role !== "admin") {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-neutral-50 px-4">
        <div className="max-w-sm w-full bg-white border border-neutral-200 rounded-lg shadow-sm p-8 text-center">
          <h1 className="text-lg font-bold text-primary-800 mb-2">Accès non autorisé</h1>
          <p className="text-sm text-neutral-600 mb-6">
            Ce compte n&rsquo;a pas accès au back-office. Contactez l&rsquo;administrateur du site.
          </p>
          <form action={signOut}>
            <button
              type="submit"
              className="bg-primary-800 hover:bg-primary-900 text-white text-sm font-medium px-4 py-2 rounded transition-colors"
            >
              Déconnexion
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-neutral-50">
      <header className="bg-primary-800 text-white">
        <div className="max-w-6xl mx-auto px-4 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <p className="font-bold heading-serif text-lg">
              Administration — Lycée Privé Pagnidibsom
            </p>
            <p className="text-sm text-primary-100">{profile.display_name ?? user.email}</p>
          </div>
          <form action={signOut}>
            <button
              type="submit"
              className="bg-primary-900 hover:bg-primary-700 text-white text-sm font-medium px-4 py-2 rounded transition-colors"
            >
              Déconnexion
            </button>
          </form>
        </div>
        <AdminNav />
      </header>
      <div className="max-w-6xl mx-auto px-4 py-8">{children}</div>
    </div>
  );
}
