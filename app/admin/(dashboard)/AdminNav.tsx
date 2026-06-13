"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navLinks = [
  { href: "/admin", label: "Tableau de bord" },
  { href: "/admin/pre-inscriptions", label: "Pré-inscriptions" },
  { href: "/admin/dossiers", label: "Dossiers" },
  { href: "/admin/messages", label: "Messages" },
  { href: "/admin/actualites", label: "Actualités" },
];

export default function AdminNav() {
  const pathname = usePathname();

  return (
    <nav aria-label="Navigation administration" className="border-t border-primary-700">
      <div className="max-w-6xl mx-auto px-4 flex gap-1 overflow-x-auto">
        {navLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
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
