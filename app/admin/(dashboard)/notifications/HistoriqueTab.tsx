"use client";

import { useState, useTransition } from "react";
import type { NotificationHistorique } from "./actions";
import { getHistorique } from "./actions";
import { Modal } from "./Modal";

const CANAL_LABELS: Record<string, string> = { email: "📧 Email", sms: "📱 SMS" };

const STATUT_BADGE: Record<string, string> = {
  envoye: "bg-green-100 text-green-700",
  partiel: "bg-orange-100 text-orange-700",
  echec: "bg-red-100 text-red-700",
};

const STATUT_LABELS: Record<string, string> = {
  envoye: "Envoyé",
  partiel: "Partiel",
  echec: "Échec",
};

export default function HistoriqueTab({
  historiqueInitial,
}: {
  historiqueInitial: { rows: NotificationHistorique[]; totalPages: number };
}) {
  const [page, setPage] = useState(1);
  const [rows, setRows] = useState(historiqueInitial.rows);
  const [totalPages, setTotalPages] = useState(historiqueInitial.totalPages);
  const [detail, setDetail] = useState<NotificationHistorique | null>(null);
  const [isPending, startTransition] = useTransition();

  function goToPage(p: number) {
    setPage(p);
    startTransition(async () => {
      const result = await getHistorique(p);
      setRows(result.rows);
      setTotalPages(result.totalPages);
    });
  }

  return (
    <div>
      <div className="bg-white border border-neutral-200 rounded-lg shadow-sm overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="bg-neutral-50 text-neutral-600 uppercase text-xs">
            <tr>
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3">Type</th>
              <th className="px-4 py-3">Canaux</th>
              <th className="px-4 py-3">Sujet</th>
              <th className="px-4 py-3">Destinataires</th>
              <th className="px-4 py-3">Statut</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100">
            {rows.map((row) => (
              <tr key={row.id}>
                <td className="px-4 py-3 whitespace-nowrap">
                  {new Date(row.created_at).toLocaleString("fr-FR")}
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  {row.type_envoi === "masse" ? "Masse" : "Ciblée"}
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  {(row.canaux ?? []).map((c) => CANAL_LABELS[c] ?? c).join(" ")}
                </td>
                <td className="px-4 py-3 max-w-xs truncate">{row.sujet || "—"}</td>
                <td className="px-4 py-3 whitespace-nowrap">{row.destinataires_count}</td>
                <td className="px-4 py-3">
                  <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${STATUT_BADGE[row.statut] ?? ""}`}>
                    {STATUT_LABELS[row.statut] ?? row.statut}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <button
                    type="button"
                    onClick={() => setDetail(row)}
                    className="text-primary-700 hover:underline text-sm font-medium"
                  >
                    Voir détails
                  </button>
                </td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-neutral-500">
                  Aucun envoi pour le moment.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <nav aria-label="Pagination" className="flex items-center justify-center gap-2 mt-6">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => goToPage(p)}
              disabled={isPending}
              aria-current={p === page ? "page" : undefined}
              className={[
                "px-3 py-1.5 rounded text-sm font-medium transition-colors",
                p === page
                  ? "bg-primary-800 text-white"
                  : "bg-white border border-neutral-200 text-neutral-600 hover:bg-neutral-100",
              ].join(" ")}
            >
              {p}
            </button>
          ))}
        </nav>
      )}

      {detail && (
        <Modal title="Détails de l'envoi" onClose={() => setDetail(null)}>
          <div className="flex flex-col gap-4 text-sm">
            <div>
              <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wide">Sujet</p>
              <p>{detail.sujet || "—"}</p>
            </div>
            <div>
              <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wide">Contenu</p>
              <p className="whitespace-pre-wrap">{detail.contenu}</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wide">Email</p>
                <p>
                  {detail.resultats.email
                    ? `${detail.resultats.email.envoyes} envoyé(s), ${detail.resultats.email.echecs} échec(s)`
                    : "Non utilisé"}
                </p>
              </div>
              <div>
                <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wide">SMS</p>
                <p>
                  {detail.resultats.sms
                    ? `${detail.resultats.sms.envoyes} envoyé(s), ${detail.resultats.sms.echecs} échec(s)`
                    : "Non utilisé"}
                </p>
              </div>
            </div>
            {detail.erreurs.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wide mb-1">Erreurs</p>
                <ul className="list-disc pl-5 text-red-700">
                  {detail.erreurs.map((e, i) => (
                    <li key={i}>{e}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
}
