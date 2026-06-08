import type { Metadata } from "next";
import Link from "next/link";
import { tarifsContent as c } from "@/content/tarifs";

export const metadata: Metadata = {
  title: c.meta.title,
  description: c.meta.description,
};

export default function TarifsPage() {
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

      {/* Note paiement en tranches */}
      <section className="max-w-4xl mx-auto px-4 pt-10">
        <div className="bg-accent-50 border border-accent-100 rounded-xl p-5 flex items-start gap-3">
          <span className="text-accent-600 text-xl shrink-0 mt-0.5" aria-hidden="true">ℹ</span>
          <p className="text-neutral-700 text-sm leading-relaxed">{c.note}</p>
        </div>
      </section>

      {/* Tableau frais de scolarité */}
      <section className="max-w-4xl mx-auto px-4 py-10">
        <h2
          className="text-2xl font-bold text-primary-800 mb-6 heading-serif"
          style={{ fontFamily: "var(--font-lora), Georgia, serif" }}
        >
          {c.scolarite.heading}
        </h2>
        <div className="overflow-x-auto rounded-xl border border-neutral-200 shadow-sm">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-primary-800 text-white">
                {c.scolarite.colonnes.map((col) => (
                  <th
                    key={col}
                    scope="col"
                    className="px-4 py-3 text-left font-semibold whitespace-nowrap first:rounded-tl-xl last:rounded-tr-xl"
                  >
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {c.scolarite.lignes.map((ligne, i) => (
                <tr
                  key={ligne.classe}
                  className={i % 2 === 0 ? "bg-white" : "bg-neutral-50"}
                >
                  <td className="px-4 py-3 font-medium text-neutral-800 whitespace-nowrap">
                    {ligne.classe}
                  </td>
                  <td className="px-4 py-3 text-neutral-700 whitespace-nowrap">{ligne.t1}</td>
                  <td className="px-4 py-3 text-neutral-700 whitespace-nowrap">{ligne.t2}</td>
                  <td className="px-4 py-3 text-neutral-700 whitespace-nowrap">{ligne.t3}</td>
                  <td className="px-4 py-3 font-bold text-primary-700 whitespace-nowrap">
                    {ligne.total}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-xs text-neutral-400 mt-2">Montants en FCFA.</p>
      </section>

      {/* Frais annexes + Tenues */}
      <section className="bg-neutral-50 py-12 px-4">
        <div className="max-w-4xl mx-auto grid sm:grid-cols-2 gap-8">
          {/* Frais annexes */}
          <div>
            <h2
              className="text-xl font-bold text-primary-800 mb-5 heading-serif"
              style={{ fontFamily: "var(--font-lora), Georgia, serif" }}
            >
              {c.fraisAnnexes.heading}
            </h2>
            <ul className="flex flex-col gap-3">
              {c.fraisAnnexes.items.map((item) => (
                <li
                  key={item.label}
                  className="flex items-center justify-between gap-4 bg-white border border-neutral-200 rounded-lg px-4 py-3 text-sm"
                >
                  <span className="text-neutral-700">{item.label}</span>
                  <span className="font-bold text-primary-700 whitespace-nowrap">
                    {item.montant} F
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* Tenues scolaires */}
          <div>
            <h2
              className="text-xl font-bold text-primary-800 mb-5 heading-serif"
              style={{ fontFamily: "var(--font-lora), Georgia, serif" }}
            >
              {c.tenues.heading}
            </h2>
            <ul className="flex flex-col gap-3">
              {c.tenues.items.map((item) => (
                <li
                  key={item.label}
                  className="flex items-center justify-between gap-4 bg-white border border-neutral-200 rounded-lg px-4 py-3 text-sm"
                >
                  <span className="text-neutral-700">{item.label}</span>
                  <span className="font-bold text-primary-700 whitespace-nowrap">
                    {item.montant} F
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Disclaimer + CTA */}
      <section className="max-w-4xl mx-auto px-4 py-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
        <p className="text-xs text-neutral-400 max-w-xl italic">{c.disclaimer}</p>
        <Link
          href="/pre-inscription"
          className="shrink-0 inline-flex items-center gap-2 bg-accent-500 hover:bg-accent-600 text-neutral-900 font-bold px-6 py-3 rounded-lg transition-colors text-sm"
        >
          Déposer une pré-inscription <span aria-hidden="true">→</span>
        </Link>
      </section>
    </>
  );
}
