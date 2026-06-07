import type { Metadata } from "next";
import { ecoleContent as c } from "@/content/ecole";

export const metadata: Metadata = {
  title: c.meta.title,
  description: c.meta.description,
};

export default function EcolePage() {
  return (
    <>
      {/* Hero */}
      <section className="bg-primary-800 text-white py-14 px-4">
        <div className="max-w-4xl mx-auto">
          <h1
            className="text-4xl sm:text-5xl font-bold heading-serif mb-4"
            style={{ fontFamily: "var(--font-lora), Georgia, serif" }}
          >
            {c.hero.heading}
          </h1>
          <p className="text-primary-200 text-lg max-w-2xl">{c.hero.subheading}</p>
        </div>
      </section>

      {/* Présentation */}
      <section className="max-w-4xl mx-auto px-4 py-14 sm:py-20">
        <h2
          className="text-3xl font-bold text-primary-800 mb-6 heading-serif"
          style={{ fontFamily: "var(--font-lora), Georgia, serif" }}
        >
          {c.presentation.heading}
        </h2>
        <div className="flex flex-col gap-4">
          {c.presentation.paragraphs.map((p, i) => (
            <p key={i} className="text-neutral-700 text-lg leading-relaxed">
              {p}
            </p>
          ))}
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
              {/* Avatar placeholder */}
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
      <section className="bg-primary-700 text-white py-14 px-4">
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
