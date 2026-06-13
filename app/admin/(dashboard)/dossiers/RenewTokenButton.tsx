"use client";

import { useState, useTransition } from "react";
import { renewDossierTokenAction } from "./actions";
import { copyToClipboard } from "@/lib/clipboard";

interface RenewTokenButtonProps {
  preInscriptionId: string;
  eleveNom: string;
  elevePrenom: string;
}

export default function RenewTokenButton({ preInscriptionId, eleveNom, elevePrenom }: RenewTokenButtonProps) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [newUrl, setNewUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  function handleClick() {
    if (!window.confirm("Cela invalidera l'ancien lien. Continuer ?")) return;

    setError(null);
    startTransition(async () => {
      const result = await renewDossierTokenAction(preInscriptionId);
      if (!result.success) {
        setError(result.error);
        return;
      }
      setNewUrl(result.newUrl);
      setCopied(false);
    });
  }

  async function handleCopy() {
    if (!newUrl) return;
    const ok = await copyToClipboard(newUrl);
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  }

  const nomComplet = `${elevePrenom} ${eleveNom}`.trim();
  const whatsappMessage = newUrl
    ? `Bonjour, voici le nouveau lien pour compléter et suivre le dossier d'inscription de ${nomComplet || "l'élève"} au Lycée Privé Pagnidibsom : ${newUrl}`
    : "";
  const whatsappHref = `https://wa.me/?text=${encodeURIComponent(whatsappMessage)}`;

  return (
    <div className="flex flex-col gap-3">
      <button
        type="button"
        onClick={handleClick}
        disabled={isPending}
        className="self-start px-3 py-1.5 rounded text-sm font-medium bg-primary-50 text-primary-800 hover:bg-primary-100 transition-colors disabled:opacity-50 whitespace-nowrap"
      >
        {isPending ? "Renouvellement..." : "Renouveler le lien"}
      </button>

      {error && (
        <p role="alert" className="text-xs text-red-600">
          {error}
        </p>
      )}

      {newUrl && (
        <div className="flex flex-col gap-3 p-4 rounded-lg border border-accent-200 bg-[#FFFDF8]">
          <p className="text-sm text-[#1F2937]">
            Nouveau lien généré — l&apos;ancien lien n&apos;est plus valide.
          </p>
          <div className="flex flex-col sm:flex-row gap-2">
            <input
              type="text"
              readOnly
              value={newUrl}
              onFocus={(e) => e.currentTarget.select()}
              className="flex-1 min-w-0 text-xs sm:text-sm rounded-lg border border-neutral-300 bg-white px-3 py-2 text-[#1F2937] font-mono"
              aria-label="Nouveau lien d'accès au dossier"
            />
            <button
              type="button"
              onClick={handleCopy}
              className="shrink-0 rounded-lg border border-primary-800 text-primary-800 px-3 py-2 text-sm font-semibold hover:bg-primary-50 transition-colors"
            >
              {copied ? "Lien copié !" : "Copier le lien"}
            </button>
          </div>
          <a
            href={whatsappHref}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center rounded-lg bg-accent-500 hover:bg-accent-600 text-white font-semibold py-2 px-4 text-sm transition-colors"
          >
            Envoyer ce lien sur WhatsApp
          </a>
        </div>
      )}
    </div>
  );
}
