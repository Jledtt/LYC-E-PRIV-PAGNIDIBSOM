import { Fragment } from "react";
import { Document, Page, View, StyleSheet } from "@react-pdf/renderer";
import type { CardContent } from "./buildCardContent";
import { CARD_WIDTH_PT, CARD_HEIGHT_PT } from "./constants";
import CarteScolaireFace from "./CarteScolaireFace";

const MM_TO_PT = 2.83464567;
const A4_WIDTH_PT = 210 * MM_TO_PT;
const A4_HEIGHT_PT = 297 * MM_TO_PT;

// Grille 2 x 4 = 8 cartes/page. Marges/écarts calculés pour centrer
// exactement la grille sur la feuille A4 (marges horiz. 13,4mm, écarts
// 12mm — largement au-dessus du minimum de 3-5mm demandé pour la
// découpe, ce qui laisse aussi de la place aux traits de coupe eux-mêmes).
const COLS = 2;
const ROWS = 4;
const CARDS_PER_PAGE = COLS * ROWS;
const MARGIN_X_PT = 13.4 * MM_TO_PT;
const MARGIN_Y_PT = 22.54 * MM_TO_PT;
const GAP_X_PT = 12 * MM_TO_PT;
const GAP_Y_PT = 12 * MM_TO_PT;

// Traits de coupe (repères d'angle façon imprimerie) : un petit "L" à
// chaque coin de chaque carte, décalé de la carte pour ne jamais chevaucher
// son contenu, pointant vers l'extérieur (dans l'espace de découpe).
const CUT_MARK_LENGTH_PT = 3 * MM_TO_PT;
const CUT_MARK_OFFSET_PT = 1 * MM_TO_PT;
const CUT_MARK_THICKNESS_PT = 0.75;

const styles = StyleSheet.create({
  page: {
    width: A4_WIDTH_PT,
    height: A4_HEIGHT_PT,
  },
  // Conteneur unique : toutes les cartes/repères sont imbriqués dedans,
  // jamais siblings directs de <Page> — même règle anti-boucle-infinie
  // Yoga que sur la carte à l'unité (cf. CarteScolaireFace.tsx).
  sheet: {
    position: "relative",
    width: "100%",
    height: "100%",
  },
  cardSlot: {
    position: "absolute",
    width: CARD_WIDTH_PT,
    height: CARD_HEIGHT_PT,
  },
  cutMarkH: {
    position: "absolute",
    height: CUT_MARK_THICKNESS_PT,
    width: CUT_MARK_LENGTH_PT,
    backgroundColor: "#000000",
  },
  cutMarkV: {
    position: "absolute",
    width: CUT_MARK_THICKNESS_PT,
    height: CUT_MARK_LENGTH_PT,
    backgroundColor: "#000000",
  },
});

function slotPosition(indexOnPage: number): { x: number; y: number } {
  const col = indexOnPage % COLS;
  const row = Math.floor(indexOnPage / COLS);
  return {
    x: MARGIN_X_PT + col * (CARD_WIDTH_PT + GAP_X_PT),
    y: MARGIN_Y_PT + row * (CARD_HEIGHT_PT + GAP_Y_PT),
  };
}

function CornerCutMarks({ x, y }: { x: number; y: number }) {
  const w = CARD_WIDTH_PT;
  const h = CARD_HEIGHT_PT;
  const L = CUT_MARK_LENGTH_PT;
  const O = CUT_MARK_OFFSET_PT;
  const T = CUT_MARK_THICKNESS_PT;

  const corners = [
    { cx: x, cy: y, outX: -1, outY: -1 }, // haut-gauche
    { cx: x + w, cy: y, outX: 1, outY: -1 }, // haut-droit
    { cx: x, cy: y + h, outX: -1, outY: 1 }, // bas-gauche
    { cx: x + w, cy: y + h, outX: 1, outY: 1 }, // bas-droit
  ];

  return (
    <>
      {corners.map((c, i) => (
        <Fragment key={i}>
          <View
            style={[
              styles.cutMarkH,
              {
                left: c.outX === 1 ? c.cx + O : c.cx - O - L,
                top: c.cy - T / 2,
              },
            ]}
          />
          <View
            style={[
              styles.cutMarkV,
              {
                left: c.cx - T / 2,
                top: c.outY === 1 ? c.cy + O : c.cy - O - L,
              },
            ]}
          />
        </Fragment>
      ))}
    </>
  );
}

export interface PlancheCartesScolairesPDFProps {
  contents: CardContent[];
}

/** Planche A4 pour impression en lot — 8 cartes (grille 2x4) par page,
 *  traits de coupe aux 4 coins de chaque carte. Réutilise CarteScolaireFace
 *  (même gabarit visuel que la génération à l'unité, aucun mapping ni
 *  rendu dupliqué). Pagine automatiquement au-delà de 8 élèves. */
export default function PlancheCartesScolairesPDF({ contents }: PlancheCartesScolairesPDFProps) {
  const pages: CardContent[][] = [];
  for (let i = 0; i < contents.length; i += CARDS_PER_PAGE) {
    pages.push(contents.slice(i, i + CARDS_PER_PAGE));
  }

  return (
    <Document>
      {pages.map((pageContents, pageIndex) => (
        <Page key={pageIndex} size="A4" style={styles.page}>
          <View style={styles.sheet}>
            {pageContents.map((content, i) => {
              const { x, y } = slotPosition(i);
              return (
                <Fragment key={i}>
                  <View style={[styles.cardSlot, { left: x, top: y }]}>
                    <CarteScolaireFace content={content} />
                  </View>
                  <CornerCutMarks x={x} y={y} />
                </Fragment>
              );
            })}
          </View>
        </Page>
      ))}
    </Document>
  );
}
