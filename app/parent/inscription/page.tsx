import type { Metadata } from "next";
import Link from "next/link";
import RegisterForm from "./RegisterForm";

export const metadata: Metadata = { title: "Créer un compte" };

export const dynamic = "force-dynamic";

export default function ParentInscriptionPage() {
  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-neutral-50 px-4 py-12">
      <div className="w-full max-w-md bg-white border border-neutral-200 rounded-lg shadow-sm p-8">
        <h1 className="text-xl font-bold text-primary-800 heading-serif mb-1">Espace Parent</h1>
        <p className="text-sm text-neutral-500 mb-6">
          Créez votre compte pour suivre le dossier d&rsquo;inscription de votre enfant.
        </p>
        <RegisterForm />
        <p className="mt-6 text-sm text-neutral-600 text-center">
          Déjà un compte ?{" "}
          <Link href="/parent/login" className="text-primary-700 font-medium underline">
            Se connecter
          </Link>
        </p>
      </div>
    </div>
  );
}
