"use client";

import { useMemo, useState } from "react";
import Link from "next/link";

export interface DossierRow {
  id: string;
  created_at: string;
  eleve_nom: string;
  eleve_prenom: string;
  classe_souhaitee: string;
  serie: string | null;
  parent_nom: string;
  parent_prenom: string;
  parent_telephone: string;
  aVerifier: number;
}

interface DossiersListProps {
  rows: DossierRow[];
}

export default function DossiersList({ rows }: DossiersListProps) {
  const [search, setSearch] = useState("");
  const [onlyAVerifier, setOnlyAVerifier] = useState(false);

  const filteredRows = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();
    return rows.filter((row) => {
      if (onlyAVerifier && row.aVerifier === 0) return false;
      if (!normalizedSearch) return true;
      const nomComplet = `${row.eleve_prenom} ${row.eleve_nom}`.toLowerCase();
      return nomComplet.includes(normalizedSearch);
    });
  }, [rows, search, onlyAVerifier]);

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-4">
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Rechercher un élève par nom ou prénom..."
          className="w-full sm:w-72 rounded-lg border border-neutral-300 px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary-600 focus:border-transparent transition"
          aria-label="Rechercher un dossier par nom ou prénom d'élève"
        />
        <label className="flex items-center gap-2 text-sm text-[#1F2937]">
          <input
            type="checkbox"
            checked={onlyAVerifier}
            onChange={(e) => setOnlyAVerifier(e.target.checked)}
            className="rounded border-neutral-300 text-primary-700 focus:ring-primary-600"
          />
          Afficher uniquement les dossiers avec pièces à vérifier
        </label>
      </div>

      <div className="bg-white border border-neutral-200 rounded-lg shadow-sm overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="bg-neutral-50 text-neutral-600 uppercase text-xs">
            <tr>
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3">Élève</th>
              <th className="px-4 py-3">Classe</th>
              <th className="px-4 py-3">Parent</th>
              <th className="px-4 py-3">Téléphone</th>
              <th className="px-4 py-3">Pièces</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100">
            {filteredRows.map((row) => (
              <tr key={row.id}>
                <td className="px-4 py-3 whitespace-nowrap">
                  {new Date(row.created_at).toLocaleDateString("fr-FR")}
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  {row.eleve_prenom} {row.eleve_nom}
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  {row.classe_souhaitee}
                  {row.serie ? ` (${row.serie})` : ""}
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  {row.parent_prenom} {row.parent_nom}
                </td>
                <td className="px-4 py-3 whitespace-nowrap">{row.parent_telephone}</td>
                <td className="px-4 py-3 whitespace-nowrap">
                  {row.aVerifier > 0 ? (
                    <span className="inline-block px-2 py-0.5 rounded text-xs font-semibold bg-accent-100 text-accent-800">
                      {row.aVerifier} pièce{row.aVerifier > 1 ? "s" : ""} à vérifier
                    </span>
                  ) : (
                    <span className="text-neutral-400 text-xs">—</span>
                  )}
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <Link
                    href={`/admin/dossiers/${row.id}`}
                    className="text-primary-700 hover:underline font-medium"
                  >
                    Ouvrir
                  </Link>
                </td>
              </tr>
            ))}
            {filteredRows.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-neutral-500">
                  {rows.length === 0 ? "Aucun dossier pour le moment." : "Aucun dossier ne correspond."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
