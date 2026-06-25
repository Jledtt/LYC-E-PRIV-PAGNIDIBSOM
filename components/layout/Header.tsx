"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { siteConfig } from "@/config/site";
import LogoSvg from "@/components/ui/LogoSvg";

const navLinks = [
  { href: "/", label: "Accueil" },
  { href: "/ecole", label: "L'École" },
  { href: "/formations", label: "Formations" },
  { href: "/admission", label: "Admission" },
  { href: "/actualites", label: "Actualités" },
  { href: "/contact", label: "Contact" },
];

export default function Header() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-neutral-200 shadow-sm">
      <div className="max-w-6xl mx-auto px-4 flex items-center justify-between h-16">
        {/* Logo */}
        <Link
          href="/"
          className="flex items-center gap-2 shrink-0"
          aria-label={`${siteConfig.fullName} — Accueil`}
        >
          <LogoSvg className="w-9 h-9" />
          <span
            className="hidden sm:block text-primary-800 font-bold text-lg leading-tight heading-serif"
            style={{ fontFamily: "var(--font-lora), Georgia, serif" }}
          >
            {siteConfig.name}
          </span>
        </Link>

        {/* Navigation desktop */}
        <nav aria-label="Navigation principale" className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={[
                "px-3 py-2 rounded text-sm font-medium transition-colors",
                pathname === link.href
                  ? "text-primary-700 bg-primary-50"
                  : "text-neutral-600 hover:text-primary-700 hover:bg-neutral-100",
              ].join(" ")}
              aria-current={pathname === link.href ? "page" : undefined}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* CTA desktop */}
        <div className="hidden md:flex items-center gap-3">
          <Link
            href="/parent/login"
            className="text-sm font-medium text-neutral-600 hover:text-primary-700 transition-colors"
          >
            Espace Parent
          </Link>
          <Link
            href="/pre-inscription"
            className="inline-block bg-accent-500 hover:bg-accent-600 text-neutral-900 text-sm font-bold px-4 py-2 rounded transition-colors"
          >
            Pré-inscription
          </Link>
        </div>

        {/* Burger mobile */}
        <button
          type="button"
          aria-label={menuOpen ? "Fermer le menu" : "Ouvrir le menu"}
          aria-expanded={menuOpen}
          aria-controls="mobile-menu"
          onClick={() => setMenuOpen((v) => !v)}
          className="md:hidden flex flex-col justify-center items-center w-10 h-10 gap-1.5 rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-600"
        >
          <span
            className={`block h-0.5 w-6 bg-neutral-700 transition-transform duration-200 ${menuOpen ? "translate-y-2 rotate-45" : ""}`}
          />
          <span
            className={`block h-0.5 w-6 bg-neutral-700 transition-opacity duration-200 ${menuOpen ? "opacity-0" : ""}`}
          />
          <span
            className={`block h-0.5 w-6 bg-neutral-700 transition-transform duration-200 ${menuOpen ? "-translate-y-2 -rotate-45" : ""}`}
          />
        </button>
      </div>

      {/* Menu mobile */}
      {menuOpen && (
        <div
          id="mobile-menu"
          role="dialog"
          aria-label="Menu de navigation"
          className="md:hidden border-t border-neutral-200 bg-white pb-4"
        >
          <nav className="flex flex-col px-4 pt-2 gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className={[
                  "px-3 py-3 rounded text-base font-medium transition-colors",
                  pathname === link.href
                    ? "text-primary-700 bg-primary-50"
                    : "text-neutral-700 hover:text-primary-700 hover:bg-neutral-100",
                ].join(" ")}
                aria-current={pathname === link.href ? "page" : undefined}
              >
                {link.label}
              </Link>
            ))}
            <Link
              href="/parent/login"
              onClick={() => setMenuOpen(false)}
              className="mt-2 text-center text-primary-700 font-medium px-4 py-2.5 rounded border border-primary-200 hover:bg-primary-50 transition-colors"
            >
              Espace Parent
            </Link>
            <Link
              href="/pre-inscription"
              onClick={() => setMenuOpen(false)}
              className="mt-2 text-center bg-accent-500 hover:bg-accent-600 text-neutral-900 font-bold px-4 py-3 rounded transition-colors"
            >
              Pré-inscription
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
