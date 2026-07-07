"use client";

import { useState } from "react";
import { siteConfig } from "@/config/site";

interface DossierTokenSectionProps {
  dossierToken: string | null;
}

function CopyButton({ value, label }: { value: string; label: string }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    await navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      className="inline-flex items-center gap-1.5 bg-primary-800 hover:bg-primary-900 text-white text-sm font-medium px-4 py-2 rounded transition-colors"
    >
      {copied ? "✓ Copié !" : label}
    </button>
  );
}

export default function DossierTokenSection({ dossierToken }: DossierTokenSectionProps) {
  return (
    <div className="bg-white border border-neutral-200 rounded-lg p-5 mt-6">
      <h2 className="font-semibold text-primary-800 mb-4">Lien de suivi dossier</h2>

      {dossierToken ? (
        <div className="flex flex-col gap-4">
          <div>
            <dt className="text-xs font-semibold text-neutral-500 uppercase tracking-wide">
              Token
            </dt>
            <dd className="text-sm text-[#1F2937] mt-0.5 font-mono break-all">{dossierToken}</dd>
          </div>

          <div>
            <dt className="text-xs font-semibold text-neutral-500 uppercase tracking-wide">
              Lien complet
            </dt>
            <dd className="text-sm text-[#1F2937] mt-0.5 break-all">
              {siteConfig.url}/mon-dossier/{dossierToken}
            </dd>
          </div>

          <div className="flex flex-wrap gap-3">
            <CopyButton
              value={`${siteConfig.url}/mon-dossier/${dossierToken}`}
              label="Copier le lien"
            />
            <CopyButton value={dossierToken} label="Copier le token" />
          </div>
        </div>
      ) : (
        <p className="text-sm text-neutral-500">Aucun token généré.</p>
      )}
    </div>
  );
}
