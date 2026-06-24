"use client";

import { useActionState } from "react";
import { registerParent } from "@/actions/parent-auth";
import type { ParentActionResult } from "@/actions/parent-auth";
import { registerParentFormSchema } from "@/lib/schemas";
import FormField, { inputClasses } from "@/components/ui/FormField";

function getError(fieldErrors: Record<string, string[]> | undefined, key: string): string | undefined {
  return fieldErrors?.[key]?.[0];
}

async function action(
  _prevState: ParentActionResult | null,
  formData: FormData
): Promise<ParentActionResult> {
  // Validation Zod côté client : on s'arrête ici (sans appeler le serveur)
  // si les champs sont invalides ou si les mots de passe ne correspondent pas.
  const raw = Object.fromEntries(formData.entries());
  const parsed = registerParentFormSchema.safeParse(raw);

  if (!parsed.success) {
    const fieldErrors: Record<string, string[]> = {};
    for (const [key, msgs] of Object.entries(parsed.error.flatten().fieldErrors)) {
      if (msgs) fieldErrors[key] = msgs;
    }
    return {
      success: false,
      error: "Veuillez corriger les erreurs dans le formulaire.",
      fieldErrors,
    };
  }

  return registerParent(formData);
}

export default function RegisterForm() {
  const [state, formAction, isPending] = useActionState<ParentActionResult | null, FormData>(
    action,
    null
  );

  const fieldErrors = state && !state.success ? state.fieldErrors : undefined;

  if (state?.success) {
    return (
      <div role="alert" className="text-center py-6 flex flex-col items-center gap-4">
        <div className="w-14 h-14 rounded-full bg-green-100 text-green-600 flex items-center justify-center text-2xl">
          ✓
        </div>
        <p className="text-neutral-700">
          Vérifiez votre email pour confirmer votre compte. Une fois confirmé, vous pourrez vous
          connecter et rattacher le dossier de votre enfant.
        </p>
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

      <FormField id="displayName" label="Nom complet" required error={getError(fieldErrors, "displayName")}>
        <input
          id="displayName"
          name="displayName"
          type="text"
          required
          autoComplete="name"
          className={inputClasses}
          aria-invalid={!!getError(fieldErrors, "displayName")}
        />
      </FormField>

      <FormField id="email" label="Email" required error={getError(fieldErrors, "email")}>
        <input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="email"
          className={inputClasses}
          aria-invalid={!!getError(fieldErrors, "email")}
        />
      </FormField>

      <FormField
        id="password"
        label="Mot de passe"
        required
        error={getError(fieldErrors, "password")}
        hint="8 caractères minimum"
      >
        <input
          id="password"
          name="password"
          type="password"
          required
          autoComplete="new-password"
          className={inputClasses}
          aria-invalid={!!getError(fieldErrors, "password")}
        />
      </FormField>

      <FormField
        id="confirmPassword"
        label="Confirmer le mot de passe"
        required
        error={getError(fieldErrors, "confirmPassword")}
      >
        <input
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          required
          autoComplete="new-password"
          className={inputClasses}
          aria-invalid={!!getError(fieldErrors, "confirmPassword")}
        />
      </FormField>

      <button
        type="submit"
        disabled={isPending}
        className="w-full bg-primary-800 hover:bg-primary-900 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600 focus-visible:ring-offset-2"
      >
        {isPending ? "Création en cours..." : "Créer mon compte"}
      </button>
    </form>
  );
}
