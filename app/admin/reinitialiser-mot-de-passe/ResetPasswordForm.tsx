"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import FormField, { inputClasses } from "@/components/ui/FormField";

type PageStatus = "loading" | "ready" | "invalid" | "success";

export default function ResetPasswordForm() {
  const router = useRouter();
  const [pageStatus, setPageStatus] = useState<PageStatus>("loading");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);
  const resolvedRef = useRef(false);

  useEffect(() => {
    const supabase = createClient();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") {
        resolvedRef.current = true;
        setPageStatus("ready");
      }
    });

    // Si aucun événement PASSWORD_RECOVERY en 3 s, le lien est invalide/expiré
    const timer = setTimeout(() => {
      if (!resolvedRef.current) {
        setPageStatus("invalid");
      }
    }, 3000);

    return () => {
      subscription.unsubscribe();
      clearTimeout(timer);
    };
  }, []);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    if (password.length < 8) {
      setError("Le mot de passe doit contenir au moins 8 caractères.");
      return;
    }

    if (password !== confirm) {
      setError("Les deux mots de passe ne correspondent pas.");
      return;
    }

    setIsPending(true);

    try {
      const supabase = createClient();
      const { error: updateError } = await supabase.auth.updateUser({ password });

      if (updateError) {
        setError("Erreur lors de la réinitialisation. Veuillez réessayer.");
        setIsPending(false);
        return;
      }
    } catch {
      setError("Erreur réseau, réessayez.");
      setIsPending(false);
      return;
    }

    setPageStatus("success");
    setTimeout(() => router.push("/admin/login"), 3000);
  }

  if (pageStatus === "loading") {
    return (
      <div className="flex items-center justify-center py-8 text-neutral-500 text-sm">
        Vérification en cours…
      </div>
    );
  }

  if (pageStatus === "invalid") {
    return (
      <div className="flex flex-col gap-5">
        <div
          role="alert"
          className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700 text-sm"
        >
          Ce lien de réinitialisation est invalide ou a expiré.
        </div>
        <Link
          href="/admin/mot-de-passe-oublie"
          className="text-sm text-primary-700 hover:text-primary-900 text-center underline underline-offset-2"
        >
          Demander un nouveau lien
        </Link>
      </div>
    );
  }

  if (pageStatus === "success") {
    return (
      <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-green-800 text-sm">
        Mot de passe modifié avec succès. Redirection vers la connexion…
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
      {error && (
        <div
          role="alert"
          className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700 text-sm"
        >
          {error}
        </div>
      )}

      <FormField
        id="password"
        label="Nouveau mot de passe"
        required
        hint="8 caractères minimum"
      >
        <input
          id="password"
          name="password"
          type="password"
          required
          autoComplete="new-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className={inputClasses}
        />
      </FormField>

      <FormField id="confirm" label="Confirmer le mot de passe" required>
        <input
          id="confirm"
          name="confirm"
          type="password"
          required
          autoComplete="new-password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          className={inputClasses}
        />
      </FormField>

      <button
        type="submit"
        disabled={isPending}
        className="w-full bg-primary-800 hover:bg-primary-900 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600 focus-visible:ring-offset-2"
      >
        {isPending ? "Enregistrement…" : "Enregistrer le mot de passe"}
      </button>
    </form>
  );
}
