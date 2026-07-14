"use client";

interface GenererCarteButtonProps {
  id: string;
  eligible: boolean;
}

export default function GenererCarteButton({ id, eligible }: GenererCarteButtonProps) {
  if (!eligible) {
    return (
      <div className="flex flex-col gap-1 items-start">
        <button
          type="button"
          disabled
          className="inline-flex items-center gap-1.5 border border-neutral-300 text-neutral-400 text-sm font-medium px-4 py-2 rounded cursor-not-allowed"
        >
          🪪 Générer la carte scolaire
        </button>
        <p className="text-xs text-red-600">
          Photo et contact d&rsquo;urgence requis avant de générer la carte.
        </p>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={() => window.open(`/api/pdf/carte-scolaire?id=${id}`, "_blank")}
      className="inline-flex items-center gap-1.5 border border-primary-800 text-primary-800 hover:bg-primary-50 text-sm font-medium px-4 py-2 rounded transition-colors"
    >
      🪪 Générer la carte scolaire
    </button>
  );
}
