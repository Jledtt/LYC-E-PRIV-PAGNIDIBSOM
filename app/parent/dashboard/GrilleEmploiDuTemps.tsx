import { JOURS, CRENEAUX_MATIN, CRENEAUX_APREM, type Creneau } from "@/lib/scolarite";

export interface EdtRow {
  id: string;
  jour: string;
  creneau: string;
  matiere: string;
  enseignant: string | null;
  salle: string | null;
}

interface Props {
  rows: EdtRow[];
}

export default function GrilleEmploiDuTemps({ rows }: Props) {
  if (rows.length === 0) {
    return (
      <p className="text-sm text-neutral-500 italic">
        L&rsquo;emploi du temps de cette classe n&rsquo;a pas encore été saisi.
      </p>
    );
  }

  const cellMap = new Map<string, EdtRow>();
  for (const r of rows) {
    cellMap.set(`${r.jour}__${r.creneau}`, r);
  }

  function renderSection(creneaux: readonly Creneau[], label: string) {
    return (
      <>
        <tr>
          <td
            colSpan={JOURS.length + 1}
            className="bg-neutral-50 px-2 py-1 text-xs font-semibold text-neutral-500 uppercase tracking-wide"
          >
            {label}
          </td>
        </tr>
        {creneaux.map((creneau) => (
          <tr key={creneau}>
            <td className="border border-neutral-100 px-2 py-1.5 text-xs font-medium text-neutral-600 whitespace-nowrap bg-neutral-50 sticky left-0">
              {creneau}
            </td>
            {JOURS.map((jour) => {
              const cell = cellMap.get(`${jour}__${creneau}`);
              return (
                <td
                  key={jour}
                  className="border border-neutral-100 px-2 py-1.5 text-xs align-top min-w-[72px]"
                >
                  {cell ? (
                    <>
                      <p className="font-semibold text-primary-800 leading-tight">{cell.matiere}</p>
                      {cell.enseignant && (
                        <p className="text-neutral-500 mt-0.5 leading-tight">{cell.enseignant}</p>
                      )}
                      {cell.salle && (
                        <p className="text-neutral-400 leading-tight">{cell.salle}</p>
                      )}
                    </>
                  ) : (
                    <span className="text-neutral-200">—</span>
                  )}
                </td>
              );
            })}
          </tr>
        ))}
      </>
    );
  }

  return (
    <div className="overflow-x-auto rounded border border-neutral-200">
      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-primary-800 text-white">
            <th className="px-2 py-2 text-left text-xs font-semibold whitespace-nowrap sticky left-0 bg-primary-800 min-w-[60px]">
              Créneau
            </th>
            {JOURS.map((jour) => (
              <th
                key={jour}
                className="px-2 py-2 text-center text-xs font-semibold capitalize min-w-[72px]"
              >
                {jour.slice(0, 3)}.
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
