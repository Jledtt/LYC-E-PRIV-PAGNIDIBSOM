"use client";

import { useState, useTransition } from "react";
import type { ModeleMessage, UpsertModeleInput } from "./actions";
import { upsertModele, supprimerModele } from "./actions";
import type { ToastState } from "./Toast";

const TYPE_LABELS: Record<string, string> = {
  masse: "Masse",
  convocation: "Convocation",
  avertissement: "Avertissement",
  reunion: "Réunion",
  autre: "Autre",
};

const TYPE_BADGE: Record<string, string> = {
  masse: "bg-blue-100 text-blue-700",
  convocation: "bg-red-100 text-red-700",
  avertissement: "bg-orange-100 text-orange-700",
  reunion: "bg-purple-100 text-purple-700",
  autre: "bg-neutral-100 text-neutral-600",
};

const TYPE_OPTIONS = Object.keys(TYPE_LABELS) as Array<keyof typeof TYPE_LABELS>;

type FormState = { id?: string; nom: string; sujet: string; contenu: string; type: UpsertModeleInput["type"] };

const FORM_VIDE: FormState = { nom: "", sujet: "", contenu: "", type: "autre" };

export default function ModelesTab({
  modeles,
  setModeles,
  showToast,
}: {
  modeles: ModeleMessage[];
  setModeles: React.Dispatch<React.SetStateAction<ModeleMessage[]>>;
  showToast: (message: string, variant?: ToastState["variant"]) => void;
}) {
  const [form, setForm] = useState<FormState | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function openEdit(modele: ModeleMessage) {
    setForm({
      id: modele.id,
      nom: modele.nom,
      sujet: modele.sujet,
      contenu: modele.contenu,
      type: modele.type as UpsertModeleInput["type"],
    });
  }

  function openNew() {
    setForm({ ...FORM_VIDE });
  }

  function handleSave() {
    if (!form) return;
    startTransition(async () => {
      const result = await upsertModele(form);
      if (!result.success) {
        showToast(result.error, "error");
        return;
      }

      if (form.id) {
        setModeles((prev) => prev.map((m) => (m.id === form.id ? result.modele : m)));
      } else {
        setModeles((prev) => [...prev, result.modele]);
      }

      showToast("Modèle enregistré.", "success");
      setForm(null);
    });
  }

  function handleDelete(id: string) {
    startTransition(async () => {
      const result = await supprimerModele(id);
      setConfirmDeleteId(null);
      if (!result.success) {
        showToast(result.error, "error");
        return;
      }
      setModeles((prev) => prev.filter((m) => m.id !== id));
      showToast("Modèle supprimé.", "success");
    });
  }

  if (form) {
    return (
      <div className="max-w-2xl flex flex-col gap-5">
        <h2 className="font-semibold text-primary-800">
          {form.id ? "Modifier le modèle" : "Nouveau modèle"}
        </h2>

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-neutral-800">Nom</label>
          <input
            type="text"
            value={form.nom}
            onChange={(e) => setForm({ ...form, nom: e.target.value })}
            className="w-full border border-neutral-300 rounded px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-600"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-neutral-800">Type</label>
          <select
            value={form.type}
            onChange={(e) => setForm({ ...form, type: e.target.value as UpsertModeleInput["type"] })}
            className="w-full border border-neutral-300 rounded px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary-600"
          >
            {TYPE_OPTIONS.map((t) => (
              <option key={t} value={t}>
                {TYPE_LABELS[t]}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-neutral-800">Sujet</label>
          <input
            type="text"
            value={form.sujet}
            onChange={(e) => setForm({ ...form, sujet: e.target.value })}
            className="w-full border border-neutral-300 rounded px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-600"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-neutral-800">Contenu</label>
          <textarea
            rows={8}
            value={form.contenu}
            onChange={(e) => setForm({ ...form, contenu: e.target.value })}
            className="w-full border border-neutral-300 rounded px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-600"
          />
        </div>

        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => setForm(null)}
            className="px-4 py-2.5 text-sm font-medium text-neutral-600 hover:bg-neutral-100 rounded"
          >
            Annuler
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={isPending || !form.nom.trim() || !form.sujet.trim() || !form.contenu.trim()}
            className="bg-accent-500 hover:bg-accent-600 disabled:opacity-50 text-white text-sm font-semibold px-5 py-2.5 rounded"
          >
            {isPending ? "Enregistrement..." : "Enregistrer"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-end mb-4">
        <button
          type="button"
          onClick={openNew}
          className="bg-primary-800 hover:bg-primary-900 text-white text-sm font-medium px-4 py-2 rounded transition-colors"
        >
          + Nouveau modèle
        </button>
      </div>

      <div className="bg-white border border-neutral-200 rounded-lg shadow-sm overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="bg-neutral-50 text-neutral-600 uppercase text-xs">
            <tr>
              <th className="px-4 py-3">Nom</th>
              <th className="px-4 py-3">Type</th>
              <th className="px-4 py-3">Sujet</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100">
            {modeles.map((m) => (
              <tr key={m.id}>
                <td className="px-4 py-3 whitespace-nowrap">
                  {m.nom}
                  {m.is_default && (
                    <span className="ml-2 text-xs font-medium px-2 py-0.5 rounded-full bg-neutral-100 text-neutral-500">
                      Par défaut
                    </span>
                  )}
                </td>
                <td className="px-4 py-3">
                  <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${TYPE_BADGE[m.type] ?? ""}`}>
                    {TYPE_LABELS[m.type] ?? m.type}
                  </span>
                </td>
                <td className="px-4 py-3 max-w-xs truncate">{m.sujet}</td>
                <td className="px-4 py-3 whitespace-nowrap flex gap-3">
                  <button
                    type="button"
                    onClick={() => openEdit(m)}
                    className="text-primary-700 hover:underline text-sm font-medium"
                  >
                    Modifier
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirmDeleteId(m.id)}
                    disabled={m.is_default}
                    className="text-red-600 hover:underline text-sm font-medium disabled:opacity-40 disabled:no-underline"
                  >
                    Supprimer
                  </button>
                </td>
              </tr>
            ))}
            {modeles.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-neutral-500">
                  Aucun modèle.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {confirmDeleteId && (
        <div
          className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4"
          onClick={() => setConfirmDeleteId(null)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-lg shadow-xl max-w-sm w-full p-5"
          >
            <p className="text-sm text-neutral-700 mb-4">Supprimer ce modèle définitivement ?</p>
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setConfirmDeleteId(null)}
                className="px-4 py-2 text-sm font-medium text-neutral-600 hover:bg-neutral-100 rounded"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={() => handleDelete(confirmDeleteId)}
                disabled={isPending}
                className="bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white text-sm font-semibold px-4 py-2 rounded"
              >
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
