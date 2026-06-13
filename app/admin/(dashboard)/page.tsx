import type { Metadata } from "next";
import Link from "next/link";
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
    { count: piecesAVerifier },
  ] = await Promise.all([
    supabase.from("pre_inscriptions").select("*", { count: "exact", head: true }),
    supabase
      .from("pre_inscriptions")
      .select("*", { count: "exact", head: true })
      .eq("statut", "nouveau"),
    supabase.from("contacts").select("*", { count: "exact", head: true }),
    supabase
      .from("dossier_pieces")
      .select("*", { count: "exact", head: true })
      .eq("statut", "recu"),
  ]);

  const cards: { label: string; value: number; href?: string }[] = [
    { label: "Pré-inscriptions (total)", value: totalPreInscriptions ?? 0 },
    { label: "Pré-inscriptions « nouveau »", value: nouvellesPreInscriptions ?? 0 },
    { label: "Messages de contact", value: totalMessages ?? 0 },
    { label: "Pièces à vérifier", value: piecesAVerifier ?? 0, href: "/admin/dossiers" },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-primary-800 heading-serif mb-6">
        Tableau de bord
      </h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((card) => {
          const className = [
            "bg-white border border-neutral-200 rounded-lg p-6 shadow-sm",
            card.href ? "hover:border-primary-300 transition-colors" : "",
          ].join(" ");

          const content = (
            <>
              <p className="text-3xl font-bold text-primary-800">{card.value}</p>
              <p className="text-sm text-neutral-600 mt-1">{card.label}</p>
            </>
          );

          return card.href ? (
            <Link key={card.label} href={card.href} className={className}>
              {content}
            </Link>
          ) : (
            <div key={card.label} className={className}>
              {content}
            </div>
          );
        })}
      </div>
    </div>
  );
}
