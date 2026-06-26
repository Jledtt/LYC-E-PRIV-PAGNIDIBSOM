"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  JOURS,
  CRENEAUX_MATIN,
  CRENEAUX_APREM,
  type Classe,
  type Jour,
  type Creneau,
} from "@/lib/scolarite";
import { upsertCellule, supprimerCellule } from "./actions";

export interface CelluleData {
  id: string;
  matiere: string;
  enseignant: string | null;
  salle: string | null;
}

export type CellulesMap = Record<string, CelluleData>;

interface Props {
  classe: Classe;
  cellules: CellulesMap;
}

interface EditValues {
  matiere: string;
  enseignant: string;
  salle: string;
}

function cellKey(jour: Jour, creneau: Creneau): string {
  return `${jour}__${creneau}`;
}

const inputCellClass =
  "w-full border border-neutral-300 rounded px-1.5 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-primary-600 focus:border-transparent";

export default function EmploiDuTempsGrid({ classe, cellules }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [editValues, setEditValues] = useState<EditValues>({
    matiere: "",
    enseignant: "",
    salle: "",
  });
  const [cellError, setCellError] = useState<string | null>(null);

  function startEdit(jour: Jour, creneau: Creneau) {
    const key = cellKey(jour, creneau);
    const existing = cellules[key];
    setEditingKey(key);
    setEditValues({
      matiere: existing?.matiere ?? "",
      enseignant: existing?.enseignant ?? "",
      salle: existing?.salle ?? "",
    });
    setCellError(null);
  }

  function cancelEdit() {
    setEditingKey(null);
    setCellError(null);
  }

  function handleSave(jour: Jour, creneau: Creneau) {
    if (!editValues.matiere.trim()) {
      setCellError("Matière requise.");
      return;
    }
    startTransition(async () => {
      const result = await upsertCellule({
        classe,
        jour,
        creneau,
        matiere: editValues.matiere.trim(),
        enseignant: editValues.enseignant.trim() || null,
        salle: editValues.salle.trim() || null,
      });
      if (result.success) {
        setEditingKey(null);
        router.refresh();
      } else {
        setCellError(result.error);
      }
    });
  }

  function handleDelete(jour: Jour, creneau: Creneau) {
    const existing = cellules[cellKey(jour, creneau)];
    if (!existing) return;
    startTransition(async () => {
      const result = await supprimerCellule(existing.id);
      if (result.success) {
        setEditingKey(null);
        router.refresh();
      } else {
        setCellError(result.error);
      }
    });
  }

  function renderCell(jour: Jour, creneau: Creneau) {
    const key = cellKey(jour, creneau);
    const existing = cellules[key];
    const isEditing = editingKey === key;

    if (isEditing) {
      return (
        <td
          key={jour}
          className="border border-neutral-200 p-1.5 align-top bg-primary-50 min-w-[130px]"
        >
          <div className="flex flex-col gap-1">
            <input
              type="text"
              placeholder="Matière *"
              value={editValues.matiere}
              onChange={(e) =>
                setEditValues((v) => ({ ...v, matiere: e.target.value }))
              }
              className={inputCellClass}
              // eslint-disable-next-line jsx-a11y/no-autofocus
              autoFocus
            />
            <input
              type="text"
              placeholder="Enseignant"
              value={editValues.enseignant}
              onChange={(e) =>
                setEditValues((v) => ({ ...v, enseignant: e.target.value }))
              }
              className={inputCellClass}
            />
            <input
              type="text"
              placeholder="Salle"
              value={editValues.salle}
              onChange={(e) =>
                setEditValues((v) => ({ ...v, salle: e.target.value }))
              }
              className={inputCellClass}
            />
            {cellError && (
              <p className="text-red-600 text-xs">{cellError}</p>
            )}
            <div className="flex gap-1">
              <button
                type="button"
                onClick={() => handleSave(jour, creneau)}
                disabled={isPending}
                title="Enregistrer"
                className="flex-1 bg-primary-800 text-white text-xs px-1.5 py-1 rounded hover:bg-primary-900 disabled:opacity-50 transition-colors"
              >
                ✓
              </button>
              {existing && (
                <button
                  type="button"
                  onClick={() => handleDelete(jour, creneau)}
                  disabled={isPending}
                  title="Supprimer"
                  className="bg-red-50 text-red-700 text-xs px-1.5 py-1 rounded hover:bg-red-100 disabled:opacity-50 transition-colors"
                >
                  ✕
                </button>
              )}
              <button
                type="button"
                onClick={cancelEdit}
                disabled={isPending}
                title="Annuler"
                className="bg-neutral-100 text-neutral-600 text-xs px-1.5 py-1 rounded hover:bg-neutral-200 disabled:opacity-50 transition-colors"
              >
                ←
              </button>
            </div>
          </div>
        </td>
      );
    }

    if (existing) {
      return (
        <td
          key={jour}
          onClick={() => startEdit(jour, creneau)}
          className="border border-neutral-200 p-1.5 align-top cursor-pointer hover:bg-primary-50 min-w-[100px] transition-colors"
        >
          <p className="text-xs font-semibold text-primary-800 leading-tight">
            {existing.matiere}
          </p>
          {existing.enseignant && (
            <p className="text-xs text-neutral-500 mt-0.5 leading-tight">
              {existing.enseignant}
            </p>
          )}
          {existing.salle && (
            <p className="text-xs text-neutral-400 leading-tight">{existing.salle}</p>
          )}
        </td>
      );
    }

    return (
      <td
        key={jour}
        onClick={() => startEdit(jour, creneau)}
        className="border border-neutral-200 p-1.5 align-middle cursor-pointer hover:bg-neutral-50 min-w-[100px] text-center transition-colors"
      >
        <span className="text-neutral-300 text-sm select-none">+</span>
      </td>
    );
  }

  function renderSection(creneaux: readonly Creneau[], label: string) {
    return (
      <>
        <tr>
          <td
            colSpan={JOURS.length + 1}
            className="bg-neutral-100 px-3 py-1.5 text-xs font-semibold text-neutral-500 uppercase tracking-wide"
          >
            {label}
          </td>
        </tr>
        {creneaux.map((creneau) => (
          <tr key={creneau}>
            <td className="border border-neutral-200 bg-neutral-50 px-2 py-2 text-xs font-medium text-neutral-700 whitespace-nowrap sticky left-0 z-10">
              {creneau}
            </td>
            {JOURS.map((jour) => renderCell(jour, creneau))}
          </tr>
        ))}
      </>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-neutral-200 shadow-sm">
      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-primary-800 text-white">
            <th className="px-3 py-2.5 text-left text-xs font-semibold whitespace-nowrap sticky left-0 bg-primary-800 z-10 min-w-[80px]">
              Créneau
            </th>
            {JOURS.map((jour) => (
              <th
                key={jour}
                className="px-3 py-2.5 text-center text-xs font-semibold whitespace-nowrap min-w-[100px] capitalize"
              >
                {jour}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white">
          {renderSection(CRENEAUX_MATIN, "Matin")}
          {renderSection(CRENEAUX_APREM, "Après-midi")}
        </tbody>
      </table>
    </div>
  );
}
