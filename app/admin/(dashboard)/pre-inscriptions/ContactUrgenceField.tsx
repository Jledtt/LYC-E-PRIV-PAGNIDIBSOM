"use client";

import { useState, useTransition } from "react";
import { updateContactUrgence } from "./actions";

interface Props {
  id: string;
  currentTelephone: string | null;
}

export default function ContactUrgenceField({ id, currentTelephone }: Props) {
  const [value, setValue] = useState(currentTelephone ?? "");
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  function handleBlur() {
    setError(null);
    if (value.trim() === (currentTelephone ?? "").trim()) return;

    startTransition(async () => {
      const result = await updateContactUrgence(id, value);
      if (!result.success) {
        setError(result.error);
        setSaved(false);
      } else {
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
      }
    });
  }

  return (
    <div className="flex flex-col gap-1">
      <label
        htmlFor={`contact-urgence-${id}`}
        className="text-xs font-semibold text-neutral-500 uppercase tracking-wide"
      >
        Contact d&rsquo;urgence
      </label>
      <input
        id={`contact-urgence-${id}`}
        type="tel"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onBlur={handleBlur}
        disabled={isPending}
        placeholder="+226 00 00 00 00"
        className="border border-neutral-300 rounded px-2 py-1.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary-600 focus:border-transparent transition disabled:opacity-50"
      />
      {error && (
        <p role="alert" className="text-xs text-red-600">
          {error}
        </p>
      )}
      {saved && <p className="text-xs text-green-700">Enregistré</p>}
    </div>
  );
}
