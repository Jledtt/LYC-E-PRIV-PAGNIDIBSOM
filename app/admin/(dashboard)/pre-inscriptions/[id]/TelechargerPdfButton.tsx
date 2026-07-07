"use client";

interface TelechargerPdfButtonProps {
  id: string;
}

export default function TelechargerPdfButton({ id }: TelechargerPdfButtonProps) {
  return (
    <button
      type="button"
      onClick={() => window.open(`/api/pdf/pre-inscription?id=${id}`, "_blank")}
      className="inline-flex items-center gap-1.5 border border-primary-800 text-primary-800 hover:bg-primary-50 text-sm font-medium px-4 py-2 rounded transition-colors"
    >
      📄 Télécharger dossier PDF
    </button>
  );
}
