"use client";

import { useState } from "react";
import { updateConfigPaiement } from "./actions";

export interface ConfigPaiementRow {
  id: string;
  classe: string;
  label: string;
  fraisDossier: number;
  fraisScolarite: number;
}

type RowStatus = "idle" | "dirty" | "saving" | "saved" | "error";

interface RowState {
  fraisDossier: string;
  fraisScolarite: string;
  status: RowStatus;
  error: string | null;
}

function formatMontant(montant: number): string {
  return `${montant.toLocaleString("fr-FR")} FCFA`;
}

const inputClass =
  "w-32 border border-neutral-300 rounded px-2 py-1.5 text-sm text-right focus:outline-none focus:ring-2 focus:ring-primary-600 focus:border-transparent transition";

interface Props {
  rows: ConfigPaiementRow[];
}

export default function ConfigPaiementsTable({ rows }: Props) {
  const [states, setStates] = useState<Record<string, RowState>>(() =>
    Object.fromEntries(
      rows.map((r) => [
        r.id,
        {
          fraisDossier: String(r.fraisDossier),
          fraisScolarite: String(r.fraisScolarite),
          status: "idle" as const,
          error: null,
        },
      ])
    )
  );

  function updateField(id: string, field: "fraisDossier" | "fraisScolarite", value: string) {
    setStates((prev) => ({
      ...prev,
      [id]: { ...prev[id], [field]: value, status: "dirty", error: null },
    }));
  }

  async function handleSave(id: string) {
    const state = states[id];
    const fraisDossier = Number(state.fraisDossier);
    const fraisScolarite = Number(state.fraisScolarite);

    if (!Number.isFinite(fraisDossier) || fraisDossier < 0 || !Number.isInteger(fraisDossier)) {
      setStates((prev) => ({
        ...prev,
        [id]: { ...prev[id], status: "error", error: "Frais de dossier invalide (entier positif ou nul)." },
      }));
      return;
    }
    if (!Number.isFinite(fraisScolarite) || fraisScolarite < 0 || !Number.isInteger(fraisScolarite)) {
      setStates((prev) => ({
        ...prev,
        [id]: { ...prev[id], status: "error", error: "Frais de scolarité invalide (entier positif ou nul)." },
      }));
      return;
    }

    setStates((prev) => ({ ...prev, [id]: { ...prev[id], status: "saving", error: null } }));

    const result = await updateConfigPaiement(id, fraisDossier, fraisScolarite);

    if (result.success) {
      setStates((prev) => ({ ...prev, [id]: { ...prev[id], status: "saved", error: null } }));
    } else {
      setStates((prev) => ({ ...prev, [id]: { ...prev[id], status: "error", error: result.error } }));
    }
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-neutral-200 shadow-sm bg-white">
      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-primary-800 text-white">
            <th className="px-4 py-2.5 text-left text-xs font-semibold whitespace-nowrap">Classe</th>
            <th className="px-4 py-2.5 text-right text-xs font-semibold whitespace-nowrap">
              Frais de dossier
            </th>
            <th className="px-4 py-2.5 text-right text-xs font-semibold whitespace-nowrap">
              Frais de scolarité
            </th>
            <th className="px-4 py-2.5 text-center text-xs font-semibold whitespace-nowrap">Statut</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => {
            const state = states[r.id];
            const busy = state.status === "saving";
            return (
              <tr key={r.id} className="border-t border-neutral-200">
                <td className="px-4 py-2.5 text-sm font-medium text-neutral-800 whitespace-nowrap">
                  {r.label}
                </td>
                <td className="px-4 py-2.5">
                  <div className="flex flex-col items-end gap-0.5">
                    <input
                      type="number"
                      min={0}
                      step={1}
                      value={state.fraisDossier}
                      onChange={(e) => updateField(r.id, "fraisDossier", e.target.value)}
                      disabled={busy}
                      className={inputClass}
                      aria-label={`Frais de dossier — ${r.label}`}
                    />
                    <span className="text-xs text-neutral-400">
                      Actuel : {formatMontant(r.fraisDossier)}
                    </span>
                  </div>
                </td>
                <td className="px-4 py-2.5">
                  <div className="flex flex-col items-end gap-0.5">
                    <input
                      type="number"
                      min={0}
                      step={1}
                      value={state.fraisScolarite}
                      onChange={(e) => updateField(r.id, "fraisScolarite", e.target.value)}
                      disabled={busy}
                      className={inputClass}
                      aria-label={`Frais de scolarité — ${r.label}`}
                    />
                    <span className="text-xs text-neutral-400">
                      Actuel : {formatMontant(r.fraisScolarite)}
                    </span>
                  </div>
                </td>
                <td className="px-4 py-2.5 text-center">
                  <div className="flex flex-col items-center gap-1">
                    <button
                      type="button"
                      onClick={() => handleSave(r.id)}
                      disabled={busy || state.status === "idle" || state.status === "saved"}
                      className="px-3 py-1.5 rounded text-xs font-medium bg-primary-800 text-white hover:bg-primary-900 disabled:opacity-40 disabled:cursor-not-allowed transition-colors whitespace-nowrap"
                    >
                      {busy ? "..." : "Enregistrer"}
                    </button>
                    {state.status === "saved" && (
                      <span className="text-xs text-green-700">Enregistré</span>
                    )}
                    {state.status === "error" && state.error && (
                      <span role="alert" className="text-xs text-red-600">
                        {state.error}
                      </span>
                    )}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
