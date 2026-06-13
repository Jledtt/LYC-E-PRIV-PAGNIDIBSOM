"use client";

import { useState } from "react";
import { copyToClipboard } from "@/lib/clipboard";
import RenewTokenButton from "./RenewTokenButton";

interface DossierAccessCardProps {
  preInscriptionId: string;
  dossierUrl: string;
  expiresAt: string | null;
  eleveNom: string;
  elevePrenom: string;
}

export default function DossierAccessCard({
  preInscriptionId,
  dossierUrl,
  expiresAt,
  eleveNom,
  elevePrenom,
}: DossierAccessCardProps) {
  const [copied, setCopied] = useState(false);

  const expiresDate = expiresAt ? new Date(expiresAt) : null;
  const isExpired = !expiresDate || expiresDate.getTime() < Date.now();
  const expirationLabel = expiresDate
    ? `${isExpired ? "Expiré depuis le" : "Expire le"} ${expiresDate.toLocaleDateString("fr-FR")}`
    : "Date d'expiration inconnue";

  async function handleCopy() {
    const ok = await copyToClipboard(dossierUrl);
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  }

  return (
    <div className="bg-white border border-neutral-200 rounded-lg p-5 mb-8">
      <h2 className="font-semibold text-primary-800 mb-3">Accès au dossier</h2>

      <div className="flex flex-col sm:flex-row gap-2 mb-2">
        <input
          type="text"
          readOnly
          value={dossierUrl}
          onFocus={(e) => e.currentTarget.select()}
          className="flex-1 min-w-0 text-xs sm:text-sm rounded-lg border border-neutral-300 bg-white px-3 py-2 text-[#1F2937] font-mono"
          aria-label="Lien d'accès au dossier"
        />
        <button
          type="button"
          onClick={handleCopy}
          className="shrink-0 rounded-lg border border-primary-800 text-primary-800 px-3 py-2 text-sm font-semibold hover:bg-primary-50 transition-colors"
        >
          {copied ? "Lien copié !" : "Copier le lien"}
        </button>
      </div>

      <p className={["text-sm mb-3", isExpired ? "text-primary-800 font-semibold" : "text-neutral-600"].join(" ")}>
        {expirationLabel}
      </p>

      <RenewTokenButton preInscriptionId={preInscriptionId} eleveNom={eleveNom} elevePrenom={elevePrenom} />
    </div>
  );
}
