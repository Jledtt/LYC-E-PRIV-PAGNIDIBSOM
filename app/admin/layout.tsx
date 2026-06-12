import type { Metadata } from "next";

/**
 * Layout racine de /admin : pas de logique d'auth ici (voir
 * app/admin/(dashboard)/layout.tsx pour la vérification du rôle, et
 * middleware.ts pour la vérification de session). Sert uniquement à
 * appliquer noindex/nofollow à tout le back-office, hérité par toutes
 * les pages enfants (login + dashboard).
 */
export const metadata: Metadata = {
  title: {
    default: "Administration",
    template: "%s | Administration — Pagnidibsom",
  },
  robots: {
    index: false,
    follow: false,
  },
};

export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
