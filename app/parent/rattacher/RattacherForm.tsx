"use client";

import { useActionState } from "react";
import Link from "next/link";
import { rattacherEleve } from "@/actions/parent-auth";
import type { RattacherResult } from "@/actions/parent-auth";
import FormField, { inputClasses } from "@/components/ui/FormField";

export default function RattacherForm() {
  const [state, formAction, isPending] = useActionState<RattacherResult | null, FormData>(
    async (_prevState, formData) => rattacherEleve(String(formData.get("token") ?? "")),
    null
  );

  if (state?.success) {
    return (
      <div role="alert" className="text-center py-6 flex flex-col items-center gap-4">
        <div className="w-14 h-14 rounded-full bg-green-100 text-green-600 flex items-center justify-center text-2xl">
          ✓
        </div>
        <p className="text-neutral-700">
          Élève <strong>{state.elevePrenom} {state.eleveNom}</strong> rattaché avec succès.
        </p>
        <Link
          href="/parent/dashboard"
          className="bg-primary-800 hover:bg-primary-900 text-white font-semibold px-5 py-2.5 rounded-lg transition-colors"
        >
          Accéder à mon espace
        </Link>
      </div>
    );
  }

  return (
    <form action={formAction} noValidate className="flex flex-col gap-5">
      {state && !state.success && (
        <div role="alert" className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700 text-sm">
          {state.error}
        </div>
      )}

      <FormField
        id="token"
        label="Code de suivi de dossier"
        required
        hint="Entrez le code reçu dans votre lien WhatsApp après votre pré-inscription."
      >
        <input
          id="token"
          name="token"
          type="text"
          required
          autoComplete="off"
          className={inputClasses}
        />
      </FormField>

      <button
        type="submit"
        disabled={isPending}
        className="w-full bg-primary-800 hover:bg-primary-900 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600 focus-visible:ring-offset-2"
      >
        {isPending ? "Rattachement en cours..." : "Rattacher cet élève"}
      </button>
    </form>
  );
}
