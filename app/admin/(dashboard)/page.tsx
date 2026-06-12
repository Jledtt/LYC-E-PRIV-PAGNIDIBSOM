import type { Metadata } from "next";
import { createAuthClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Tableau de bord",
};

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const supabase = await createAuthClient();

  const [
    { count: totalPreInscriptions },
    { count: nouvellesPreInscriptions },
    { count: totalMessages },
  ] = await Promise.all([
    supabase.from("pre_inscriptions").select("*", { count: "exact", head: true }),
    supabase
      .from("pre_inscriptions")
      .select("*", { count: "exact", head: true })
      .eq("statut", "nouveau"),
    supabase.from("contacts").select("*", { count: "exact", head: true }),
  ]);

  const cards = [
    { label: "Pré-inscriptions (total)", value: totalPreInscriptions ?? 0 },
    { label: "Pré-inscriptions « nouveau »", value: nouvellesPreInscriptions ?? 0 },
    { label: "Messages de contact", value: totalMessages ?? 0 },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-primary-800 heading-serif mb-6">
        Tableau de bord
      </h1>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {cards.map((card) => (
          <div
            key={card.label}
            className="bg-white border border-neutral-200 rounded-lg p-6 shadow-sm"
          >
            <p className="text-3xl font-bold text-primary-800">{card.value}</p>
            <p className="text-sm text-neutral-600 mt-1">{card.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
