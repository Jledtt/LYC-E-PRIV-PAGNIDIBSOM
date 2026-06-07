import type { Metadata } from "next";
import { siteConfig } from "@/config/site";
import ContactForm from "@/components/forms/ContactForm";

export const metadata: Metadata = {
  title: "Contact — Kiswensida",
  description:
    "Contactez le collège-lycée Kiswensida à Ouagadougou. Téléphone, email et formulaire en ligne.",
};

export default function ContactPage() {
  return (
    <>
      <section className="bg-primary-800 text-white py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <h1
            className="text-3xl sm:text-4xl font-bold heading-serif mb-3"
            style={{ fontFamily: "var(--font-lora), Georgia, serif" }}
          >
            Nous contacter
          </h1>
          <p className="text-primary-200">
            Nous sommes disponibles du lundi au samedi. N'hésitez pas à nous appeler ou à nous
            écrire.
          </p>
        </div>
      </section>

      <section className="max-w-4xl mx-auto px-4 py-10 sm:py-14">
        <div className="grid sm:grid-cols-2 gap-12">
          {/* Coordonnées */}
          <div>
            <h2
              className="text-2xl font-bold text-primary-800 mb-6 heading-serif"
              style={{ fontFamily: "var(--font-lora), Georgia, serif" }}
            >
              Coordonnées
            </h2>

            <address className="not-italic flex flex-col gap-5">
              {/* Adresse */}
              <div className="flex items-start gap-3">
                <span className="w-9 h-9 shrink-0 bg-primary-100 rounded-lg flex items-center justify-center text-primary-700" aria-hidden="true">
                  📍
                </span>
                <div>
                  <p className="font-medium text-neutral-800 text-sm mb-0.5">Adresse</p>
                  <p className="text-neutral-600 text-sm">{siteConfig.contact.address}</p>
                </div>
              </div>

              {/* Téléphone */}
              <div className="flex items-start gap-3">
                <span className="w-9 h-9 shrink-0 bg-primary-100 rounded-lg flex items-center justify-center text-primary-700" aria-hidden="true">
                  📞
                </span>
                <div>
                  <p className="font-medium text-neutral-800 text-sm mb-0.5">Téléphone</p>
                  <a
                    href={`tel:${siteConfig.contact.phone.replace(/\s/g, "")}`}
                    className="text-primary-700 font-semibold hover:underline"
                  >
                    {siteConfig.contact.phone}
                  </a>
                </div>
              </div>

              {/* WhatsApp */}
              <div className="flex items-start gap-3">
                <span className="w-9 h-9 shrink-0 bg-green-100 rounded-lg flex items-center justify-center text-green-700" aria-hidden="true">
                  💬
                </span>
                <div>
                  <p className="font-medium text-neutral-800 text-sm mb-0.5">WhatsApp</p>
                  <a
                    href={siteConfig.social.whatsapp}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-green-700 font-semibold hover:underline text-sm"
                  >
                    Envoyer un message WhatsApp
                  </a>
                </div>
              </div>

              {/* Email */}
              <div className="flex items-start gap-3">
                <span className="w-9 h-9 shrink-0 bg-primary-100 rounded-lg flex items-center justify-center text-primary-700" aria-hidden="true">
                  ✉️
                </span>
                <div>
                  <p className="font-medium text-neutral-800 text-sm mb-0.5">Email</p>
                  <a
                    href={`mailto:${siteConfig.contact.email}`}
                    className="text-primary-700 hover:underline text-sm break-all"
                  >
                    {siteConfig.contact.email}
                  </a>
                </div>
              </div>
            </address>

            {/* Horaires */}
            <div className="mt-8 p-5 bg-neutral-50 rounded-xl border border-neutral-200">
              <h3 className="font-semibold text-neutral-800 mb-3">Horaires d'accueil</h3>
              <div className="flex flex-col gap-1.5 text-sm text-neutral-600">
                <div className="flex justify-between">
                  <span>Lundi – Vendredi</span>
                  <span className="font-medium">7h30 – 17h00</span>
                </div>
                <div className="flex justify-between">
                  <span>Samedi</span>
                  <span className="font-medium">7h30 – 12h00</span>
                </div>
                <div className="flex justify-between">
                  <span>Dimanche</span>
                  <span className="text-neutral-400">Fermé</span>
                </div>
              </div>
            </div>
          </div>

          {/* Formulaire */}
          <div>
            <h2
              className="text-2xl font-bold text-primary-800 mb-6 heading-serif"
              style={{ fontFamily: "var(--font-lora), Georgia, serif" }}
            >
              Formulaire de contact
            </h2>
            <ContactForm />
          </div>
        </div>
      </section>
    </>
  );
}
