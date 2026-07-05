import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";
import { JOURS, CRENEAUX_MATIN, CRENEAUX_APREM, getAnneeScolaire, type Jour } from "@/lib/scolarite";

export interface EmploiDuTempsPDFProps {
  classe: string;
  cours: Array<{
    jour: string;
    creneau: string;
    matiere: string;
    enseignant?: string;
    salle?: string;
  }>;
  anneeScolaire?: string;
}

const BORDEAUX = "#8B1A1A";

const JOUR_LABELS: Record<Jour, string> = {
  lundi: "Lundi",
  mardi: "Mardi",
  mercredi: "Mercredi",
  jeudi: "Jeudi",
  vendredi: "Vendredi",
  samedi: "Samedi",
};

function defaultAnneeScolaire(): string {
  const { annee, anneeN1 } = getAnneeScolaire();
  return `${annee}-${anneeN1}`;
}

const styles = StyleSheet.create({
  page: { padding: 24, fontSize: 9, fontFamily: "Helvetica", color: "#1a1a1a" },
  headerRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 10 },
  schoolName: { fontSize: 12, fontFamily: "Helvetica-Bold" },
  anneeScolaire: { fontSize: 9, color: "#444" },
  bandeau: { backgroundColor: BORDEAUX, paddingVertical: 6, alignItems: "center" },
  bandeauText: { color: "#fff", fontSize: 14, fontFamily: "Helvetica-Bold", letterSpacing: 1 },
  classeRow: { alignItems: "flex-end", marginTop: 4, marginBottom: 10 },
  classeText: { fontSize: 10, fontFamily: "Helvetica-Bold" },
  table: { borderWidth: 1, borderColor: BORDEAUX },
  theadRow: { flexDirection: "row", backgroundColor: BORDEAUX },
  thCreneau: { width: "15%", padding: 4 },
  thJour: { width: "14.16%", padding: 4 },
  thText: { color: "#fff", fontSize: 8, fontFamily: "Helvetica-Bold", textAlign: "center" },
  sectionRow: { backgroundColor: "#F0F0F0" },
  sectionText: {
    padding: 3,
    fontSize: 8,
    fontFamily: "Helvetica-Oblique",
    color: "#555",
    textTransform: "uppercase",
  },
  tr: { flexDirection: "row", borderBottomWidth: 0.5, borderColor: "#ddd" },
  tdCreneau: {
    width: "15%",
    padding: 4,
    borderRightWidth: 0.5,
    borderColor: "#ddd",
    backgroundColor: "#FAFAFA",
  },
  tdCreneauText: { fontSize: 8, fontFamily: "Helvetica-Bold" },
  tdJour: { width: "14.16%", padding: 4, borderRightWidth: 0.5, borderColor: "#ddd" },
  matiere: { fontSize: 8, fontFamily: "Helvetica-Bold" },
  enseignant: { fontSize: 7, color: "#555", marginTop: 1 },
  salle: { fontSize: 7, color: "#999", marginTop: 1 },
  empty: { fontSize: 8, color: "#bbb", textAlign: "center" },
  corps: { marginTop: 16 },
  corpsTitle: { fontSize: 10, fontFamily: "Helvetica-Bold", marginBottom: 4, color: BORDEAUX },
  corpsHeaderRow: { flexDirection: "row", backgroundColor: BORDEAUX },
  corpsHeaderCell: { flex: 1, padding: 4, color: "#fff", fontSize: 8, fontFamily: "Helvetica-Bold" },
  corpsRow: { flexDirection: "row", borderBottomWidth: 0.5, borderColor: "#ddd" },
  corpsCell: { flex: 1, padding: 4, fontSize: 8 },
});

export default function EmploiDuTempsPDF({ classe, cours, anneeScolaire }: EmploiDuTempsPDFProps) {
  const annee = anneeScolaire ?? defaultAnneeScolaire();

  const cellMap = new Map<string, (typeof cours)[number]>();
  for (const c of cours) cellMap.set(`${c.jour}__${c.creneau}`, c);

  const enseignants = new Map<string, string>();
  for (const c of cours) {
    if (c.enseignant) enseignants.set(c.matiere, c.enseignant);
  }

  function renderSection(creneaux: readonly string[], label: string) {
    return (
      <>
        <View style={styles.sectionRow}>
          <Text style={styles.sectionText}>{label}</Text>
        </View>
        {creneaux.map((creneau) => (
          <View style={styles.tr} key={creneau}>
            <View style={styles.tdCreneau}>
              <Text style={styles.tdCreneauText}>{creneau}</Text>
            </View>
            {JOURS.map((jour) => {
              const cell = cellMap.get(`${jour}__${creneau}`);
              return (
                <View style={styles.tdJour} key={jour}>
                  {cell ? (
                    <>
                      <Text style={styles.matiere}>{cell.matiere}</Text>
                      {cell.enseignant && <Text style={styles.enseignant}>{cell.enseignant}</Text>}
                      {cell.salle && <Text style={styles.salle}>{cell.salle}</Text>}
                    </>
                  ) : (
                    <Text style={styles.empty}>—</Text>
                  )}
                </View>
              );
            })}
          </View>
        ))}
      </>
    );
  }

  return (
    <Document>
      <Page size="A4" orientation="landscape" style={styles.page}>
        <View style={styles.headerRow}>
          <Text style={styles.schoolName}>Lycée Privé Pagnidibsom</Text>
          <Text style={styles.anneeScolaire}>Année scolaire {annee}</Text>
        </View>

        <View style={styles.bandeau}>
          <Text style={styles.bandeauText}>EMPLOI DU TEMPS</Text>
        </View>
        <View style={styles.classeRow}>
          <Text style={styles.classeText}>Classe de {classe}</Text>
        </View>

        <View style={styles.table}>
          <View style={styles.theadRow}>
            <View style={styles.thCreneau}>
              <Text style={styles.thText}>Créneaux</Text>
            </View>
            {JOURS.map((jour) => (
              <View style={styles.thJour} key={jour}>
                <Text style={styles.thText}>{JOUR_LABELS[jour]}</Text>
              </View>
            ))}
          </View>
          {renderSection(CRENEAUX_MATIN, "Matin")}
          {renderSection(CRENEAUX_APREM, "Après-midi")}
        </View>

        {enseignants.size > 0 && (
          <View style={styles.corps}>
            <Text style={styles.corpsTitle}>Corps professoral</Text>
            <View style={styles.corpsHeaderRow}>
              <Text style={styles.corpsHeaderCell}>DISCIPLINE</Text>
              <Text style={styles.corpsHeaderCell}>NOM</Text>
            </View>
            {[...enseignants.entries()].map(([matiere, enseignant]) => (
              <View style={styles.corpsRow} key={matiere}>
                <Text style={styles.corpsCell}>{matiere}</Text>
                <Text style={styles.corpsCell}>{enseignant}</Text>
              </View>
            ))}
          </View>
        )}
      </Page>
    </Document>
  );
}
