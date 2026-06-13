"use client";

import { useRef, useState, useTransition } from "react";
import imageCompression from "browser-image-compression";
import { uploadPieceAction } from "./actions";
import { MAX_PDF_SIZE_BYTES } from "./upload-constants";

interface UploadPieceFormProps {
  token: string;
  pieceCode: string;
  pieceLabel: string;
}

type UploadState = "idle" | "compressing" | "sending" | "success" | "error";

export default function UploadPieceForm({ token, pieceCode, pieceLabel }: UploadPieceFormProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [state, setState] = useState<UploadState>("idle");
  const [error, setError] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  async function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);

    let toSend: File | Blob = file;

    if (file.type === "application/pdf") {
      if (file.size > MAX_PDF_SIZE_BYTES) {
        setState("error");
        setError("Fichier PDF trop volumineux (5 Mo maximum).");
        if (inputRef.current) inputRef.current.value = "";
        return;
      }
    } else {
      setState("compressing");
      try {
        toSend = await imageCompression(file, {
          maxSizeMB: 1,
          maxWidthOrHeight: 2000,
          useWebWorker: true,
        });
      } catch (err) {
        console.error("[mon-dossier] Erreur compression image :", err);
        setState("error");
        setError("Erreur lors du traitement de l'image. Veuillez réessayer.");
        if (inputRef.current) inputRef.current.value = "";
        return;
      }
    }

    setState("sending");
    const body = new FormData();
    body.set("file", toSend, file.name);

    startTransition(async () => {
      const res = await uploadPieceAction(token, pieceCode, body);
      if (res.success) {
        setState("success");
      } else {
        setState("error");
        setError(res.error);
      }
      if (inputRef.current) inputRef.current.value = "";
    });
  }

  const busy = state === "compressing" || state === "sending";

  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={`file-${pieceCode}`} className="sr-only">
        Déposer le document : {pieceLabel}
      </label>
      <input
        ref={inputRef}
        id={`file-${pieceCode}`}
        type="file"
        accept="image/*,application/pdf"
        onChange={handleChange}
        disabled={busy}
        className="block w-full text-sm text-[#1F2937] border border-neutral-300 rounded-lg cursor-pointer bg-white file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-accent-500 file:text-white file:font-semibold file:cursor-pointer hover:file:bg-accent-600 disabled:opacity-50 disabled:cursor-not-allowed"
      />

      {state === "compressing" && (
        <p className="text-sm text-neutral-500">Traitement de l&apos;image...</p>
      )}
      {state === "sending" && <p className="text-sm text-neutral-500">Envoi en cours...</p>}
      {state === "success" && (
        <p role="status" className="text-sm font-semibold text-green-700">
          Document envoyé avec succès.
        </p>
      )}
      {state === "error" && error && (
        <p role="alert" className="text-sm text-red-700">
          {error}
        </p>
      )}

      <p className="text-xs text-neutral-500">
        Formats acceptés : photo (JPEG, PNG, WebP) ou PDF — 5 Mo maximum.
      </p>
    </div>
  );
}
