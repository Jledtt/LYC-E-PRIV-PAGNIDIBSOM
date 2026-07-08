"use client";

import { useMemo, useState, useTransition } from "react";
import type { ParentDisponible, ModeleMessage } from "./actions";
import { envoyerNotification } from "./actions";
import { Modal } from "./Modal";
import type { ToastState } from "./Toast";

const SMS_MAX = 160;

export default function EnvoyerTab({
  parents,
  modeles,
  showToast,
}: {
  parents: ParentDisponible[];
  modeles: ModeleMessage[];
  showToast: (message: string, variant?: ToastState["variant"]) => void;
}) {
  const [mode, setMode] = useState<"tous" | "selection">("tous");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [modeleId, setModeleId] = useState("");
  const [sujet, setSujet] = useState("");
  const [contenu, setContenu] = useState("");
  const [canalEmail, setCanalEmail] = useState(true);
  const [canalSms, setCanalSms] = useState(true);
  const [showPreview, setShowPreview] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isPending, startTransition] = useTransition();

  const destinataires = useMemo(
    () => (mode === "tous" ? parents : parents.filter((p) => selectedIds.has(p.preInscriptionId))),
    [mode, parents, selectedIds]
  );
  const emailCount = destinataires.filter((d) => d.email).length;
  const smsCount = destinataires.filter((d) => d.telephone).length;

  function handleModeleChange(id: string) {
    setModeleId(id);
    const modele = modeles.find((m) => m.id === id);
    if (modele) {
      setSujet(modele.sujet);
      setContenu(modele.contenu);
    }
  }

  function toggleSelection(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  const canaux: ("email" | "sms")[] = [
    ...(canalEmail ? (["email"] as const) : []),
    ...(canalSms ? (["sms"] as const) : []),
  ];

  const peutEnvoyer =
    canaux.length > 0 &&
    contenu.trim().length > 0 &&
    (!canalEmail || sujet.trim().length > 0) &&
    destinataires.length > 0;

  function handleEnvoyer() {
    setShowConfirm(false);
    startTransition(async () => {
      const result = await envoyerNotification({
        sujet,
        contenu,
        canaux,
        preInscriptionIds: mode === "selection" ? [...selectedIds] : undefined,
        modeleId: modeleId || undefined,
      });

      if (!result.success) {
        showToast(result.error, "error");
        return;
      }

      const parts: string[] = [];
      if (canalEmail) parts.push(`Email : ${result.email.envoyes} envoyé(s), ${result.email.echecs} échec(s)`);
      if (canalSms) parts.push(`SMS : ${result.sms.envoyes} envoyé(s), ${result.sms.echecs} échec(s)`);
      showToast(`Notification envoyée.\n${parts.join("\n")}`, "success");

      setContenu("");
      setSujet("");
      setModeleId("");
    });
  }

  return (
    <div className="flex flex-col gap-6 max-w-2xl">
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => setMode("tous")}
          className={`px-4 py-2 text-sm font-medium rounded transition-colors ${
            mode === "tous" ? "bg-primary-800 text-white" : "bg-white border border-neutral-300 text-neutral-700"
          }`}
        >
          Tous les parents
        </button>
        <button
          type="button"
          onClick={() => setMode("selection")}
          className={`px-4 py-2 text-sm font-medium rounded transition-colors ${
            mode === "selection"
              ? "bg-primary-800 text-white"
              : "bg-white border border-neutral-300 text-neutral-700"
          }`}
        >
          Parents sélectionnés
        </button>
      </div>

      {mode === "selection" && (
        <div className="bg-white border border-neutral-200 rounded-lg max-h-72 overflow-y-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-neutral-50 text-neutral-600 uppercase text-xs sticky top-0">
              <tr>
                <th className="px-3 py-2 w-8"></th>
                <th className="px-3 py-2">Élève</th>
                <th className="px-3 py-2">Classe</th>
                <th className="px-3 py-2">Parent</th>
                <th className="px-3 py-2">Email</th>
                <th className="px-3 py-2">Téléphone</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {parents.map((p) => (
                <tr key={p.preInscriptionId}>
                  <td className="px-3 py-2">
                    <input
                      type="checkbox"
                      checked={selectedIds.has(p.preInscriptionId)}
                      onChange={() => toggleSelection(p.preInscriptionId)}
                      aria-label={`Sélectionner ${p.elevePrenom} ${p.eleveNom}`}
                    />
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap">
                    {p.elevePrenom} {p.eleveNom}
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap">{p.classe}</td>
                  <td className="px-3 py-2 whitespace-nowrap">{p.nom}</td>
                  <td className="px-3 py-2 whitespace-nowrap">{p.email ?? "—"}</td>
                  <td className="px-3 py-2 whitespace-nowrap">{p.telephone ?? "—"}</td>
                </tr>
              ))}
              {parents.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-3 py-6 text-center text-neutral-500">
                    Aucun parent trouvé.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      <div className="flex flex-col gap-1.5">
        <label htmlFor="modele" className="text-sm font-medium text-neutral-800">
          Modèle de message
        </label>
        <select
          id="modele"
          value={modeleId}
          onChange={(e) => handleModeleChange(e.target.value)}
          className="w-full border border-neutral-300 rounded px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary-600"
        >
          <option value="">— Message libre —</option>
          {modeles.map((m) => (
            <option key={m.id} value={m.id}>
              {m.nom}
            </option>
          ))}
        </select>
      </div>

      <div className="flex gap-6">
        <label className="flex items-center gap-2 text-sm text-neutral-800">
          <input type="checkbox" checked={canalEmail} onChange={(e) => setCanalEmail(e.target.checked)} />
          📧 Email
        </label>
        <label className="flex items-center gap-2 text-sm text-neutral-800">
          <input type="checkbox" checked={canalSms} onChange={(e) => setCanalSms(e.target.checked)} />
          📱 SMS
        </label>
      </div>

      {canalEmail && (
        <div className="flex flex-col gap-1.5">
          <label htmlFor="sujet" className="text-sm font-medium text-neutral-800">
            Sujet
          </label>
          <input
            id="sujet"
            type="text"
            value={sujet}
            onChange={(e) => setSujet(e.target.value)}
            className="w-full border border-neutral-300 rounded px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-600"
          />
        </div>
      )}

      <div className="flex flex-col gap-1.5">
        <label htmlFor="contenu" className="text-sm font-medium text-neutral-800">
          Contenu
        </label>
        <textarea
          id="contenu"
          rows={8}
          value={contenu}
          onChange={(e) => setContenu(e.target.value)}
          className="w-full border border-neutral-300 rounded px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-600"
        />
        <p className="text-xs text-neutral-500">
          [DATE], [HEURE], [NOM_ELEVE] sont des variables à remplacer manuellement.
        </p>
        {canalSms && (
          <p className={`text-xs ${contenu.length > SMS_MAX ? "text-red-600 font-medium" : "text-neutral-500"}`}>
            {contenu.length} / {SMS_MAX} caractères (SMS)
            {contenu.length > SMS_MAX ? " — le message dépasse la limite d'un SMS simple" : ""}
          </p>
        )}
      </div>

      <p className="text-sm text-neutral-600">
        {destinataires.length} parent(s) trouvé(s) — {emailCount} email(s), {smsCount} numéro(s) SMS
      </p>

      <div className="flex gap-3">
        <button
          type="button"
          onClick={() => setShowPreview(true)}
          disabled={!contenu.trim()}
          className="border border-primary-800 text-primary-800 hover:bg-primary-50 disabled:opacity-50 text-sm font-medium px-4 py-2.5 rounded transition-colors"
        >
          Aperçu
        </button>
        <button
          type="button"
          onClick={() => setShowConfirm(true)}
          disabled={!peutEnvoyer || isPending}
          className="bg-accent-500 hover:bg-accent-600 disabled:opacity-50 text-white text-sm font-semibold px-5 py-2.5 rounded transition-colors"
        >
          {isPending ? "Envoi en cours..." : "Envoyer"}
        </button>
      </div>

      {showPreview && (
        <Modal title="Aperçu du message" onClose={() => setShowPreview(false)}>
          <div className="flex flex-col gap-5">
            {canalEmail && (
              <div>
                <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wide mb-2">
                  📧 Aperçu email
                </p>
                <div className="border border-neutral-200 rounded overflow-hidden">
                  <div className="bg-primary-800 text-white px-4 py-3 font-bold text-sm">
                    Lycée Privé Pagnidibsom
                  </div>
                  <div className="p-4 text-sm whitespace-pre-wrap">
                    <p className="font-semibold mb-2">{sujet}</p>
                    {contenu}
                  </div>
                </div>
              </div>
            )}
            {canalSms && (
              <div>
                <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wide mb-2">
                  📱 Aperçu SMS ({contenu.length} caractères, {Math.ceil(contenu.length / SMS_MAX) || 1} segment(s))
                </p>
                <div className="border border-neutral-200 rounded p-4 text-sm bg-neutral-50 whitespace-pre-wrap">
                  {contenu.slice(0, SMS_MAX)}
                  {contenu.length > SMS_MAX && (
                    <span className="text-neutral-400"> [...suite au segment suivant]</span>
                  )}
                </div>
              </div>
            )}
          </div>
        </Modal>
      )}

      {showConfirm && (
        <Modal
          title="Confirmer l'envoi"
          onClose={() => setShowConfirm(false)}
          footer={
            <>
              <button
                type="button"
                onClick={() => setShowConfirm(false)}
                className="px-4 py-2 text-sm font-medium text-neutral-600 hover:bg-neutral-100 rounded"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={handleEnvoyer}
                className="bg-accent-500 hover:bg-accent-600 text-white text-sm font-semibold px-4 py-2 rounded"
              >
                Confirmer l'envoi
              </button>
            </>
          }
        >
          <p className="text-sm text-neutral-700">
            Envoyer à <strong>{destinataires.length} parent(s)</strong> via{" "}
            <strong>{canaux.map((c) => (c === "email" ? "Email" : "SMS")).join(" + ")}</strong> ?
          </p>
        </Modal>
      )}
    </div>
  );
}
