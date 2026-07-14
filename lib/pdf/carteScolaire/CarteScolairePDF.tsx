import { Document, Page, View, Text, Image, StyleSheet } from "@react-pdf/renderer";
import type { Style } from "@react-pdf/types";
import type { CardContent } from "./buildCardContent";
import { CARD_WIDTH_PT, CARD_HEIGHT_PT, LOGO_IMAGE, CARTE_SCOLAIRE_STATIQUE, WATERMARK_OPACITY } from "./constants";

const { nomEcole, tagline, filiere, autorisation, adresse, email, telephone, orangeBar, bordeaux } =
  CARTE_SCOLAIRE_STATIQUE;

// Bande de texte du bandeau institutionnel : entre les deux logos.
const HEADER_TEXT_LEFT = 20;
const HEADER_TEXT_WIDTH = 63; // 83% - 20%

/** Boîte positionnée en absolu par pourcentage de la carte (mesures prises
 *  sur la carte physique originale). Toutes les tailles/positions de ce
 *  fichier utilisent ce système plutôt que le flux flex, pour deux raisons :
 *  1) coller exactement aux pourcentages mesurés, 2) l'ordre des enfants
 *  JSX n'a alors plus d'incidence sur le placement visuel (contrairement au
 *  flex, où inverser l'ordre déplace les éléments). */
function box(top: number, left: number, width: number, height: number) {
  return {
    position: "absolute" as const,
    top: `${top}%`,
    left: `${left}%`,
    width: `${width}%`,
    height: `${height}%`,
  };
}

const styles = StyleSheet.create({
  page: {
    width: CARD_WIDTH_PT,
    height: CARD_HEIGHT_PT,
    fontFamily: "Helvetica",
    color: "#1a1a1a",
  },
  content: {
    position: "relative",
    width: "100%",
    height: "100%",
  },

  // Filigrane — DOIT rester premier enfant de .content (pas un sibling
  // direct au niveau de la Page) : react-pdf/Yoga entre en boucle infinie
  // sur cette taille de page si une Image en position absolue est un
  // second enfant racine de <Page> à côté d'un View — bug constaté
  // empiriquement, cf. historique.
  watermark: {
    position: "absolute",
    top: "36%", // centré en y à 65% : 65% - 58%/2
    left: "26.5%", // centré en x à 50% : 50% - 47%/2
    width: "47%",
    height: "58%",
    opacity: WATERMARK_OPACITY,
  },

  // Diamètre défini en % de la LARGEUR (15%) ; converti en % de hauteur
  // pour que le cercle reste un cercle (carte au format paysage, largeur
  // != hauteur). Centré en (12%, 16.5%) / (93%, 16.5%) — remonté depuis
  // 20% : à 20%, le bord bas du cercle (diamètre 23,78% de hauteur)
  // atteignait ~32%, chevauchant la ligne de séparation à 31%.
  logoLeft: box(4.6, 4.5, 15, 15 * (CARD_WIDTH_PT / CARD_HEIGHT_PT)),
  logoRight: box(4.6, 85.5, 15, 15 * (CARD_WIDTH_PT / CARD_HEIGHT_PT)),

  // Titre : boîte 0-9% inchangée (13,78pt disponibles), police 7,5 -> 10pt
  // (10*1.3 = 13pt requis avec la marge de sécurité déjà validée
  // empiriquement sur ce composant) — tient largement dans la boîte.
  schoolName: {
    ...box(0, HEADER_TEXT_LEFT, HEADER_TEXT_WIDTH, 9),
    fontSize: 10,
    fontFamily: "Helvetica-Bold",
    color: bordeaux,
    textAlign: "center",
  },
  // Bloc tagline -> tel : polices augmentées, boîtes recalculées pour
  // chaque nouvelle taille (règle appliquée : hauteur boîte >= police *
  // 1,3, marge de sécurité issue du bug de rognage précédent) et empilées
  // sans espace, de 9% à 31% pile (ligne de séparation collée juste après).
  tagline: {
    ...box(9, HEADER_TEXT_LEFT, HEADER_TEXT_WIDTH, 4.35),
    fontSize: 5,
    fontStyle: "italic",
    textAlign: "center",
  },
  filiere: {
    ...box(13.35, HEADER_TEXT_LEFT, HEADER_TEXT_WIDTH, 4.05),
    fontSize: 4.6,
    fontFamily: "Helvetica-Bold",
    textAlign: "center",
  },
  autorisation: {
    ...box(17.4, HEADER_TEXT_LEFT, HEADER_TEXT_WIDTH, 3.4),
    fontSize: 3.85,
    textAlign: "center",
  },
  adresse: {
    ...box(20.8, HEADER_TEXT_LEFT, HEADER_TEXT_WIDTH, 3.4),
    fontSize: 3.85,
    textAlign: "center",
  },
  headerEmail: {
    ...box(24.2, HEADER_TEXT_LEFT, HEADER_TEXT_WIDTH, 3.4),
    fontSize: 3.85,
    textAlign: "center",
  },
  headerTel: {
    ...box(27.6, HEADER_TEXT_LEFT, HEADER_TEXT_WIDTH, 3.4),
    fontSize: 3.85,
    textAlign: "center",
  },
  separator: {
    position: "absolute",
    top: "31%",
    left: 0,
    width: "100%",
    height: 0.75,
    backgroundColor: "#000000",
  },

  // Colonne texte identité (gauche) — 6 champs (PAS de Contact urgence ici :
  // décision confirmée, un seul emplacement pour cette donnée, le bandeau
  // orange "Personne à prévenir en cas de besoin") étalés de 36% à ~88,9%
  // pour combler le vide constaté (le bloc s'arrêtait à 83% avant cet
  // ajustement). Police et hauteur de boîte (5,5%, >= police valeur
  // 6,2pt * 1,3) inchangées — seul l'espacement entre lignes augmente.
  //
  // ⚠️ COMPROMIS TEMPORAIRE — ces tailles/espacements supposent l'ABSENCE
  // de bloc signature (retiré en attendant un scan haute résolution, cf.
  // constants.ts / SIGNATURE_IMAGE). Le jour où la signature revient dans
  // le pied de carte, il faudra probablement RÉDUIRE ces boîtes (police
  // et/ou espacement) pour lui redonner de la place — ne pas juste
  // rajouter la signature par-dessus sans revoir ce bloc.
  champNom: box(36, 2, 48, 5.5),
  champPrenom: box(45.48, 2, 48, 5.5),
  champNaissance: box(54.96, 2, 48, 5.5),
  champLieu: box(64.44, 2, 48, 5.5),
  champClasse: box(73.92, 2, 48, 5.5),
  champAnnee: box(83.4, 2, 48, 5.5),
  // Label + valeur sur UNE seule ligne (pas empilés) : les hauteurs mesurées
  // sur la carte physique pour Né(e) le / A / Classe (4%, ≈6pt) ne
  // laissent pas la place à deux lignes de texte empilées.
  champRow: { flexDirection: "row", alignItems: "baseline", gap: 3 },
  fieldLabel: { fontSize: 5.5, fontFamily: "Helvetica-Bold", color: "#555" },
  fieldValue: { fontSize: 6.2 },

  // Photo élève (droite) — agrandie en cohérence avec le bloc texte
  // ci-dessus (36% -> ~88,9%) : s'étend maintenant jusqu'à 87% (au lieu de
  // 81%). Même avertissement compromis-signature que ci-dessus : la photo
  // pourrait devoir être raccourcie en bas si la signature revient.
  photo: {
    ...box(37, 75, 23, 50),
    objectFit: "cover",
    borderWidth: 0.5,
    borderColor: "#999",
  },

  // Bandeau orange bas — contact d'urgence
  orangeBar: {
    position: "absolute",
    top: "94%",
    left: 0,
    width: "100%",
    height: "6%",
    backgroundColor: orangeBar,
    justifyContent: "center",
    paddingLeft: 5,
  },
  orangeBarText: {
    fontSize: 4.5,
    fontFamily: "Helvetica-Bold",
    color: "#000000",
  },
});

function Champ({ style, label, value }: { style: Style; label: string; value: string }) {
  return (
    <View style={[style, styles.champRow]}>
      <Text style={styles.fieldLabel}>{label} :</Text>
      <Text style={styles.fieldValue}>{value}</Text>
    </View>
  );
}

export interface CarteScolairePDFProps {
  content: CardContent;
}

export default function CarteScolairePDF({ content }: CarteScolairePDFProps) {
  return (
    <Document>
      <Page size={[CARD_WIDTH_PT, CARD_HEIGHT_PT]} style={styles.page}>
        <View style={styles.content}>
          {/* Filigrane */}
          <Image src={LOGO_IMAGE} style={styles.watermark} />

          {/* Bandeau institutionnel */}
          <Image src={LOGO_IMAGE} style={styles.logoLeft} />
          <Image src={LOGO_IMAGE} style={styles.logoRight} />
          <Text style={styles.schoolName}>{nomEcole}</Text>
          <Text style={styles.tagline}>{tagline}</Text>
          <Text style={styles.filiere}>{filiere}</Text>
          <Text style={styles.autorisation}>{autorisation}</Text>
          <Text style={styles.adresse}>{adresse}</Text>
          <Text style={styles.headerEmail}>{email}</Text>
          <Text style={styles.headerTel}>{telephone}</Text>
          <View style={styles.separator} />

          {/* Identité — colonne texte à gauche, photo à droite */}
          <Champ style={styles.champNom} label="Nom" value={content.nom} />
          <Champ style={styles.champPrenom} label="Prénom(s)" value={content.prenom} />
          <Champ style={styles.champNaissance} label="Né(e) le" value={content.neLe} />
          <Champ style={styles.champLieu} label="A" value={content.lieuNaissance} />
          <Champ style={styles.champClasse} label="Classe" value={content.classe} />
          <Champ style={styles.champAnnee} label="Année scolaire" value={content.anneeScolaire} />
          <Image src={content.photoUrl} style={styles.photo} />

          {/* Bandeau orange — contact d'urgence */}
          <View style={styles.orangeBar}>
            <Text style={styles.orangeBarText}>
              Personne à prévenir en cas de besoin : {content.contactUrgence}
            </Text>
          </View>
        </View>
      </Page>
    </Document>
  );
}
