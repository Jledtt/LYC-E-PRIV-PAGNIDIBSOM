"use client";

import { useState, useTransition } from "react";
import { updateClasseActuelle } from "./actions";
import { CLASSES } from "@/lib/scolarite";

interface Props {
  id: string;
  currentClasse: string | null;
}

export default function ClasseActuelleSelect({ id, currentClasse }: Props) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const value = e.target.value;
    setError(null);
    startTransition(async () => {
      const result = await updateClasseActuelle(id, value || null);
      if (!result.success) setError(result.error);
    });
  }

  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-semibold text-neutral-500 uppercase tracking-wide">
        Classe actuelle
      </label>
      <select
        defaultValue={currentClasse ?? ""}
        onChange={handleChange}
        disabled={isPending}
        aria-label="Classe actuelle assignée à l'élève"
        className="border border-neutral-300 rounded px-2 py-1.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary-600 focus:border-transparent transition disabled:opacity-50"
      >
        <option value="">— Non assignée —</option>
        {CLASSES.map((c) => (
          <option key={c} value={c}>
            {c}
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
