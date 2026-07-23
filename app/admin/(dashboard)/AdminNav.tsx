"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navLinks = [
  { href: "/admin", label: "Tableau de bord" },
  { href: "/admin/pre-inscriptions", label: "Pré-inscriptions" },
  { href: "/admin/dossiers", label: "Dossiers" },
  { href: "/admin/messages", label: "Messages" },
  { href: "/admin/actualites", label: "Actualités" },
  { href: "/admin/emploi-du-temps", label: "Emploi du temps" },
  { href: "/admin/calendrier-devoirs", label: "Calendrier devoirs" },
  { href: "/admin/notifications", label: "Notifications" },
  { href: "/admin/paiements", label: "Paiements à valider" },
  { href: "/admin/cartes-scolaires", label: "Cartes scolaires" },
];

// prefetch={false} sur ces 10 liens : par défaut Next.js prefetche tous les
// liens visibles au viewport, donc chaque rendu de ce bandeau (présent sur
// TOUTE page admin) déclenche jusqu'à 10 requêtes concurrentes traversant
// toutes middleware.ts. Si le JWT est proche de l'expiration, ces requêtes
// simultanées peuvent lire le même refresh token avant que le Set-Cookie de
// la première rotation n'ait atteint le navigateur -> détection de
// réutilisation côté Supabase -> révocation de session (déconnexions
// aléatoires observées en production).
export default function AdminNav() {
  const pathname = usePathname();

  return (
    <nav aria-label="Navigation administration" className="border-t border-primary-700">
      <div className="max-w-6xl mx-auto px-4 flex gap-1 overflow-x-auto">
        {navLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            prefetch={false}
            aria-current={pathname === link.href ? "page" : undefined}
            className={[
              "px-3 py-2.5 text-sm font-medium transition-colors whitespace-nowrap",
              pathname === link.href
                ? "text-white bg-primary-700"
                : "text-primary-100 hover:text-white hover:bg-primary-700",
            ].join(" ")}
          >
            {link.label}
          </Link>
        ))}
      </div>
    </nav>
  );
}
