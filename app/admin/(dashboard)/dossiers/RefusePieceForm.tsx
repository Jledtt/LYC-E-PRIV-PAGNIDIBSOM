"use client";

import { useState, useTransition } from "react";
import { refusePieceAction } from "./actions";

interface RefusePieceFormProps {
  preInscriptionId: string;
  pieceCode: string;
}

export default function RefusePieceForm({ preInscriptionId, pieceCode }: RefusePieceFormProps) {
  const [open, setOpen] = useState(false);
  const [motif, setMotif] = useState("");
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleSubmit() {
    setError(null);
    startTransition(async () => {
      const result = await refusePieceAction(preInscriptionId, pieceCode, motif);
      if (!result.success) {
        setError(result.error);
        return;
      }
      setOpen(false);
      setMotif("");
    });
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="px-3 py-1.5 rounded text-sm font-medium bg-red-50 text-red-700 hover:bg-red-100 transition-colors whitespace-nowrap"
      >
        Demander à refaire
      </button>
    );
  }

  return (
    <div className="flex flex-col gap-2 w-full max-w-md">
      <label htmlFor={`motif-${pieceCode}`} className="text-sm font-medium text-[#1F2937]">
        Motif (visible par le parent)
      </label>
      <textarea
        id={`motif-${pieceCode}`}
        value={motif}
        onChange={(e) => setMotif(e.target.value)}
        rows={3}
        disabled={isPending}
        className="border border-neutral-300 rounded px-2 py-1.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary-600 focus:border-transparent transition disabled:opacity-50"
      />
      {error && (
        <p role="alert" className="text-xs text-red-600">
          {error}
        </p>
      )}
      <div className="flex gap-2">
        <button
          type="button"
          onClick={handleSubmit}
          disabled={isPending}
          className="px-3 py-1.5 rounded text-sm font-medium bg-primary-800 text-white hover:bg-primary-900 transition-colors disabled:opacity-50"
        >
          {isPending ? "Envoi..." : "Confirmer"}
        </button>
        <button
          type="button"
          onClick={() => {
            setOpen(false);
            setMotif("");
            setError(null);
          }}
          disabled={isPending}
          className="px-3 py-1.5 rounded text-sm font-medium text-neutral-600 hover:bg-neutral-100 transition-colors disabled:opacity-50"
        >
          Annuler
        </button>
      </div>
    </div>
  );
}
