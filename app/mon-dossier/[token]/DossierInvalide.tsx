import { siteConfig } from "@/config/site";

interface DossierInvalideProps {
  status: "not_found" | "expired";
}

export default function DossierInvalide({ status }: DossierInvalideProps) {
  const message =
    status === "expired"
      ? "Ce lien a expiré. Pour des raisons de sécurité, les liens de suivi de dossier ne sont valables que 30 jours."
      : "Ce lien est invalide ou n'existe plus.";

  return (
    <section className="max-w-2xl mx-auto px-4 py-16 text-center">
      <div className="w-16 h-16 rounded-full bg-red-100 text-red-600 flex items-center justify-center text-3xl mx-auto mb-4">
        !
      </div>
      <h1 className="text-2xl font-bold text-primary-800 heading-serif mb-3">
        Lien d&apos;accès au dossier
      </h1>
      <p className="text-neutral-600 mb-6">{message}</p>

      <div className="bg-[#FFFDF8] border border-accent-200 rounded-lg p-5 text-left text-sm text-[#1F2937] inline-block">
        <p className="font-semibold mb-2">Besoin d&apos;aide ?</p>
        <p className="mb-1">
          Pour obtenir un nouveau lien ou suivre votre dossier, contactez-nous :
        </p>
        <p>
          Téléphone :{" "}
          <a href={`tel:${siteConfig.contact.phone.replace(/\s/g, "")}`} className="text-primary-800 underline">
            {siteConfig.contact.phone}
          </a>{" "}
          /{" "}
          <a href={`tel:${siteConfig.contact.phoneAlt.replace(/\s/g, "")}`} className="text-primary-800 underline">
            {siteConfig.contact.phoneAlt}
          </a>
        </p>
        <p>
          Email :{" "}
          <a href={`mailto:${siteConfig.contact.email}`} className="text-primary-800 underline">
            {siteConfig.contact.email}
          </a>
        </p>
      </div>
    </section>
  );
}
