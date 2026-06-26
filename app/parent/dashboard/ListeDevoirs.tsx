export interface DevoirItem {
  id: string;
  date_devoir: string;
  matiere: string;
  heure_debut: string | null;
  heure_fin: string | null;
  type: string;
}

interface Props {
  devoirs: DevoirItem[];
}

function groupByMonth(devoirs: DevoirItem[]): Array<{ label: string; items: DevoirItem[] }> {
  const map = new Map<string, DevoirItem[]>();
  for (const d of devoirs) {
    const date = new Date(d.date_devoir + "T00:00:00");
    const raw = date.toLocaleDateString("fr-FR", { month: "long", year: "numeric" });
    const label = raw.charAt(0).toUpperCase() + raw.slice(1);
    if (!map.has(label)) map.set(label, []);
    map.get(label)!.push(d);
  }
  return Array.from(map.entries()).map(([label, items]) => ({ label, items }));
}

export default function ListeDevoirs({ devoirs }: Props) {
  if (devoirs.length === 0) {
    return (
      <p className="text-sm text-neutral-500 italic">Aucun devoir ou composition à venir.</p>
    );
  }

  const groupes = groupByMonth(devoirs);

  return (
    <div className="flex flex-col gap-4">
      {groupes.map(({ label, items }) => (
        <div key={label}>
          <h4 className="text-xs font-semibold text-neutral-500 uppercase tracking-wide mb-2">
            {label}
          </h4>
          <ul className="flex flex-col gap-2">
            {items.map((d) => {
              const isCompo = d.type === "composition";
              return (
                <li key={d.id} className="flex items-start gap-3 text-sm">
                  <div
                    className={[
                      "w-1 self-stretch rounded-full shrink-0 mt-0.5",
                      isCompo ? "bg-orange-400" : "bg-blue-400",
                    ].join(" ")}
                  />
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
                          "text-xs font-semibold px-1.5 py-0.5 rounded-full",
                          isCompo
                            ? "bg-orange-100 text-orange-700"
                            : "bg-blue-50 text-blue-700",
                        ].join(" ")}
                      >
                        {isCompo ? "Composition" : "Devoir"}
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
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </div>
  );
}
