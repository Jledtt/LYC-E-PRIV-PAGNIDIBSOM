"use client";

import { useActionState } from "react";
import { loginParent } from "@/actions/parent-auth";
import type { ParentActionResult } from "@/actions/parent-auth";
import FormField, { inputClasses } from "@/components/ui/FormField";

export default function LoginForm() {
  const [state, formAction, isPending] = useActionState<ParentActionResult | null, FormData>(
    async (_prevState, formData) => loginParent(formData),
    null
  );

  return (
    <form action={formAction} noValidate className="flex flex-col gap-5">
      {state && !state.success && (
        <div role="alert" className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700 text-sm">
          {state.error}
        </div>
      )}

      <FormField id="email" label="Email" required>
        <input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="username"
          className={inputClasses}
        />
      </FormField>

      <FormField id="password" label="Mot de passe" required>
        <input
          id="password"
          name="password"
          type="password"
          required
          autoComplete="current-password"
          className={inputClasses}
        />
      </FormField>

      <button
        type="submit"
        disabled={isPending}
        className="w-full bg-primary-800 hover:bg-primary-900 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600 focus-visible:ring-offset-2"
      >
        {isPending ? "Connexion en cours..." : "Se connecter"}
      </button>
    </form>
  );
}
