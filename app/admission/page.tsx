import type { Metadata } from "next";
import { admissionContent as c } from "@/content/admission";
import Button from "@/components/ui/Button";

export const metadata: Metadata = {
  title: c.meta.title,
  description: c.meta.description,
};

export default function AdmissionPage() {
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

      {/* Procédure */}
      <section className="max-w-4xl mx-auto px-4 py-14 sm:py-20">
        <h2
          className="text-3xl font-bold text-primary-800 mb-10 heading-serif"
          style={{ fontFamily: "var(--font-lora), Georgia, serif" }}
        >
          {c.procedure.heading}
        </h2>
        <ol className="flex flex-col gap-8">
          {c.procedure.etapes.map((etape) => (
            <li key={etape.num} className="flex gap-5">
              <div
                className="shrink-0 w-12 h-12 rounded-full bg-primary-700 text-white flex items-center justify-center font-bold text-lg"
                aria-hidden="true"
              >
                {etape.num}
              </div>
              <div className="pt-1">
                <h3 className="font-semibold text-primary-800 text-lg mb-1">{etape.title}</h3>
                <p className="text-neutral-600 leading-relaxed">{etape.description}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      {/* Documents */}
      <section className="bg-neutral-50 py-12 px-4">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row gap-10">
          <div className="flex-1">
            <h2
              className="text-2xl font-bold text-primary-800 mb-5 heading-serif"
              style={{ fontFamily: "var(--font-lora), Georgia, serif" }}
            >
              {c.documents.heading}
            </h2>
            <ul className="flex flex-col gap-3">
              {c.documents.items.map((doc) => (
                <li key={doc} className="flex items-start gap-3 text-neutral-700">
                  <span
                    className="mt-1 w-5 h-5 shrink-0 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center text-xs font-bold"
                    aria-hidden="true"
                  >
                    ✓
                  </span>
                  {doc}
                </li>
              ))}
            </ul>
          </div>

          {/* Frais */}
          <div className="flex-1">
            <div className="bg-white border border-neutral-200 rounded-xl p-6 h-full">
              <h2
                className="text-2xl font-bold text-primary-800 mb-4 heading-serif"
                style={{ fontFamily: "var(--font-lora), Georgia, serif" }}
              >
                {c.frais.heading}
              </h2>
              <p className="text-neutral-600 mb-4 leading-relaxed">{c.frais.note}</p>
              <a
                href={`tel:${"+22600000000"}`}
                className="inline-flex items-center gap-2 text-primary-700 font-semibold hover:underline"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                {c.frais.contact}
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-primary-700 text-white py-14 px-4 text-center">
        <div className="max-w-2xl mx-auto flex flex-col items-center gap-5">
          <h2
            className="text-3xl font-bold heading-serif"
            style={{ fontFamily: "var(--font-lora), Georgia, serif" }}
          >
            {c.cta.heading}
          </h2>
          <p className="text-primary-200 text-lg">{c.cta.body}</p>
          <Button href="/pre-inscription" variant="secondary" size="lg">
            {c.cta.button}
          </Button>
        </div>
      </section>
    </>
  );
}
