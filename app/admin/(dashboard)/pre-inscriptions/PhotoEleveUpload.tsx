"use client";

import { useRef, useState, useTransition } from "react";
import { uploadPhotoEleve } from "./actions";
import {
  ALLOWED_PHOTO_TYPES,
  MAX_PHOTO_SIZE_BYTES,
  MIN_PHOTO_WIDTH,
  MIN_PHOTO_HEIGHT,
  PHOTO_RATIO_MIN,
  PHOTO_RATIO_MAX,
} from "./photo-constants";

interface Props {
  id: string;
  currentPhotoSignedUrl: string | null;
}

type UploadState = "idle" | "checking" | "sending" | "success" | "error";

function checkDimensions(file: File): Promise<{ ok: true } | { ok: false; error: string }> {
  return new Promise((resolve) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      const { naturalWidth: w, naturalHeight: h } = img;
      URL.revokeObjectURL(url);
      if (w < MIN_PHOTO_WIDTH || h < MIN_PHOTO_HEIGHT) {
        resolve({
          ok: false,
          error: `Photo trop petite (${w}×${h}px) — minimum ${MIN_PHOTO_WIDTH}×${MIN_PHOTO_HEIGHT}px.`,
        });
        return;
      }
      const ratio = w / h;
      if (ratio < PHOTO_RATIO_MIN || ratio > PHOTO_RATIO_MAX) {
        resolve({
          ok: false,
          error: "Format inattendu — une photo portrait (type identité) est requise.",
        });
        return;
      }
      resolve({ ok: true });
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      resolve({ ok: false, error: "Impossible de lire cette image." });
    };
    img.src = url;
  });
}

export default function PhotoEleveUpload({ id, currentPhotoSignedUrl }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [state, setState] = useState<UploadState>("idle");
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  async function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);

    if (!ALLOWED_PHOTO_TYPES.includes(file.type as (typeof ALLOWED_PHOTO_TYPES)[number])) {
      setState("error");
      setError("Format non supporté (JPEG ou PNG uniquement).");
      if (inputRef.current) inputRef.current.value = "";
      return;
    }

    if (file.size > MAX_PHOTO_SIZE_BYTES) {
      setState("error");
      setError("Photo trop volumineuse (2 Mo maximum).");
      if (inputRef.current) inputRef.current.value = "";
      return;
    }

    setState("checking");
    const dimensionCheck = await checkDimensions(file);
    if (!dimensionCheck.ok) {
      setState("error");
      setError(dimensionCheck.error);
      if (inputRef.current) inputRef.current.value = "";
      return;
    }

    setPreview(URL.createObjectURL(file));
    setState("sending");
    const body = new FormData();
    body.set("file", file, file.name);

    startTransition(async () => {
      const res = await uploadPhotoEleve(id, body);
      if (res.success) {
        setState("success");
      } else {
        setState("error");
        setError(res.error);
      }
      if (inputRef.current) inputRef.current.value = "";
    });
  }

  const busy = state === "checking" || state === "sending";
  const displayedPhoto = preview ?? currentPhotoSignedUrl;

  return (
    <div className="flex flex-col gap-2">
      <label className="text-xs font-semibold text-neutral-500 uppercase tracking-wide">
        Photo (carte scolaire)
      </label>

      <div className="flex items-center gap-3">
        {displayedPhoto ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={displayedPhoto}
            alt="Photo de l'élève"
            className="w-16 h-20 object-cover rounded border border-neutral-300"
          />
        ) : (
          <div className="w-16 h-20 rounded border border-dashed border-neutral-300 bg-neutral-50 flex items-center justify-center text-neutral-400 text-xs text-center px-1">
            Aucune photo
          </div>
        )}

        <div className="flex flex-col gap-1">
          <input
            ref={inputRef}
            type="file"
            accept="image/jpeg,image/png"
            onChange={handleChange}
            disabled={busy}
            className="block text-xs text-neutral-800 file:mr-3 file:py-1.5 file:px-3 file:rounded file:border-0 file:bg-primary-800 file:text-white file:font-semibold file:cursor-pointer hover:file:bg-primary-900 disabled:opacity-50"
          />
          {state === "checking" && (
            <p className="text-xs text-neutral-500">Vérification de l&rsquo;image...</p>
          )}
          {state === "sending" && <p className="text-xs text-neutral-500">Envoi en cours...</p>}
          {state === "success" && <p className="text-xs text-green-700">Photo enregistrée.</p>}
          {state === "error" && error && (
            <p role="alert" className="text-xs text-red-600">
              {error}
            </p>
          )}
          <p className="text-xs text-neutral-400">
            JPEG/PNG, min. {MIN_PHOTO_WIDTH}×{MIN_PHOTO_HEIGHT}px, portrait — 2 Mo max.
          </p>
        </div>
      </div>
    </div>
  );
}
