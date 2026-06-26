"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ajouterDevoir, supprimerDevoir } from "./actions";
import { TYPES_DEVOIR, type Classe, type TypeDevoir } from "@/lib/scolarite";
import { inputClasses } from "@/components/ui/FormField";

export interface DevoirRow {
  id: string;
  date_devoir: string;
  matiere: string;
  heure_debut: string | null;
  heure_fin: string | null;
  type: string;
}

interface Props {
  classe: Classe;
  devoirs: DevoirRow[];
}

function groupByMonth(devoirs: DevoirRow[]): Array<{ label: string; items: DevoirRow[] }> {
  const map = new Map<string, DevoirRow[]>();
  for (const d of devoirs) {
    const date = new Date(d.date_devoir + "T00:00:00");
    const mois = date.toLocaleDateString("fr-FR", { month: "long", year: "numeric" });
    const label = mois.charAt(0).toUpperCase() + mois.slice(1);
    if (!map.has(label)) map.set(label, []);
    map.get(label)!.push(d);
  }
  return Array.from(map.entries()).map(([label, items]) => ({ label, items }));
}

const selectClass =
  "w-full border border-neutral-300 rounded px-3 py-2.5 text-neutral-900 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary-600 focus:border-transparent transition";

export default function DevoirsAdmin({ classe, devoirs }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [formError, setFormError] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const [dateDevoir, setDateDevoir] = useState("");
  const [matiere, setMatiere] = useState("");
  const [heureDebut, setHeureDebut] = useState("");
  const [heureFin, setHeureFin] = useState("");
  const [type, setType] = useState<TypeDevoir>("devoir");

  function handleAjouter(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setFormError(null);
    if (!dateDevoir) {
      setFormError("La date est requise.");
      return;
    }
    if (!matiere.trim()) {
      setFormError("La matière est requise.");
      return;
    }
    startTransition(async () => {
      const result = await ajouterDevoir({
        classe,
        date_devoir: dateDevoir,
        matiere: matiere.trim(),
        heure_debut: heureDebut.trim() || null,
        heure_fin: heureFin.trim() || null,
        type,
      });
      if (result.success) {
        setDateDevoir("");
        setMatiere("");
        setHeureDebut("");
        setHeureFin("");
        setType("devoir");
        router.refresh();
      } else {
        setFormError(result.error);
      }
    });
  }

  function handleSupprimer(id: string) {
    setDeleteError(null);
    startTransition(async () => {
      const result = await supprimerDevoir(id);
      if (result.success) {
        router.refresh();
      } else {
        setDeleteError(result.error);
      }
    });
  }

  const groupes = groupByMonth(devoirs);

  return (
    <div className="flex flex-col gap-6">
      <section className="bg-white border border-neutral-200 rounded-lg p-5">
        <h2 className="font-semibold text-primary-800 mb-4">Ajouter</h2>
        <form onSubmit={handleAjouter} noValidate className="flex flex-col gap-3">
          {formError && (
            <div
              role="alert"
              className="bg-red-50 border border-red-200 rounded p-3 text-red-700 text-sm"
            >
              {formError}
            </div>
          )}

          <div className="grid gap-3 sm:grid-cols-4">
            <div className="sm:col-span-1">
              <label className="block text-sm font-medium text-neutral-800 mb-1">
                Date <span className="text-red-600" aria-hidden="true">*</span>
              </label>
              <input
                type="date"
                required
                value={dateDevoir}
                onChange={(e) => setDateDevoir(e.target.value)}
                className={inputClasses}
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-neutral-800 mb-1">
                Matière <span className="text-red-600" aria-hidden="true">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="Ex : Mathématiques"
                value={matiere}
                onChange={(e) => setMatiere(e.target.value)}
                className={inputClasses}
              />
            </div>

            <div className="sm:col-span-1">
              <label className="block text-sm font-medium text-neutral-800 mb-1">Type</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as TypeDevoir)}
                className={selectClass}
              >
                {TYPES_DEVOIR.map((t) => (
                  <option key={t} value={t}>
                    {t === "devoir" ? "Devoir" : "Composition"}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 sm:max-w-xs">
            <div>
              <label className="block text-sm font-medium text-neutral-800 mb-1">
                Heure début
              </label>
              <input
                type="text"
                placeholder="Ex : 8h"
                value={heureDebut}
                onChange={(e) => setHeureDebut(e.target.value)}
                className={inputClasses}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-800 mb-1">
                Heure fin
              </label>
              <input
                type="text"
                placeholder="Ex : 10h"
                value={heureFin}
                onChange={(e) => setHeureFin(e.target.value)}
                className={inputClasses}
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isPending}
              className="bg-primary-800 hover:bg-primary-900 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold px-4 py-2 rounded transition-colors text-sm"
            >
              {isPending ? "Ajout en cours…" : "Ajouter"}
            </button>
          </div>
        </form>
      </section>

      <section className="bg-white border border-neutral-200 rounded-lg p-5">
        <h2 className="font-semibold text-primary-800 mb-4">Devoirs et compositions</h2>

        {deleteError && (
          <div
            role="alert"
            className="bg-red-50 border border-red-200 rounded p-3 text-red-700 text-sm mb-4"
          >
            {deleteError}
          </div>
        )}

        {devoirs.length === 0 ? (
          <p className="text-sm text-neutral-500">
            Aucun devoir ou composition enregistré pour cette classe.
          </p>
        ) : (
          <div className="flex flex-col gap-6">
            {groupes.map(({ label, items }) => (
              <div key={label}>
                <h3 className="text-xs font-semibold text-neutral-500 uppercase tracking-wide mb-2">
                  {label}
                </h3>
                <ul className="flex flex-col gap-2">
                  {items.map((d) => (
                    <li
                      key={d.id}
                      className="flex items-start justify-between gap-3 text-sm border-l-2 border-neutral-200 pl-3 py-1"
                    >
                      <div className="flex flex-col gap-0.5">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-medium text-neutral-900">
                            {new Date(d.date_devoir + "T00:00:00").toLocaleDateString("fr-FR", {
                              weekday: "short",
                              day: "numeric",
                              month: "short",
                            })}
                          </span>
                          <span
                            className={[
                              "text-xs font-medium px-1.5 py-0.5 rounded-full",
                              d.type === "composition"
                                ? "bg-orange-100 text-orange-700"
                                : "bg-blue-50 text-blue-700",
                            ].join(" ")}
                          >
                            {d.type === "composition" ? "Composition" : "Devoir"}
                          </span>
                        </div>
                        <span className="text-neutral-700">{d.matiere}</span>
                        {(d.heure_debut ?? d.heure_fin) && (
                          <span className="text-xs text-neutral-500">
                            {d.heure_debut}
                            {d.heure_debut && d.heure_fin ? " – " : ""}
                            {d.heure_fin}
                          </span>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => handleSupprimer(d.id)}
                        disabled={isPending}
                        className="shrink-0 text-xs text-red-600 hover:text-red-800 disabled:opacity-50 transition-colors"
                        aria-label={`Supprimer ${d.matiere} du ${d.date_devoir}`}
                      >
                        Supprimer
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
