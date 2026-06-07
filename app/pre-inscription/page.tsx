import type { Metadata } from "next";
import PreInscriptionForm from "@/components/forms/PreInscriptionForm";

export const metadata: Metadata = {
  title: "Pré-inscription — Kiswensida",
  description:
    "Déposez votre demande de pré-inscription au collège-lycée Kiswensida à Ouagadougou. Formulaire en ligne, gratuit et sans engagement.",
};

export default function PreInscriptionPage() {
  return (
    <>
      <section className="bg-primary-800 text-white py-12 px-4">
        <div className="max-w-2xl mx-auto">
          <h1
            className="text-3xl sm:text-4xl font-bold heading-serif mb-3"
            style={{ fontFamily: "var(--font-lora), Georgia, serif" }}
          >
            Demande de pré-inscription
          </h1>
          <p className="text-primary-200">
            Remplissez ce formulaire pour exprimer votre intérêt. Notre équipe vous contactera
            sous 48h pour finaliser le dossier.
          </p>
        </div>
      </section>

      <section className="max-w-2xl mx-auto px-4 py-10 sm:py-14">
        <PreInscriptionForm />
      </section>
    </>
  );
}
