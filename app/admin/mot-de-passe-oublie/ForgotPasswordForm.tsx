"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import FormField, { inputClasses } from "@/components/ui/FormField";

type Status = "idle" | "success";

export default function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [isPending, setIsPending] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsPending(true);

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "";

    try {
      const supabase = createClient();
      await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${siteUrl}/admin/reinitialiser-mot-de-passe`,
      });
    } catch {
      // L'erreur n'est pas révélée à l'utilisateur (bonne pratique sécurité)
    }

    setStatus("success");
    setIsPending(false);
  }

  if (status === "success") {
    return (
      <div className="flex flex-col gap-5">
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-green-800 text-sm">
          Si un compte existe avec cet email, vous recevrez un lien de
          réinitialisation sous peu.
        </div>
        <Link
          href="/admin/login"
          className="text-sm text-neutral-500 hover:text-neutral-700 text-center"
        >
          ← Retour à la connexion
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
      <FormField id="email" label="Adresse email" required>
        <input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="username"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className={inputClasses}
        />
      </FormField>

      <button
        type="submit"
        disabled={isPending}
        className="w-full bg-primary-800 hover:bg-primary-900 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600 focus-visible:ring-offset-2"
      >
        {isPending ? "Envoi en cours…" : "Envoyer le lien"}
      </button>

      <Link
        href="/admin/login"
        className="text-sm text-neutral-500 hover:text-neutral-700 text-center"
      >
        ← Retour à la connexion
      </Link>
    </form>
  );
}
