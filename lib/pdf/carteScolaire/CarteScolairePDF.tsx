import { Document, Page } from "@react-pdf/renderer";
import type { CardContent } from "./buildCardContent";
import { CARD_WIDTH_PT, CARD_HEIGHT_PT } from "./constants";
import CarteScolaireFace from "./CarteScolaireFace";

export interface CarteScolairePDFProps {
  content: CardContent;
}

/** Génération à l'unité — une seule carte, page au format ID-1 exact.
 *  Le gabarit visuel est entièrement délégué à CarteScolaireFace, partagé
 *  avec la planche en lot (PlancheCartesScolairesPDF). */
export default function CarteScolairePDF({ content }: CarteScolairePDFProps) {
  return (
    <Document>
      <Page size={[CARD_WIDTH_PT, CARD_HEIGHT_PT]}>
        <CarteScolaireFace content={content} />
      </Page>
    </Document>
  );
}
