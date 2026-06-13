"use client";

import { useState, useTransition } from "react";
import { validatePieceAction } from "./actions";

interface ValidatePieceButtonProps {
  preInscriptionId: string;
  pieceCode: string;
}

export default function ValidatePieceButton({ preInscriptionId, pieceCode }: ValidatePieceButtonProps) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleClick() {
    setError(null);
    startTransition(async () => {
      const result = await validatePieceAction(preInscriptionId, pieceCode);
      if (!result.success) {
        setError(result.error);
      }
    });
  }

  return (
    <div className="flex flex-col gap-1">
      <button
        type="button"
        onClick={handleClick}
        disabled={isPending}
        className="px-3 py-1.5 rounded text-sm font-medium bg-green-100 text-green-700 hover:bg-green-200 transition-colors disabled:opacity-50 whitespace-nowrap"
      >
        {isPending ? "..." : "Valider"}
      </button>
      {error && (
        <p role="alert" className="text-xs text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}
