import type { Metadata } from "next";
import PreInscriptionForm from "@/components/forms/PreInscriptionForm";

export const metadata: Metadata = {
  title: "Pré-inscription en ligne",
  description:
    "Formulaire de pré-inscription gratuit et sans engagement au Lycée Privé Pagnidibsom à Ouagadougou — notre équipe vous contacte sous 48 h pour finaliser le dossier.",
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
