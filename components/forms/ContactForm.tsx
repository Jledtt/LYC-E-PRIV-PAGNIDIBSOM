"use client";

import { useRef, useState, useTransition } from "react";
import { submitContact } from "@/actions/contact";
import type { ActionResult } from "@/actions/pre-inscription";
import FormField, { inputClasses } from "@/components/ui/FormField";

type FieldErrors = Record<string, string[]>;

function getError(fieldErrors: FieldErrors | undefined, key: string): string | undefined {
  return fieldErrors?.[key]?.[0];
}

export default function ContactForm() {
  const formRef = useRef<HTMLFormElement>(null);
  const [result, setResult] = useState<ActionResult | null>(null);
  const [isPending, startTransition] = useTransition();

  const fieldErrors = result && !result.success ? (result.fieldErrors ?? {}) : undefined;

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    startTransition(async () => {
      const res = await submitContact(formData);
      setResult(res);
      if (res.success) {
        formRef.current?.reset();
      }
    });
  }

  if (result?.success) {
    return (
      <div role="alert" className="text-center py-8 flex flex-col items-center gap-4">
        <div className="w-14 h-14 rounded-full bg-green-100 text-green-600 flex items-center justify-center text-2xl">
          ✓
        </div>
        <h2 className="text-xl font-bold text-primary-800">Message envoyé !</h2>
        <p className="text-neutral-600 max-w-sm">
          Merci pour votre message. Nous vous répondrons dans les plus brefs délais.
        </p>
        <button
          type="button"
          onClick={() => setResult(null)}
          className="text-primary-700 underline text-sm"
        >
          Envoyer un autre message
        </button>
      </div>
    );
  }

  return (
    <form ref={formRef} onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
      {/* Honeypot — hors écran, jamais display:none (trop détectable) */}
      <input
        type="text"
        name="website"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        style={{
          position: "absolute",
          left: "-9999px",
          width: "1px",
          height: "1px",
          overflow: "hidden",
        }}
      />

      {result && !result.success && (
        <div role="alert" className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700 text-sm">
          {result.error}
        </div>
      )}

      <FormField id="nom" label="Nom" required error={getError(fieldErrors, "nom")}>
        <input
          id="nom"
          name="nom"
          type="text"
          required
          autoComplete="name"
          className={inputClasses}
          aria-invalid={!!getError(fieldErrors, "nom")}
          aria-describedby={getError(fieldErrors, "nom") ? "nom-error" : undefined}
        />
      </FormField>

      <FormField
        id="telephone"
        label="Téléphone"
        error={getError(fieldErrors, "telephone")}
        hint="Téléphone ou email — au moins un est requis"
      >
        <input
          id="telephone"
          name="telephone"
          type="tel"
          autoComplete="tel"
          className={inputClasses}
          placeholder="+226 00 00 00 00"
          aria-invalid={!!getError(fieldErrors, "telephone")}
          aria-describedby={getError(fieldErrors, "telephone") ? "telephone-error" : undefined}
        />
      </FormField>

      <FormField id="email" label="Email" error={getError(fieldErrors, "email")}>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          className={inputClasses}
          placeholder="votre@email.com (facultatif)"
          aria-invalid={!!getError(fieldErrors, "email")}
          aria-describedby={getError(fieldErrors, "email") ? "email-error" : undefined}
        />
      </FormField>

      <FormField id="message" label="Message" required error={getError(fieldErrors, "message")}>
        <textarea
          id="message"
          name="message"
          rows={5}
          required
          className={inputClasses}
          placeholder="Votre message..."
          aria-invalid={!!getError(fieldErrors, "message")}
          aria-describedby={getError(fieldErrors, "message") ? "message-error" : undefined}
        />
      </FormField>

      <p className="text-xs text-neutral-500">
        Les champs marqués d'un <span className="text-red-600 font-bold">*</span> sont obligatoires. Téléphone ou email : au moins un est requis.
      </p>

      <button
        type="submit"
        disabled={isPending}
        className="w-full bg-primary-700 hover:bg-primary-800 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600 focus-visible:ring-offset-2"
      >
        {isPending ? "Envoi en cours..." : "Envoyer le message"}
      </button>
    </form>
  );
}
