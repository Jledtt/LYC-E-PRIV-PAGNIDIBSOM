import type { Metadata } from "next";
import LoginForm from "./LoginForm";

export const metadata: Metadata = { title: "Connexion" };

export const dynamic = "force-dynamic";

export default function ParentLoginPage() {
  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-neutral-50 px-4 py-12">
      <div className="w-full max-w-sm bg-white border border-neutral-200 rounded-lg shadow-sm p-8">
        <h1 className="text-xl font-bold text-primary-800 heading-serif mb-1">Espace Parent</h1>
        <p className="text-sm text-neutral-500 mb-6">
          Connectez-vous avec votre compte Google pour suivre le dossier d&rsquo;inscription de
          votre enfant.
        </p>
        <LoginForm />
      </div>
    </div>
  );
}
