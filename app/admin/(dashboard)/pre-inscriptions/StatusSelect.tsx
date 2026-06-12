"use client";

import { useState, useTransition } from "react";
import { updatePreInscriptionStatut } from "./actions";
import { STATUT_OPTIONS } from "./statuts";

interface StatusSelectProps {
  id: string;
  currentStatut: string;
}

export default function StatusSelect({ id, currentStatut }: StatusSelectProps) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  // Si une valeur existante en base ne fait pas partie des options connues,
  // on l'ajoute pour ne jamais masquer/écraser une donnée existante.
  const knownValues = STATUT_OPTIONS.map((o) => o.value as string);
  const options = knownValues.includes(currentStatut)
    ? STATUT_OPTIONS
    : [{ value: currentStatut, label: currentStatut }, ...STATUT_OPTIONS];

  function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const statut = e.target.value;
    setError(null);
    startTransition(async () => {
      const result = await updatePreInscriptionStatut(id, statut);
      if (!result.success) {
        setError(result.error);
      }
    });
  }

  return (
    <div className="flex flex-col gap-1">
      <select
        defaultValue={currentStatut}
        onChange={handleChange}
        disabled={isPending}
        aria-label="Statut de la pré-inscription"
        className="border border-neutral-300 rounded px-2 py-1.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary-600 focus:border-transparent transition disabled:opacity-50"
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {error && (
        <p role="alert" className="text-xs text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}
