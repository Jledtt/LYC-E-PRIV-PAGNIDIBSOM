import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";
import { getAnneeScolaire } from "@/lib/scolarite";

export interface CalendrierDevoirsPDFProps {
  classe: string;
  trimestre: number;
  devoirs: Array<{
    date_devoir: string;
    matiere: string;
    heure_debut?: string;
    heure_fin?: string;
    type: "devoir" | "composition";
  }>;
  anneeScolaire?: string;
}

const BORDEAUX = "#8B1A1A";

const JOURS_LABELS = ["Dimanche", "Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi"];
const MOIS_LABELS = [
  "JANVIER",
  "FÉVRIER",
  "MARS",
  "AVRIL",
  "MAI",
  "JUIN",
  "JUILLET",
  "AOÛT",
  "SEPTEMBRE",
  "OCTOBRE",
  "NOVEMBRE",
  "DÉCEMBRE",
];

function ordinalTrimestre(trimestre: number): string {
  return trimestre === 1 ? "1er" : `${trimestre}e`;
}

function formatDateLigne(dateStr: string): string {
  const d = new Date(`${dateStr}T00:00:00`);
  const jour = JOURS_LABELS[d.getDay()];
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yy = String(d.getFullYear()).slice(-2);
  return `${jour} ${dd}/${mm}/${yy}`;
}

function moisLabel(dateStr: string): string {
  const d = new Date(`${dateStr}T00:00:00`);
  return MOIS_LABELS[d.getMonth()];
}

function formatHoraire(debut?: string, fin?: string): string {
  if (debut && fin) return `${debut}-${fin}`;
  if (debut) return debut;
  if (fin) return fin;
  return "—";
}

function defaultAnneeScolaire(): string {
  const { annee, anneeN1 } = getAnneeScolaire();
  return `${annee}-${anneeN1}`;
}

const styles = StyleSheet.create({
  page: { padding: 28, fontSize: 9, fontFamily: "Helvetica", color: "#1a1a1a" },
  headerRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 14 },
  schoolName: { fontSize: 12, fontFamily: "Helvetica-Bold" },
  anneeScolaire: { fontSize: 9, color: "#444" },
  titre: { fontSize: 13, fontFamily: "Helvetica-Bold", textAlign: "center", marginBottom: 6 },
  classeRow: { alignItems: "flex-end", marginBottom: 12 },
  classeText: { fontSize: 10, fontFamily: "Helvetica-Bold" },
  table: { borderWidth: 1, borderColor: BORDEAUX },
  theadRow: { flexDirection: "row", backgroundColor: BORDEAUX },
  thMois: { width: "15%", padding: 5 },
  thDates: { width: "30%", padding: 5 },
  thMatieres: { width: "40%", padding: 5 },
  thHoraires: { width: "15%", padding: 5 },
  thText: { color: "#fff", fontSize: 8, fontFamily: "Helvetica-Bold", textAlign: "center" },
  tr: { flexDirection: "row", borderBottomWidth: 0.5, borderColor: "#ddd" },
  tdMois: { width: "15%", padding: 5, borderRightWidth: 0.5, borderColor: "#ddd" },
  tdMoisContinuation: { borderLeftWidth: 2, borderLeftColor: BORDEAUX },
  tdDates: { width: "30%", padding: 5, borderRightWidth: 0.5, borderColor: "#ddd" },
  tdMatieres: { width: "40%", padding: 5, borderRightWidth: 0.5, borderColor: "#ddd" },
  tdHoraires: { width: "15%", padding: 5 },
  text: { fontSize: 8 },
  textCompo: { fontSize: 8, fontFamily: "Helvetica-BoldOblique" },
});

export default function CalendrierDevoirsPDF({
  classe,
  trimestre,
  devoirs,
  anneeScolaire,
}: CalendrierDevoirsPDFProps) {
  const annee = anneeScolaire ?? defaultAnneeScolaire();
  let lastMois: string | null = null;

  return (
    <Document>
      <Page size="A4" orientation="portrait" style={styles.page}>
        <View style={styles.headerRow}>
          <Text style={styles.schoolName}>Lycée Privé Pagnidibsom</Text>
          <Text style={styles.anneeScolaire}>Année scolaire {annee}</Text>
        </View>

        <Text style={styles.titre}>
          Calendrier des devoirs du {ordinalTrimestre(trimestre)} trimestre
        </Text>
        <View style={styles.classeRow}>
          <Text style={styles.classeText}>Classe : {classe}</Text>
        </View>

        <View style={styles.table}>
          <View style={styles.theadRow}>
            <View style={styles.thMois}>
              <Text style={styles.thText}>Mois</Text>
            </View>
            <View style={styles.thDates}>
              <Text style={styles.thText}>Dates</Text>
            </View>
            <View style={styles.thMatieres}>
              <Text style={styles.thText}>Matières</Text>
            </View>
            <View style={styles.thHoraires}>
              <Text style={styles.thText}>Horaires</Text>
            </View>
          </View>

          {devoirs.map((d, i) => {
            const mois = moisLabel(d.date_devoir);
            const showMois = mois !== lastMois;
            lastMois = mois;
            const isCompo = d.type === "composition";
            const textStyle = isCompo ? styles.textCompo : styles.text;

            return (
              <View
                style={[styles.tr, { backgroundColor: i % 2 === 0 ? "#FFFFFF" : "#F9F9F9" }]}
                key={`${d.date_devoir}-${d.matiere}-${i}`}
              >
                <View style={[styles.tdMois, showMois ? {} : styles.tdMoisContinuation]}>
                  <Text style={textStyle}>{showMois ? mois : ""}</Text>
                </View>
                <View style={styles.tdDates}>
                  <Text style={textStyle}>{formatDateLigne(d.date_devoir)}</Text>
                </View>
                <View style={styles.tdMatieres}>
                  <Text style={textStyle}>
                    {isCompo ? `Composition du ${ordinalTrimestre(trimestre)} trimestre` : d.matiere}
                  </Text>
                </View>
                <View style={styles.tdHoraires}>
                  <Text style={textStyle}>{formatHoraire(d.heure_debut, d.heure_fin)}</Text>
                </View>
              </View>
            );
          })}
        </View>
      </Page>
    </Document>
  );
}
