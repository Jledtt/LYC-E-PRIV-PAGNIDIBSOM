import Link from "next/link";
import { siteConfig } from "@/config/site";
import LogoSvg from "@/components/ui/LogoSvg";

const footerNav = [
  { href: "/ecole", label: "L'École" },
  { href: "/formations", label: "Formations" },
  { href: "/admission", label: "Admission" },
  { href: "/tarifs", label: "Tarifs" },
  { href: "/pre-inscription", label: "Pré-inscription" },
  { href: "/contact", label: "Contact" },
  { href: "/actualites", label: "Actualités" },
];

const legalNav = [
  { href: "/mentions-legales", label: "Mentions légales" },
  { href: "/contact", label: "Nous contacter" },
];

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-primary-800 text-white mt-16">
      <div className="max-w-6xl mx-auto px-4 py-12 grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
        {/* Identité */}
        <div className="lg:col-span-2">
          <div className="flex items-center gap-2 mb-4">
            <LogoSvg className="w-9 h-9" />
            <span
              className="text-white font-bold text-xl heading-serif"
              style={{ fontFamily: "var(--font-lora), Georgia, serif" }}
            >
              {siteConfig.name}
            </span>
          </div>
          <p className="text-primary-100 text-sm leading-relaxed max-w-xs">
            {siteConfig.description}
          </p>
          {/* Réseaux sociaux */}
          <div className="flex gap-4 mt-5">
            <a
              href={siteConfig.social.facebook}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Facebook"
              className="text-primary-200 hover:text-white transition-colors"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987H7.898v-2.89h2.54V9.845c0-2.508 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.772-1.63 1.562v1.875h2.773l-.443 2.89h-2.33V21.88C18.343 21.128 22 16.99 22 12z" />
              </svg>
            </a>
            <a
              href={siteConfig.social.whatsapp}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="WhatsApp"
              className="text-primary-200 hover:text-white transition-colors"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
                <path d="M12 2C6.477 2 2 6.477 2 12c0 1.89.525 3.66 1.438 5.168L2 22l4.948-1.42A9.956 9.956 0 0012 22c5.523 0 10-4.477 10-10S17.523 2 12 2zm0 18a8 8 0 01-4.065-1.112l-.29-.172-3.014.865.847-3.082-.188-.302A8 8 0 1112 20z" />
              </svg>
            </a>
          </div>
        </div>

        {/* Liens du site */}
        <div>
          <h3 className="text-white font-semibold text-sm uppercase tracking-wide mb-4">
            Navigation
          </h3>
          <ul className="flex flex-col gap-2">
            {footerNav.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="text-primary-200 hover:text-white text-sm transition-colors"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Coordonnées */}
        <div>
          <h3 className="text-white font-semibold text-sm uppercase tracking-wide mb-4">
            Contact
          </h3>
          <address className="not-italic flex flex-col gap-3 text-sm text-primary-200">
            <p>{siteConfig.contact.address}</p>
            <a
              href={`tel:${siteConfig.contact.phone.replace(/\s/g, "")}`}
              className="hover:text-white transition-colors"
            >
              {siteConfig.contact.phone}
            </a>
            <a
              href={`tel:${siteConfig.contact.phoneAlt.replace(/\s/g, "")}`}
              className="hover:text-white transition-colors"
            >
              {siteConfig.contact.phoneAlt}
            </a>
            <a
              href={`mailto:${siteConfig.contact.email}`}
              className="hover:text-white transition-colors break-all"
            >
              {siteConfig.contact.email}
            </a>
          </address>
        </div>
      </div>

      {/* Bas de footer */}
      <div className="border-t border-primary-700">
        <div className="max-w-6xl mx-auto px-4 py-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-primary-300">
          <p>
            © {year} {siteConfig.fullName}. Tous droits réservés.
          </p>
          <nav aria-label="Liens légaux" className="flex gap-4">
            {legalNav.map((link) => (
              <Link key={link.href} href={link.href} className="hover:text-white transition-colors">
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </footer>
  );
}
