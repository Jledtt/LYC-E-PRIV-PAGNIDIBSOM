import type { Metadata } from "next";
import Image from "next/image";
import { ecoleContent as c } from "@/content/ecole";

export const metadata: Metadata = {
  title: "Notre École",
  description:
    "Histoire, équipe dirigeante, infrastructures et valeurs du Lycée Privé Pagnidibsom — établissement privé fondé en octobre 2021 au Quartier Sondogo, Secteur 32, Ouagadougou, Burkina Faso.",
};

export default function EcolePage() {
  return (
    <>
      {/* Hero avec photo bâtiment */}
      <section className="relative overflow-hidden bg-primary-900 text-white">
        <div className="absolute inset-0" aria-hidden="true">
          <Image
            src="/images/batiment-2.jpg"
            alt="Entrée du Lycée Privé Pagnidibsom — Quartier Sondogo, Secteur 32, Ouagadougou"
            fill
            className="object-cover opacity-20"
            priority
            sizes="100vw"
          />
        </div>
        <div className="relative max-w-4xl mx-auto px-4 py-16 sm:py-24">
          <h1
            className="text-4xl sm:text-5xl font-bold heading-serif mb-4"
            style={{ fontFamily: "var(--font-lora), Georgia, serif" }}
          >
            {c.hero.heading}
          </h1>
          <p className="text-primary-200 text-lg max-w-2xl">{c.hero.subheading}</p>
        </div>
      </section>

      {/* Présentation avec photo réunion */}
      <section className="max-w-6xl mx-auto px-4 py-14 sm:py-20">
        <div className="grid sm:grid-cols-2 gap-10 items-center">
          <div>
            <h2
              className="text-3xl font-bold text-primary-800 mb-6 heading-serif"
              style={{ fontFamily: "var(--font-lora), Georgia, serif" }}
            >
              {c.presentation.heading}
            </h2>
            <div className="flex flex-col gap-4">
              {c.presentation.paragraphs.map((p, i) => (
                <p key={i} className="text-neutral-700 leading-relaxed">
                  {p}
                </p>
              ))}
            </div>
          </div>
          <div className="relative h-72 sm:h-80 rounded-2xl overflow-hidden">
            <Image
              src="/images/reunion.jpg"
              alt="Réunion pédagogique au Lycée Privé Pagnidibsom"
              fill
              className="object-cover"
              sizes="(max-width: 640px) 100vw, 50vw"
            />
          </div>
        </div>
      </section>

      {/* Équipe dirigeante */}
      <section className="bg-neutral-50 py-14 px-4">
        <div className="max-w-6xl mx-auto">
          <h2
            className="text-3xl font-bold text-primary-800 mb-10 heading-serif text-center"
            style={{ fontFamily: "var(--font-lora), Georgia, serif" }}
          >
            {c.direction.heading}
          </h2>
          <div className="grid sm:grid-cols-2 gap-8 max-w-2xl mx-auto">
            <article className="bg-white rounded-xl border border-neutral-200 p-6 text-center shadow-sm">
              <div
                className="w-16 h-16 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center text-2xl font-bold mx-auto mb-4"
                aria-hidden="true"
              >
                F
              </div>
              <p className="font-bold text-primary-800 text-lg">{c.direction.fondateur.name}</p>
              <p className="text-sm text-neutral-500 mt-1">{c.direction.fondateur.role}</p>
            </article>
            <article className="bg-white rounded-xl border border-neutral-200 p-6 text-center shadow-sm">
              <div
                className="w-16 h-16 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center text-2xl font-bold mx-auto mb-4"
                aria-hidden="true"
              >
                P
              </div>
              <p className="font-bold text-primary-800 text-lg">{c.direction.proviseur.name}</p>
              <p className="text-sm text-neutral-500 mt-1">{c.direction.proviseur.role}</p>
            </article>
          </div>
        </div>
      </section>

      {/* Photo enseignant + infrastructures */}
      <section className="max-w-6xl mx-auto px-4 py-14 sm:py-20">
        <div className="grid sm:grid-cols-2 gap-10 items-start">
          <div className="relative h-72 sm:h-96 rounded-2xl overflow-hidden order-2 sm:order-1">
            <Image
              src="/images/enseignant.jpg"
              alt="Enseignant du Lycée Privé Pagnidibsom en cours"
              fill
              className="object-cover"
              sizes="(max-width: 640px) 100vw, 50vw"
            />
          </div>
          <div className="order-1 sm:order-2">
            <h2
              className="text-3xl font-bold text-primary-800 mb-8 heading-serif"
              style={{ fontFamily: "var(--font-lora), Georgia, serif" }}
            >
              {c.atouts.heading}
            </h2>
            <ul className="flex flex-col gap-5">
              {c.atouts.items.map((item) => (
                <li key={item.title} className="flex items-start gap-4">
                  <span className="text-2xl shrink-0 mt-0.5" aria-hidden="true">
                    {item.icon}
                  </span>
                  <div>
                    <p className="font-semibold text-primary-800">{item.title}</p>
                    <p className="text-neutral-600 text-sm leading-relaxed">{item.description}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Mot du fondateur */}
      <section className="bg-primary-50 py-14 px-4">
        <div className="max-w-3xl mx-auto">
          <h2
            className="text-2xl font-bold text-primary-800 mb-6 heading-serif"
            style={{ fontFamily: "var(--font-lora), Georgia, serif" }}
          >
            {c.fondateur.heading}
          </h2>
          <figure>
            <blockquote className="border-l-4 border-accent-500 pl-6 py-1">
              <p
                className="text-primary-900 text-xl italic leading-relaxed heading-serif"
                style={{ fontFamily: "var(--font-lora), Georgia, serif" }}
              >
                {c.fondateur.quote}
              </p>
            </blockquote>
            <figcaption className="mt-5 flex items-center gap-3">
              <div
                className="w-12 h-12 rounded-full bg-primary-200 flex items-center justify-center text-primary-700 font-bold text-lg"
                aria-hidden="true"
              >
                F
              </div>
              <div>
                <p className="font-semibold text-neutral-800">{c.fondateur.name}</p>
                <p className="text-sm text-neutral-500">{c.fondateur.title}</p>
              </div>
            </figcaption>
          </figure>
        </div>
      </section>

      {/* Valeurs */}
      <section className="max-w-4xl mx-auto px-4 py-14 sm:py-20">
        <h2
          className="text-3xl font-bold text-primary-800 mb-10 heading-serif"
          style={{ fontFamily: "var(--font-lora), Georgia, serif" }}
        >
          {c.valeurs.heading}
        </h2>
        <div className="grid sm:grid-cols-2 gap-6">
          {c.valeurs.items.map((valeur) => (
            <article
              key={valeur.title}
              className="p-6 bg-white border border-neutral-200 rounded-xl"
            >
              <h3 className="font-semibold text-primary-700 text-lg mb-2">{valeur.title}</h3>
              <p className="text-neutral-600 text-sm leading-relaxed">{valeur.description}</p>
            </article>
          ))}
        </div>
      </section>

      {/* Vision */}
      <section className="bg-primary-800 text-white py-14 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h2
            className="text-3xl font-bold heading-serif mb-5"
            style={{ fontFamily: "var(--font-lora), Georgia, serif" }}
          >
            {c.vision.heading}
          </h2>
          <p className="text-primary-200 text-lg leading-relaxed">{c.vision.body}</p>
        </div>
      </section>
    </>
  );
}
