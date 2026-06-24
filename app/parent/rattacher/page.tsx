import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getParentSession } from "@/lib/parent-session";
import { getParentDossiers } from "@/actions/parent-auth";
import RattacherForm from "./RattacherForm";

export const metadata: Metadata = { title: "Rattacher un élève" };

export const dynamic = "force-dynamic";

export default async function ParentRattacherPage() {
  const session = await getParentSession();
  if (!session) {
    redirect("/parent/login");
  }

  const dossiers = await getParentDossiers();

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-neutral-50 px-4 py-12">
      <div className="max-w-md mx-auto bg-white border border-neutral-200 rounded-lg shadow-sm p-8">
        <h1 className="text-xl font-bold text-primary-800 heading-serif mb-1">Rattacher un élève</h1>
        <p className="text-sm text-neutral-500 mb-6">
          Entrez le code reçu dans votre lien WhatsApp après votre pré-inscription pour rattacher
          le dossier de votre enfant à votre compte.
        </p>

        {dossiers.length > 0 && (
          <div className="mb-6 border border-neutral-200 rounded-lg divide-y divide-neutral-200">
            {dossiers.map((d) => (
              <div key={d.preInscriptionId} className="px-4 py-3 text-sm text-neutral-700">
                {d.elevePrenom} {d.eleveNom} — {d.classeSouhaitee}
              </div>
            ))}
          </div>
        )}

        <RattacherForm />

        {dossiers.length > 0 && (
          <p className="mt-6 text-sm text-center">
            <Link href="/parent/dashboard" className="text-primary-700 font-medium underline">
              Accéder à mon espace
            </Link>
          </p>
        )}
      </div>
    </div>
  );
}
