import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Actualités — Kiswensida",
  description: "Les actualités du collège-lycée Kiswensida à Ouagadougou.",
};

export default function ActualitesPage() {
  return (
    <>
      <section className="bg-primary-800 text-white py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <h1
            className="text-3xl sm:text-4xl font-bold heading-serif mb-3"
            style={{ fontFamily: "var(--font-lora), Georgia, serif" }}
          >
            Actualités
          </h1>
        </div>
      </section>

      <section className="max-w-4xl mx-auto px-4 py-20 text-center flex flex-col items-center gap-6">
        <div className="w-20 h-20 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center text-4xl" aria-hidden="true">
          🔔
        </div>
        <h2
          className="text-2xl font-bold text-primary-800 heading-serif"
          style={{ fontFamily: "var(--font-lora), Georgia, serif" }}
        >
          Bientôt disponible
        </h2>
        <p className="text-neutral-600 max-w-md">
          Notre espace d'actualités est en cours de construction. Retrouvez bientôt nos
          annonces, événements et informations importantes.
        </p>
        <p className="text-sm text-neutral-500">
          En attendant, suivez-nous sur Facebook pour rester informé.
        </p>
      </section>
    </>
  );
}
