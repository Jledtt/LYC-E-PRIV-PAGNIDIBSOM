import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { siteConfig } from "@/config/site";
import { accueilContent as c } from "@/content/accueil";
import { admissionContent as a } from "@/content/admission";
import Button from "@/components/ui/Button";

export const metadata: Metadata = {
  title: {
    absolute: "Lycée Privé Pagnidibsom — Bâtir l'Excellence | Ouagadougou",
  },
  description:
    "Lycée privé à Ouagadougou, Secteur 32 — Enseignement Général (6e à 1re, séries A et C) et Technique (BEP Génie Civil, BEP Électrotechnique). 100 % de réussite au BEPC 2025. Inscriptions ouvertes.",
  openGraph: {
    title: "Lycée Privé Pagnidibsom — Bâtir l'Excellence",
    description:
      "Lycée privé à Ouagadougou, Secteur 32 — Enseignement Général et Technique. 100 % de réussite au BEPC 2025.",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "EducationalOrganization",
  name: siteConfig.fullName,
  alternateName: siteConfig.sigle,
  description: siteConfig.description,
  url: siteConfig.url,
  foundingDate: siteConfig.foundedYear.toString(),
  address: {
    "@type": "PostalAddress",
    addressLocality: "Ouagadougou",
    addressRegion: "Centre",
    addressCountry: "BF",
    streetAddress: siteConfig.contact.address,
    postOfficeBoxNumber: siteConfig.contact.bp,
  },
  telephone: [siteConfig.contact.phone, siteConfig.contact.phoneAlt],
  email: siteConfig.contact.email,
};

export default function AccueilPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* ── Hero avec photo du bâtiment ── */}
      <section className="relative overflow-hidden bg-primary-900 text-white">
        <div className="absolute inset-0" aria-hidden="true">
          <Image
            src="/images/batiment-1.jpg"
            alt="Façade du Lycée Privé Pagnidibsom — Quartier Sondogo, Secteur 32, Ouagadougou"
            fill
            className="object-cover opacity-25"
            priority
            sizes="100vw"
          />
        </div>
        <div className="relative max-w-6xl mx-auto px-4 py-16 sm:py-28 flex flex-col items-start gap-6">
          <div className="inline-flex items-center gap-2 bg-primary-800/70 backdrop-blur-sm rounded-full px-4 py-1.5 text-sm text-primary-100">
            <span className="w-2 h-2 bg-accent-400 rounded-full shrink-0" aria-hidden="true" />
            Inscriptions ouvertes — Rentrée {new Date().getFullYear()}
          </div>
          <h1
            className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight max-w-2xl heading-serif"
            style={{ fontFamily: "var(--font-lora), Georgia, serif", whiteSpace: "pre-line" }}
          >
            {c.hero.heading}
          </h1>
          <p className="text-primary-100 text-lg sm:text-xl max-w-xl leading-relaxed">
            {c.hero.subheading}
          </p>
          <div className="flex flex-col sm:flex-row gap-3 mt-2">
            <Button href="/pre-inscription" variant="secondary" size="lg">
              {c.hero.cta}
            </Button>
            <Button
              href="/ecole"
              variant="outline"
              size="lg"
              className="border-white text-white hover:bg-white/10"
            >
              {c.hero.ctaSecondary}
            </Button>
          </div>
        </div>
      </section>

      {/* ── Chiffres clés ── */}
      <section className="bg-primary-900 text-white" aria-label="Chiffres clés">
        <div className="max-w-6xl mx-auto px-4 py-8 grid grid-cols-2 sm:grid-cols-4 gap-6 text-center">
          {c.presentation.stats.map((stat) => (
            <div key={stat.label}>
              <p
                className="text-3xl sm:text-4xl font-bold text-accent-400 heading-serif"
                style={{ fontFamily: "var(--font-lora), Georgia, serif" }}
              >
                {stat.value}
              </p>
              <p className="text-sm text-primary-200 mt-1">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Présentation ── */}
      <section className="max-w-6xl mx-auto px-4 py-14 sm:py-20">
        <div className="max-w-2xl">
          <h2
            className="text-3xl sm:text-4xl font-bold text-primary-800 mb-5 heading-serif"
            style={{ fontFamily: "var(--font-lora), Georgia, serif" }}
          >
            {c.presentation.heading}
          </h2>
          <p className="text-neutral-600 text-lg leading-relaxed">{c.presentation.body}</p>
          <Link
            href="/ecole"
            className="inline-flex items-center gap-1 mt-5 text-primary-700 font-semibold hover:underline"
          >
            En savoir plus sur notre école
            <span aria-hidden="true">→</span>
          </Link>
        </div>
      </section>

      {/* ── Points forts ── */}
      <section className="bg-neutral-50 py-14 sm:py-20">
        <div className="max-w-6xl mx-auto px-4">
          <h2
            className="text-3xl sm:text-4xl font-bold text-primary-800 mb-10 heading-serif text-center"
            style={{ fontFamily: "var(--font-lora), Georgia, serif" }}
          >
            {c.pointsForts.heading}
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {c.pointsForts.items.map((item) => (
              <article
                key={item.title}
                className="bg-white rounded-xl p-6 border border-neutral-200 shadow-sm hover:shadow-md transition-shadow"
              >
                <span className="text-3xl mb-4 block" aria-hidden="true">
                  {item.icon}
                </span>
                <h3 className="font-semibold text-primary-800 text-lg mb-2">{item.title}</h3>
                <p className="text-neutral-600 text-sm leading-relaxed">{item.description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ── Photo réussite + accroche BEPC ── */}
      <section className="max-w-6xl mx-auto px-4 py-14 sm:py-20">
        <div className="grid sm:grid-cols-2 gap-8 items-center">
          <div className="relative h-64 sm:h-80 rounded-2xl overflow-hidden">
            <Image
              src="/images/reussite.jpg"
              alt="Élève du Lycée Privé Pagnidibsom recevant son tableau d'honneur — session BEPC 2025"
              fill
              className="object-cover"
              sizes="(max-width: 640px) 100vw, 50vw"
            />
          </div>
          <div>
            <span className="inline-block bg-accent-100 text-accent-700 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide mb-4">
              BEPC 2025
            </span>
            <h2
              className="text-3xl font-bold text-primary-800 mb-4 heading-serif"
              style={{ fontFamily: "var(--font-lora), Georgia, serif" }}
            >
              {c.reussite.heading}
            </h2>
            <p className="text-neutral-600 leading-relaxed">{c.reussite.body}</p>
          </div>
        </div>
      </section>

      {/* ── Filières d'enseignement ── */}
      <section className="bg-neutral-50 py-14 sm:py-20">
        <div className="max-w-6xl mx-auto px-4">
          <h2
            className="text-3xl sm:text-4xl font-bold text-primary-800 mb-10 heading-serif"
            style={{ fontFamily: "var(--font-lora), Georgia, serif" }}
          >
            {c.cycles.heading}
          </h2>
          <div className="grid sm:grid-cols-3 gap-6">
            {/* Collège */}
            <article className="bg-white rounded-xl border-2 border-primary-100 p-7 flex flex-col gap-4">
              <div>
                <span className="inline-block bg-primary-100 text-primary-700 text-xs font-semibold px-3 py-1 rounded-full uppercase tracking-wide mb-3">
                  {c.cycles.college.label}
                </span>
                <p
                  className="text-2xl font-bold text-primary-800 heading-serif"
                  style={{ fontFamily: "var(--font-lora), Georgia, serif" }}
                >
                  {c.cycles.college.classes}
                </p>
              </div>
              <p className="text-neutral-600 text-sm leading-relaxed flex-1">
                {c.cycles.college.description}
              </p>
              <Link
                href="/formations#college"
                className="text-primary-700 font-semibold text-sm hover:underline inline-flex items-center gap-1"
              >
                Voir le programme <span aria-hidden="true">→</span>
              </Link>
            </article>

            {/* Lycée */}
            <article className="bg-white rounded-xl border-2 border-accent-200 p-7 flex flex-col gap-4">
              <div>
                <span className="inline-block bg-accent-100 text-accent-700 text-xs font-semibold px-3 py-1 rounded-full uppercase tracking-wide mb-3">
                  {c.cycles.lycee.label}
                </span>
                <p
                  className="text-2xl font-bold text-primary-800 heading-serif"
                  style={{ fontFamily: "var(--font-lora), Georgia, serif" }}
                >
                  {c.cycles.lycee.classes}
                </p>
              </div>
              <p className="text-neutral-600 text-sm leading-relaxed flex-1">
                {c.cycles.lycee.description}
              </p>
              <Link
                href="/formations#lycee"
                className="text-primary-700 font-semibold text-sm hover:underline inline-flex items-center gap-1"
              >
                Voir le programme <span aria-hidden="true">→</span>
              </Link>
            </article>

            {/* Technique */}
            <article className="bg-white rounded-xl border-2 border-neutral-200 p-7 flex flex-col gap-4">
              <div>
                <span className="inline-block bg-neutral-100 text-neutral-700 text-xs font-semibold px-3 py-1 rounded-full uppercase tracking-wide mb-3">
                  {c.cycles.technique.label}
                </span>
                <p
                  className="text-2xl font-bold text-primary-800 heading-serif"
                  style={{ fontFamily: "var(--font-lora), Georgia, serif" }}
                >
                  {c.cycles.technique.classes}
                </p>
              </div>
              <p className="text-neutral-600 text-sm leading-relaxed flex-1">
                {c.cycles.technique.description}
              </p>
              <Link
                href="/formations#technique"
                className="text-primary-700 font-semibold text-sm hover:underline inline-flex items-center gap-1"
              >
                Voir le programme <span aria-hidden="true">→</span>
              </Link>
            </article>
          </div>
        </div>
      </section>

      {/* ── Admission ── */}
      <section id="admission" className="max-w-6xl mx-auto px-4 py-14 sm:py-20 scroll-mt-20">
        <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-start">
          <div>
            <span className="inline-block bg-primary-100 text-primary-700 text-xs font-semibold px-3 py-1 rounded-full uppercase tracking-wide mb-4">
              {c.admissionPreview.badge}
            </span>
            <h2
              className="text-3xl sm:text-4xl font-bold text-primary-800 mb-3 heading-serif"
              style={{ fontFamily: "var(--font-lora), Georgia, serif" }}
            >
              {c.admissionPreview.heading}
            </h2>
            <p className="text-neutral-600 text-lg leading-relaxed mb-10">
              {c.admissionPreview.subheading}
            </p>

            <ol className="flex flex-col gap-8">
              {a.procedure.etapes.map((etape, i) => (
                <li key={etape.num} className="relative flex gap-5">
                  {i < a.procedure.etapes.length - 1 && (
                    <span
                      className="absolute left-5 top-10 bottom-[-2rem] w-px bg-primary-100"
                      aria-hidden="true"
                    />
                  )}
                  <div
                    className="relative shrink-0 w-10 h-10 rounded-full bg-primary-700 text-white flex items-center justify-center font-bold text-sm"
                    aria-hidden="true"
                  >
                    {etape.num}
                  </div>
                  <div className="pt-1">
                    <h3 className="font-semibold text-primary-800 text-lg mb-1">{etape.title}</h3>
                    <p className="text-neutral-600 text-sm leading-relaxed">{etape.description}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>

          <div className="bg-primary-800 text-white rounded-2xl p-8 sm:p-10 flex flex-col gap-5 lg:sticky lg:top-24">
            <h3
              className="text-2xl sm:text-3xl font-bold heading-serif"
              style={{ fontFamily: "var(--font-lora), Georgia, serif" }}
            >
              {a.cta.heading}
            </h3>
            <p className="text-primary-200 leading-relaxed">{a.cta.body}</p>
            <div className="flex flex-col sm:flex-row gap-3 mt-2">
              <Button href="/pre-inscription" variant="secondary" size="lg">
                {a.cta.button}
              </Button>
              <Button
                href="/admission"
                variant="outline"
                size="lg"
                className="border-white text-white hover:bg-white/10"
              >
                Voir le dossier complet
              </Button>
            </div>
            <hr className="border-primary-700 mt-4" />
            <div>
              <p className="text-sm text-primary-200 mb-2">Une question avant de vous lancer ?</p>
              <address className="not-italic flex flex-col gap-1 text-sm">
                <a
                  href={`tel:${siteConfig.contact.phone.replace(/\s/g, "")}`}
                  className="font-semibold hover:underline"
                >
                  {siteConfig.contact.phone}
                </a>
                <a
                  href={`tel:${siteConfig.contact.phoneAlt.replace(/\s/g, "")}`}
                  className="font-semibold hover:underline"
                >
                  {siteConfig.contact.phoneAlt}
                </a>
              </address>
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA Banner ── */}
      <section className="bg-primary-800 text-white py-14 px-4">
        <div className="max-w-3xl mx-auto text-center flex flex-col items-center gap-5">
          <h2
            className="text-3xl sm:text-4xl font-bold heading-serif"
            style={{ fontFamily: "var(--font-lora), Georgia, serif" }}
          >
            {c.ctaBanner.heading}
          </h2>
          <p className="text-primary-200 text-lg max-w-xl">{c.ctaBanner.body}</p>
          <Button href="/pre-inscription" variant="secondary" size="lg">
            {c.ctaBanner.cta}
          </Button>
        </div>
      </section>

      {/* ── Aperçu contact ── */}
      <section className="max-w-6xl mx-auto px-4 py-14 sm:py-20">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 p-8 bg-neutral-50 rounded-2xl border border-neutral-200">
          <div>
            <h2 className="text-2xl font-bold text-primary-800 mb-2">Une question ?</h2>
            <p className="text-neutral-600">
              Notre équipe est disponible du lundi au samedi.
            </p>
            <address className="not-italic mt-3 flex flex-col gap-1 text-sm text-neutral-700">
              <a
                href={`tel:${siteConfig.contact.phone.replace(/\s/g, "")}`}
                className="hover:text-primary-700 font-semibold"
              >
                {siteConfig.contact.phone}
              </a>
              <a
                href={`tel:${siteConfig.contact.phoneAlt.replace(/\s/g, "")}`}
                className="hover:text-primary-700 font-semibold"
              >
                {siteConfig.contact.phoneAlt}
              </a>
              <span className="text-neutral-500 mt-1">{siteConfig.contact.address}</span>
            </address>
          </div>
          <Button href="/contact" variant="outline" size="md" className="shrink-0">
            Nous contacter
          </Button>
        </div>
      </section>
    </>
  );
}
