"use client";

import { useState } from "react";
import { MOBILE_MONEY } from "@/config/paiement";

interface OperateurConfig {
  actif: boolean;
  numero: string;
  nomCompte: string;
}

interface ColorClasses {
  border: string;
  bg: string;
  text: string;
  button: string;
  buttonHover: string;
}

async function copierValeur(valeur: string): Promise<void> {
  if (navigator.clipboard && window.isSecureContext) {
    await navigator.clipboard.writeText(valeur);
    return;
  }
  const textarea = document.createElement("textarea");
  textarea.value = valeur;
  textarea.style.position = "fixed";
  textarea.style.left = "-9999px";
  document.body.appendChild(textarea);
  textarea.select();
  document.execCommand("copy");
  document.body.removeChild(textarea);
}

interface OperateurCardProps {
  nom: string;
  config: OperateurConfig;
  telCode: string;
  telHref: string;
  montant: string;
  colors: ColorClasses;
}

function OperateurCard({ nom, config, telCode, telHref, montant, colors }: OperateurCardProps) {
  const [copiedField, setCopiedField] = useState<"numero" | "nom" | null>(null);

  async function handleCopy(field: "numero" | "nom", valeur: string) {
    try {
      await copierValeur(valeur);
      setCopiedField(field);
      setTimeout(() => setCopiedField((f) => (f === field ? null : f)), 2000);
    } catch (err) {
      console.error("[parent/paiement] Copie échouée :", err);
    }
  }

  const montantTrim = montant.trim();
  const montantAffiche =
    montantTrim && Number.isFinite(Number(montantTrim))
      ? `${Number(montantTrim).toLocaleString("fr-FR")} FCFA`
      : null;

  return (
    <div className={`rounded-lg border-2 ${colors.border} ${colors.bg} p-5 flex flex-col gap-3`}>
      <h3 className={`font-semibold ${colors.text}`}>{nom}</h3>

      <div className="flex flex-col gap-2.5 text-sm">
        <div className="flex items-center justify-between gap-2">
          <div>
            <p className="text-neutral-500 text-xs">Numéro de dépôt</p>
            <p className="font-medium text-neutral-800 font-mono">{config.numero}</p>
          </div>
          <button
            type="button"
            onClick={() => handleCopy("numero", config.numero)}
            className="text-xs font-medium px-2.5 py-1 rounded bg-white border border-neutral-300 hover:bg-neutral-50 transition-colors whitespace-nowrap"
          >
            {copiedField === "numero" ? "Copié" : "Copier"}
          </button>
        </div>

        <div className="flex items-center justify-between gap-2">
          <div>
            <p className="text-neutral-500 text-xs">Titulaire du compte</p>
            <p className="font-medium text-neutral-800">{config.nomCompte}</p>
          </div>
          <button
            type="button"
            onClick={() => handleCopy("nom", config.nomCompte)}
            className="text-xs font-medium px-2.5 py-1 rounded bg-white border border-neutral-300 hover:bg-neutral-50 transition-colors whitespace-nowrap"
          >
            {copiedField === "nom" ? "Copié" : "Copier"}
          </button>
        </div>

        <div>
          <p className="text-neutral-500 text-xs">Montant à verser</p>
          <p className="font-medium text-neutral-800">
            {montantAffiche ?? "Renseignez le montant ci-dessus"}
          </p>
        </div>
      </div>

      <a
        href={telHref}
        className={`self-start text-white text-sm font-semibold px-4 py-2 rounded transition-colors ${colors.button} ${colors.buttonHover}`}
      >
        Ouvrir {nom}
      </a>
      <p className="text-xs text-neutral-500">
        Composez {telCode}, puis suivez le menu Transfert d&rsquo;argent. Saisissez le numéro{" "}
        {config.numero} et le montant ci-dessus.
      </p>
    </div>
  );
}

interface MobileMoneySectionProps {
  montant: string;
}

export default function MobileMoneySection({ montant }: MobileMoneySectionProps) {
  const { orange, moov } = MOBILE_MONEY;

  if (!orange.actif && !moov.actif) {
    return null;
  }

  return (
    <div className="flex flex-col gap-3">
      <h2 className="text-sm font-semibold text-neutral-800 uppercase tracking-wide">
        Payer par Mobile Money
      </h2>
      <div className="grid sm:grid-cols-2 gap-4">
        {orange.actif && (
          <OperateurCard
            nom="Orange Money"
            config={orange}
            telCode="*144#"
            telHref="tel:*144%23"
            montant={montant}
            colors={{
              border: "border-orange-300",
              bg: "bg-orange-50",
              text: "text-orange-700",
              button: "bg-orange-500",
              buttonHover: "hover:bg-orange-600",
            }}
          />
        )}
        {moov.actif && (
          <OperateurCard
            nom="Moov Money"
            config={moov}
            telCode="*555#"
            telHref="tel:*555%23"
            montant={montant}
            colors={{
              border: "border-blue-300",
              bg: "bg-blue-50",
              text: "text-blue-700",
              button: "bg-blue-600",
              buttonHover: "hover:bg-blue-700",
            }}
          />
        )}
      </div>
    </div>
  );
}
