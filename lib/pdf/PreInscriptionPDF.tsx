import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";
import { getAnneeScolaire } from "@/lib/scolarite";

export interface PreInscriptionPDFProps {
  dossier: {
    id: string;
    eleve_nom: string;
    eleve_prenom: string;
    eleve_date_naissance?: string;
    eleve_lieu_naissance?: string;
    eleve_nationalite?: string;
    eleve_sexe?: string;
    eleve_ethnie?: string;
    eleve_religion?: string;
    eleve_telephone_domicile?: string;
    eleve_classe_souhaitee?: string;
    classe_redoublee?: boolean;
    ecole_precedente?: string;
    secteur?: string;
    quartier_ville?: string;
    pere_nom?: string;
    pere_prenom?: string;
    pere_profession?: string;
    pere_service?: string;
    pere_telephone?: string;
    pere_email?: string;
    mere_nom?: string;
    mere_prenom?: string;
    mere_profession?: string;
    mere_service?: string;
    mere_telephone?: string;
    mere_email?: string;
    contact_nom?: string;
    contact_telephone?: string;
    contact_email?: string;
    statut?: string;
    classe_actuelle?: string;
    dossier_token?: string;
    created_at?: string;
    sante_asthme?: boolean;
    sante_cardiopathie?: boolean;
    sante_diabete?: boolean;
    sante_drepanocytose?: boolean;
    sante_hta?: boolean;
    sante_epilepsie?: boolean;
    aptitude_sport?: boolean | null;
  };
}

const BORDEAUX = "#8B1A1A";

const STATUT_LABELS: Record<string, string> = {
  nouveau: "Nouveau",
  contacte: "Contacté",
  dossier_recu: "Dossier reçu",
  accepte: "Accepté",
  refuse: "Refusé",
};

const STATUT_COLORS: Record<string, string> = {
  nouveau: "#6B7280",
  contacte: "#2563EB",
  dossier_recu: "#D97706",
  accepte: "#16A34A",
  refuse: "#DC2626",
};

const PATHOLOGIE_LABELS: Array<{ key: "sante_asthme" | "sante_cardiopathie" | "sante_diabete" | "sante_drepanocytose" | "sante_hta" | "sante_epilepsie"; label: string }> = [
  { key: "sante_asthme", label: "Asthme" },
  { key: "sante_cardiopathie", label: "Cardiopathie" },
  { key: "sante_diabete", label: "Diabète" },
  { key: "sante_drepanocytose", label: "Drépanocytose" },
  { key: "sante_hta", label: "HTA" },
  { key: "sante_epilepsie", label: "Épilepsie" },
];

function defaultAnneeScolaire(): string {
  const { annee, anneeN1 } = getAnneeScolaire();
  return `${annee}-${anneeN1}`;
}

function formatDate(value?: string): string {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("fr-FR");
}

function val(value?: string | null): string {
  return value && value.trim() !== "" ? value : "—";
}

const styles = StyleSheet.create({
  page: { padding: 28, fontSize: 9, fontFamily: "Helvetica", color: "#1a1a1a" },
  headerRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 },
  logoBox: { flexDirection: "row", alignItems: "center", gap: 8 },
  logo: {
    width: 32,
    height: 32,
    borderRadius: 4,
    backgroundColor: BORDEAUX,
    alignItems: "center",
    justifyContent: "center",
  },
  logoText: { color: "#fff", fontSize: 11, fontFamily: "Helvetica-Bold" },
  schoolName: { fontSize: 12, fontFamily: "Helvetica-Bold" },
  anneeScolaire: { fontSize: 9, color: "#444" },
  bandeau: { backgroundColor: BORDEAUX, paddingVertical: 8, alignItems: "center", marginBottom: 8 },
  bandeauText: { color: "#fff", fontSize: 14, fontFamily: "Helvetica-Bold", letterSpacing: 1 },
  subRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
  },
  subText: { fontSize: 9, color: "#444" },
  badge: { paddingVertical: 3, paddingHorizontal: 8, borderRadius: 3 },
  badgeText: { color: "#fff", fontSize: 8, fontFamily: "Helvetica-Bold" },
  section: { marginBottom: 12 },
  sectionTitle: {
    backgroundColor: BORDEAUX,
    color: "#fff",
    fontSize: 9,
    fontFamily: "Helvetica-Bold",
    padding: 5,
    marginBottom: 4,
  },
  row: { flexDirection: "row", borderBottomWidth: 0.5, borderColor: "#ddd" },
  labelCell: {
    width: "35%",
    padding: 4,
    fontSize: 8,
    fontFamily: "Helvetica-Bold",
    color: "#555",
    backgroundColor: "#FAFAFA",
    borderRightWidth: 0.5,
    borderColor: "#ddd",
  },
  valueCell: { width: "65%", padding: 4, fontSize: 8.5 },
  pathologiesRow: { flexDirection: "row", flexWrap: "wrap", gap: 4, padding: 4 },
  pathoBadge: {
    backgroundColor: "#FEE2E2",
    color: "#B91C1C",
    fontSize: 7.5,
    fontFamily: "Helvetica-Bold",
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: 8,
  },
  aptBadgeGreen: {
    backgroundColor: "#DCFCE7",
    color: "#15803D",
    fontSize: 7.5,
    fontFamily: "Helvetica-Bold",
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: 8,
    alignSelf: "flex-start",
  },
  aptBadgeRed: {
    backgroundColor: "#FEE2E2",
    color: "#B91C1C",
    fontSize: 7.5,
    fontFamily: "Helvetica-Bold",
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: 8,
    alignSelf: "flex-start",
  },
  aptBadgeGray: {
    backgroundColor: "#F3F4F6",
    color: "#4B5563",
    fontSize: 7.5,
    fontFamily: "Helvetica-Bold",
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: 8,
    alignSelf: "flex-start",
  },
  footer: {
    position: "absolute",
    bottom: 20,
    left: 28,
    right: 28,
    borderTopWidth: 0.5,
    borderColor: "#ddd",
    paddingTop: 6,
  },
  footerText: { fontSize: 7, color: "#888", textAlign: "center" },
});

function Ligne({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.row}>
      <View style={styles.labelCell}>
        <Text>{label}</Text>
      </View>
      <View style={styles.valueCell}>
        <Text>{value}</Text>
      </View>
    </View>
  );
}

export default function PreInscriptionPDF({ dossier: p }: PreInscriptionPDFProps) {
  const annee = defaultAnneeScolaire();
  const statutLabel = p.statut ? STATUT_LABELS[p.statut] ?? p.statut : "—";
  const statutColor = p.statut ? STATUT_COLORS[p.statut] ?? "#6B7280" : "#6B7280";
  const generationDate = new Date().toLocaleDateString("fr-FR");
  const pathologies = PATHOLOGIE_LABELS.filter(({ key }) => p[key]);

  return (
    <Document>
      <Page size="A4" orientation="portrait" style={styles.page}>
        <View style={styles.headerRow}>
          <View style={styles.logoBox}>
            <View style={styles.logo}>
              <Text style={styles.logoText}>LPP</Text>
            </View>
            <Text style={styles.schoolName}>Lycée Privé Pagnidibsom</Text>
          </View>
          <Text style={styles.anneeScolaire}>Année scolaire {annee}</Text>
        </View>

        <View style={styles.bandeau}>
          <Text style={styles.bandeauText}>FICHE DE PRÉ-INSCRIPTION</Text>
        </View>

        <View style={styles.subRow}>
          <Text style={styles.subText}>
            N° Dossier : {val(p.dossier_token)} · Date : {formatDate(p.created_at)}
          </Text>
          <View style={[styles.badge, { backgroundColor: statutColor }]}>
            <Text style={styles.badgeText}>{statutLabel}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>INFORMATIONS DE L&rsquo;ÉLÈVE</Text>
          <Ligne label="Nom complet" value={`${val(p.eleve_prenom)} ${val(p.eleve_nom)}`} />
          <Ligne label="Date de naissance" value={formatDate(p.eleve_date_naissance)} />
          <Ligne label="Lieu de naissance" value={val(p.eleve_lieu_naissance)} />
          <Ligne label="Nationalité" value={val(p.eleve_nationalite)} />
          <Ligne
            label="Sexe"
            value={p.eleve_sexe === "M" ? "Masculin" : p.eleve_sexe === "F" ? "Féminin" : "—"}
          />
          <Ligne label="Ethnie" value={val(p.eleve_ethnie)} />
          <Ligne label="Religion" value={val(p.eleve_religion)} />
          <Ligne label="Classe souhaitée" value={val(p.eleve_classe_souhaitee)} />
          <Ligne label="Classe redoublée" value={p.classe_redoublee ? "Oui" : "Non"} />
          <Ligne label="École précédente" value={val(p.ecole_precedente)} />
          <Ligne label="Secteur" value={val(p.secteur)} />
          <Ligne label="Quartier / Ville" value={val(p.quartier_ville)} />
          <Ligne label="Téléphone domicile" value={val(p.eleve_telephone_domicile)} />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>PÈRE / TUTEUR</Text>
          <Ligne label="Nom complet" value={`${val(p.pere_prenom)} ${val(p.pere_nom)}`} />
          <Ligne label="Profession" value={val(p.pere_profession)} />
          <Ligne label="Service / Employeur" value={val(p.pere_service)} />
          <Ligne label="Téléphone" value={val(p.pere_telephone)} />
          <Ligne label="Email" value={val(p.pere_email)} />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>MÈRE / TUTRICE</Text>
          <Ligne label="Nom complet" value={`${val(p.mere_prenom)} ${val(p.mere_nom)}`} />
          <Ligne label="Profession" value={val(p.mere_profession)} />
          <Ligne label="Service / Employeur" value={val(p.mere_service)} />
          <Ligne label="Téléphone" value={val(p.mere_telephone)} />
          <Ligne label="Email" value={val(p.mere_email)} />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>CONTACT PRINCIPAL</Text>
          <Ligne label="Nom" value={val(p.contact_nom)} />
          <Ligne label="Téléphone (WhatsApp)" value={val(p.contact_telephone)} />
          <Ligne label="Email" value={val(p.contact_email)} />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>OBSERVATIONS PARTICULIÈRES</Text>
          <View style={styles.row}>
            <View style={styles.labelCell}>
              <Text>Pathologies connues</Text>
            </View>
            <View style={[styles.valueCell, styles.pathologiesRow]}>
              {pathologies.length > 0 ? (
                pathologies.map(({ key, label }) => (
                  <Text key={key} style={styles.pathoBadge}>
                    {label}
                  </Text>
                ))
              ) : (
                <Text>Aucune pathologie signalée</Text>
              )}
            </View>
          </View>
          <View style={styles.row}>
            <View style={styles.labelCell}>
              <Text>Aptitude au sport</Text>
            </View>
            <View style={[styles.valueCell, { padding: 4 }]}>
              {p.aptitude_sport === true && <Text style={styles.aptBadgeGreen}>Apte</Text>}
              {p.aptitude_sport === false && <Text style={styles.aptBadgeRed}>Inapte</Text>}
              {(p.aptitude_sport === null || p.aptitude_sport === undefined) && (
                <Text style={styles.aptBadgeGray}>Non renseigné</Text>
              )}
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>DÉCISION ADMINISTRATIVE</Text>
          <Ligne label="Classe actuelle assignée" value={val(p.classe_actuelle)} />
          <Ligne label="Statut du dossier" value={statutLabel} />
        </View>

        <View style={styles.footer} fixed>
          <Text style={styles.footerText}>
            Lycée Privé Pagnidibsom — lyceepagnidibsom.com — lyceepagnidibsom@gmail.com
          </Text>
          <Text style={styles.footerText}>Document généré le {generationDate}</Text>
        </View>
      </Page>
    </Document>
  );
}
