import type { Metadata } from "next";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: "Mentions légales — Pagnidibsom",
  description: "Mentions légales du site du collège-lycée Pagnidibsom.",
  robots: { index: false },
};

export default function MentionsLegalesPage() {
  return (
    <section className="max-w-3xl mx-auto px-4 py-14">
      <h1
        className="text-3xl font-bold text-primary-800 mb-8 heading-serif"
        style={{ fontFamily: "var(--font-lora), Georgia, serif" }}
      >
        Mentions légales
      </h1>

      <div className="prose prose-neutral max-w-none flex flex-col gap-8 text-neutral-700">
        <section>
          <h2 className="text-xl font-semibold text-neutral-800 mb-3">Éditeur du site</h2>
          <p>{siteConfig.fullName}</p>
          <p>{siteConfig.contact.address}</p>
          <p>
            Téléphone :{" "}
            <a href={`tel:${siteConfig.contact.phone.replace(/\s/g, "")}`} className="text-primary-700 hover:underline">
              {siteConfig.contact.phone}
            </a>
          </p>
          <p>
            Email :{" "}
            <a href={`mailto:${siteConfig.contact.email}`} className="text-primary-700 hover:underline">
              {siteConfig.contact.email}
            </a>
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-neutral-800 mb-3">Hébergement</h2>
          <p>Ce site est hébergé par Vercel Inc., 340 Pine Street, Suite 701, San Francisco, CA 94104, États-Unis.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-neutral-800 mb-3">Propriété intellectuelle</h2>
          <p>
            L'ensemble du contenu de ce site (textes, images, logos) est la propriété exclusive de{" "}
            {siteConfig.fullName}. Toute reproduction, même partielle, est interdite sans autorisation préalable.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-neutral-800 mb-3">Données personnelles</h2>
          <p>
            Les informations collectées via les formulaires de ce site sont utilisées uniquement dans le cadre de la
            gestion des inscriptions et des demandes de contact. Elles ne sont pas transmises à des tiers.
            Conformément aux lois en vigueur, vous disposez d'un droit d'accès, de rectification et de suppression
            de vos données en nous contactant à{" "}
            <a href={`mailto:${siteConfig.contact.email}`} className="text-primary-700 hover:underline">
              {siteConfig.contact.email}
            </a>
            .
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-neutral-800 mb-3">Cookies</h2>
          <p>Ce site n'utilise pas de cookies de traçage ou publicitaires.</p>
        </section>
      </div>
    </section>
  );
}
