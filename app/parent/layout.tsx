import type { Metadata } from "next";
import Link from "next/link";
import LogoSvg from "@/components/ui/LogoSvg";
import { getParentSession } from "@/lib/parent-session";
import { signOutParent } from "@/actions/parent-auth";

export const metadata: Metadata = {
  title: {
    default: "Espace Parent",
    template: "%s | Espace Parent — Pagnidibsom",
  },
  robots: { index: false, follow: false },
};

export default async function ParentLayout({ children }: { children: React.ReactNode }) {
  const session = await getParentSession();

  return (
    <div className="min-h-screen bg-neutral-50">
      <header className="bg-primary-800 text-white">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between gap-3">
          <Link
            href={session ? "/parent/dashboard" : "/parent/login"}
            className="flex items-center gap-2"
          >
            <LogoSvg className="w-8 h-8" />
            <span
              className="font-bold heading-serif text-base"
              style={{ fontFamily: "var(--font-lora), Georgia, serif" }}
            >
              Espace Parent — Pagnidibsom
            </span>
          </Link>

          {session && (
            <div className="flex items-center gap-4">
              <Link
                href="/parent/dashboard"
                className="text-sm font-medium text-primary-100 hover:text-white transition-colors"
              >
                Tableau de bord
              </Link>
              <form action={signOutParent}>
                <button
                  type="submit"
                  className="bg-primary-900 hover:bg-primary-700 text-white text-sm font-medium px-4 py-2 rounded transition-colors"
                >
                  Déconnexion
                </button>
              </form>
            </div>
          )}
        </div>
      </header>
      <div>{children}</div>
    </div>
  );
}
