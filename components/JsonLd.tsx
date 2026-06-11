import { siteConfig } from "@/config/site";

const schema = {
  "@context": "https://schema.org",
  "@type": "EducationalOrganization",
  name: siteConfig.fullName,
  alternateName: siteConfig.sigle,
  slogan: siteConfig.tagline,
  foundingDate: "2021-10",
  url: siteConfig.url,
  // TODO Phase 2 : créer /public/logo.png (512×512, fond transparent) et décommenter
  // logo: `${siteConfig.url}/logo.png`,
  email: siteConfig.contact.email,
  telephone: [
    siteConfig.contact.phone.replace(/\s/g, ""),
    siteConfig.contact.phoneAlt.replace(/\s/g, ""),
  ],
  address: {
    "@type": "PostalAddress",
    streetAddress: "Quartier Sondogo, Secteur 32",
    addressLocality: "Ouagadougou",
    addressRegion: "Centre",
    addressCountry: "BF",
    postOfficeBoxNumber: siteConfig.contact.bp,
  },
  contactPoint: [
    {
      "@type": "ContactPoint",
      telephone: siteConfig.contact.phone.replace(/\s/g, ""),
      contactType: "Admissions",
      areaServed: "BF",
      availableLanguage: "fr",
    },
    {
      "@type": "ContactPoint",
      telephone: siteConfig.contact.phoneAlt.replace(/\s/g, ""),
      contactType: "Service client",
      areaServed: "BF",
      availableLanguage: "fr",
    },
  ],
};

export function SchoolJsonLd() {
  // Échappe <, > et & pour prévenir toute injection hors du bloc <script>
  const safeJson = JSON.stringify(schema)
    .replace(/</g, "\\u003c")
    .replace(/>/g, "\\u003e")
    .replace(/&/g, "\\u0026");

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: safeJson }}
    />
  );
}
