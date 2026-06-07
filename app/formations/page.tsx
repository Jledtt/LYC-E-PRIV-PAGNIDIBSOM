import type { Metadata } from "next";
import { formationsContent as c } from "@/content/formations";
import Button from "@/components/ui/Button";

export const metadata: Metadata = {
  title: c.meta.title,
  description: c.meta.description,
};

export default function FormationsPage() {
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
          <p className="text-primary-200 text-lg">{c.hero.subheading}</p>
        </div>
      </section>

      {/* Collège */}
      <section id="college" className="max-w-5xl mx-auto px-4 py-14 sm:py-20 scroll-mt-20">
        <div className="flex flex-col lg:flex-row gap-10">
          <div className="flex-1">
            <span className="inline-block bg-primary-100 text-primary-700 text-xs font-semibold px-3 py-1 rounded-full uppercase tracking-wide mb-4">
              {c.college.classes}
            </span>
            <h2
              className="text-3xl font-bold text-primary-800 mb-4 heading-serif"
              style={{ fontFamily: "var(--font-lora), Georgia, serif" }}
            >
              {c.college.heading}
            </h2>
            <p className="text-neutral-600 leading-relaxed mb-6">{c.college.description}</p>

            <div className="bg-primary-50 rounded-xl p-5 border border-primary-100">
              <p className="font-semibold text-primary-800 mb-1 text-sm">Examen préparé</p>
              <p className="text-primary-700 font-bold">{c.college.examen}</p>
            </div>
          </div>

          <div className="flex-1 flex flex-col gap-6">
            {/* Matières */}
            <div>
              <h3 className="font-semibold text-neutral-800 mb-3">Matières enseignées</h3>
              <ul className="grid grid-cols-2 gap-1.5">
                {c.college.matieres.map((m) => (
                  <li key={m} className="flex items-center gap-2 text-sm text-neutral-600">
                    <span className="w-1.5 h-1.5 bg-primary-400 rounded-full shrink-0" aria-hidden="true" />
                    {m}
                  </li>
                ))}
              </ul>
            </div>

            {/* Atouts */}
            <div>
              <h3 className="font-semibold text-neutral-800 mb-3">Nos atouts</h3>
              <ul className="flex flex-col gap-2">
                {c.college.atouts.map((a) => (
                  <li key={a} className="flex items-start gap-2 text-sm text-neutral-600">
                    <span className="text-primary-600 mt-0.5 shrink-0" aria-hidden="true">✓</span>
                    {a}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      <hr className="max-w-5xl mx-auto border-neutral-200" />

      {/* Lycée */}
      <section id="lycee" className="max-w-5xl mx-auto px-4 py-14 sm:py-20 scroll-mt-20">
        <div className="mb-8">
          <span className="inline-block bg-accent-100 text-accent-700 text-xs font-semibold px-3 py-1 rounded-full uppercase tracking-wide mb-4">
            {c.lycee.classes}
          </span>
          <h2
            className="text-3xl font-bold text-primary-800 mb-4 heading-serif"
            style={{ fontFamily: "var(--font-lora), Georgia, serif" }}
          >
            {c.lycee.heading}
          </h2>
          <p className="text-neutral-600 leading-relaxed max-w-2xl">{c.lycee.description}</p>
        </div>

        {/* Séries */}
        <div className="grid sm:grid-cols-3 gap-5 mb-8">
          {c.lycee.series.map((serie) => (
            <article
              key={serie.code}
              className="p-5 border-2 border-accent-200 rounded-xl"
            >
              <span className="inline-block bg-accent-500 text-white text-xs font-bold px-2.5 py-1 rounded mb-3">
                Série {serie.code}
              </span>
              <h3 className="font-semibold text-primary-800 mb-2">{serie.label}</h3>
              <p className="text-neutral-600 text-sm leading-relaxed">{serie.description}</p>
            </article>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row gap-6">
          <div className="flex-1 bg-accent-50 rounded-xl p-5 border border-accent-100">
            <p className="font-semibold text-accent-800 mb-1 text-sm">Examen préparé</p>
            <p className="text-accent-700 font-bold">{c.lycee.examen}</p>
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-neutral-800 mb-3">Nos atouts</h3>
            <ul className="flex flex-col gap-2">
              {c.lycee.atouts.map((a) => (
                <li key={a} className="flex items-start gap-2 text-sm text-neutral-600">
                  <span className="text-accent-600 mt-0.5 shrink-0" aria-hidden="true">✓</span>
                  {a}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Horaires */}
      <section className="bg-neutral-50 py-12 px-4">
        <div className="max-w-5xl mx-auto">
          <h2
            className="text-2xl font-bold text-primary-800 mb-6 heading-serif"
            style={{ fontFamily: "var(--font-lora), Georgia, serif" }}
          >
            {c.horaires.heading}
          </h2>
          <div className="flex flex-col sm:flex-row gap-4 mb-4">
            {c.horaires.items.map((item) => (
              <div key={item.label} className="flex-1 bg-white border border-neutral-200 rounded-xl p-4 text-center">
                <p className="text-sm text-neutral-500 mb-1">{item.label}</p>
                <p className="font-bold text-primary-700 text-lg">{item.value}</p>
              </div>
            ))}
          </div>
          <p className="text-sm text-neutral-500 italic">{c.horaires.note}</p>
        </div>
      </section>

      {/* CTA */}
      <section className="py-12 px-4 text-center">
        <p className="text-neutral-600 mb-4">Intéressé par nos formations ?</p>
        <Button href="/pre-inscription" variant="secondary" size="lg">
          Déposer une pré-inscription
        </Button>
      </section>
    </>
  );
}
