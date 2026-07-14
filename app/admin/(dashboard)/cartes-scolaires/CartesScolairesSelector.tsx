"use client";

import { useMemo, useState } from "react";

export interface EleveCarteRow {
  id: string;
  nom: string;
  prenom: string;
  classe: string;
  eligible: boolean;
}

interface ClasseGroup {
  classe: string;
  eleves: EleveCarteRow[];
}

interface Props {
  rowsParClasse: ClasseGroup[];
}

type GenerationState = "idle" | "generating" | "error";

export default function CartesScolairesSelector({ rowsParClasse }: Props) {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [state, setState] = useState<GenerationState>("idle");
  const [error, setError] = useState<string | null>(null);

  const allEleves = useMemo(() => rowsParClasse.flatMap((g) => g.eleves), [rowsParClasse]);
  const selectedCount = selected.size;
  const ineligibleCount = allEleves.filter((e) => !e.eligible).length;

  function toggle(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function selectClasse(classe: string) {
    const eligibles = rowsParClasse
      .find((g) => g.classe === classe)
      ?.eleves.filter((e) => e.eligible)
      .map((e) => e.id) ?? [];
    setSelected((prev) => new Set([...prev, ...eligibles]));
  }

  function deselectClasse(classe: string) {
    const ids = new Set(
      rowsParClasse.find((g) => g.classe === classe)?.eleves.map((e) => e.id) ?? []
    );
    setSelected((prev) => new Set([...prev].filter((id) => !ids.has(id))));
  }

  async function handleGenerate() {
    setError(null);
    setState("generating");

    try {
      const res = await fetch("/api/pdf/cartes-scolaires-lot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: [...selected] }),
      });

      if (!res.ok) {
        const message = await res.text();
        setError(message || "Erreur lors de la génération de la planche.");
        setState("error");
        return;
      }

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `cartes-scolaires-${new Date().toISOString().slice(0, 10)}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      setState("idle");
    } catch (err) {
      console.error("[admin/cartes-scolaires] Erreur génération planche :", err);
      setError("Erreur réseau lors de la génération. Veuillez réessayer.");
      setState("error");
    }
  }

  return (
    <div className="flex flex-col gap-6 pb-24">
      {ineligibleCount > 0 && (
        <p className="text-sm text-accent-800 bg-accent-100 border border-accent-200 rounded-lg px-4 py-2.5">
          {ineligibleCount} élève{ineligibleCount > 1 ? "s" : ""} sans photo et/ou contact
          d&rsquo;urgence — grisé{ineligibleCount > 1 ? "s" : ""} ci-dessous, non sélectionnable
          {ineligibleCount > 1 ? "s" : ""}.
        </p>
      )}

      {rowsParClasse.map(({ classe, eleves }) => {
        const eligibleIds = eleves.filter((e) => e.eligible).map((e) => e.id);
        const allSelected = eligibleIds.length > 0 && eligibleIds.every((id) => selected.has(id));

        return (
          <div
            key={classe}
            className="bg-white border border-neutral-200 rounded-lg shadow-sm overflow-hidden"
          >
            <div className="flex items-center justify-between gap-3 px-4 py-3 bg-neutral-50 border-b border-neutral-200">
              <h2 className="font-semibold text-primary-800">{classe}</h2>
              <button
                type="button"
                onClick={() => (allSelected ? deselectClasse(classe) : selectClasse(classe))}
                disabled={eligibleIds.length === 0}
                className="text-xs font-medium px-3 py-1.5 rounded bg-white border border-neutral-300 hover:bg-neutral-100 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {allSelected ? "Désélectionner la classe" : "Sélectionner toute la classe"}
              </button>
            </div>
            <ul className="divide-y divide-neutral-100">
              {eleves.map((eleve) => (
                <li
                  key={eleve.id}
                  className={[
                    "flex items-center gap-3 px-4 py-2.5 text-sm",
                    eleve.eligible ? "" : "opacity-50",
                  ].join(" ")}
                >
                  <input
                    type="checkbox"
                    checked={selected.has(eleve.id)}
                    disabled={!eleve.eligible}
                    onChange={() => toggle(eleve.id)}
                    className="w-4 h-4 accent-primary-800"
                    aria-label={`Sélectionner ${eleve.prenom} ${eleve.nom}`}
                  />
                  <span className="flex-1">
                    {eleve.prenom} {eleve.nom}
                  </span>
                  {!eleve.eligible && (
                    <span className="text-xs text-red-600">Photo/contact manquant</span>
                  )}
                </li>
              ))}
            </ul>
          </div>
        );
      })}

      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-neutral-200 shadow-lg px-4 py-3 flex items-center justify-between gap-4 z-10">
        <p className="text-sm text-neutral-600">
          <strong>{selectedCount}</strong> élève{selectedCount > 1 ? "s" : ""} sélectionné
          {selectedCount > 1 ? "s" : ""}
          {error && <span className="text-red-600 ml-3">{error}</span>}
        </p>
        <button
          type="button"
          onClick={handleGenerate}
          disabled={selectedCount === 0 || state === "generating"}
          className="bg-primary-800 hover:bg-primary-900 text-white font-semibold px-6 py-2.5 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
        >
          {state === "generating" ? "Génération en cours..." : "Générer la planche PDF"}
        </button>
      </div>
    </div>
  );
}
