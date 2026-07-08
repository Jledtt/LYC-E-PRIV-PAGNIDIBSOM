"use client";

import { useState } from "react";
import type { ParentDisponible, ModeleMessage, NotificationHistorique } from "./actions";
import { Toast, type ToastState } from "./Toast";
import EnvoyerTab from "./EnvoyerTab";
import HistoriqueTab from "./HistoriqueTab";
import ModelesTab from "./ModelesTab";

type Onglet = "envoyer" | "historique" | "modeles";

const ONGLETS: Array<{ id: Onglet; label: string }> = [
  { id: "envoyer", label: "Envoyer" },
  { id: "historique", label: "Historique" },
  { id: "modeles", label: "Modèles" },
];

export default function NotificationsClient({
  parentsInitiaux,
  modelesInitiaux,
  historiqueInitial,
}: {
  parentsInitiaux: ParentDisponible[];
  modelesInitiaux: ModeleMessage[];
  historiqueInitial: { rows: NotificationHistorique[]; totalPages: number };
}) {
  const [onglet, setOnglet] = useState<Onglet>("envoyer");
  const [modeles, setModeles] = useState<ModeleMessage[]>(modelesInitiaux);
  const [toast, setToast] = useState<ToastState | null>(null);

  function showToast(message: string, variant: ToastState["variant"] = "success") {
    setToast({ message, variant });
    setTimeout(() => setToast(null), 5000);
  }

  return (
    <div>
      <div className="border-b border-neutral-200 mb-6 flex gap-1">
        {ONGLETS.map((o) => (
          <button
            key={o.id}
            type="button"
            onClick={() => setOnglet(o.id)}
            aria-current={onglet === o.id ? "page" : undefined}
            className={[
              "px-4 py-2.5 text-sm font-medium border-b-2 transition-colors -mb-px",
              onglet === o.id
                ? "border-primary-800 text-primary-800"
                : "border-transparent text-neutral-500 hover:text-primary-700",
            ].join(" ")}
          >
            {o.label}
          </button>
        ))}
      </div>

      {onglet === "envoyer" && (
        <EnvoyerTab parents={parentsInitiaux} modeles={modeles} showToast={showToast} />
      )}
      {onglet === "historique" && <HistoriqueTab historiqueInitial={historiqueInitial} />}
      {onglet === "modeles" && (
        <ModelesTab modeles={modeles} setModeles={setModeles} showToast={showToast} />
      )}

      {toast && <Toast toast={toast} onClose={() => setToast(null)} />}
    </div>
  );
}
