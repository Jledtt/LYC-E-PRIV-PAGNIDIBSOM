import type { Metadata } from "next";
import ResetPasswordForm from "./ResetPasswordForm";

export const metadata: Metadata = {
  title: "Réinitialiser le mot de passe",
};

export const dynamic = "force-dynamic";

export default function ResetPasswordPage() {
  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-neutral-50 px-4 py-12">
      <div className="w-full max-w-sm bg-white border border-neutral-200 rounded-lg shadow-sm p-8">
        <h1 className="text-xl font-bold text-primary-800 heading-serif mb-1">
          Nouveau mot de passe
        </h1>
        <p className="text-sm text-neutral-500 mb-6">
          Choisissez un nouveau mot de passe pour votre compte.
        </p>
        <ResetPasswordForm />
      </div>
    </div>
  );
}
