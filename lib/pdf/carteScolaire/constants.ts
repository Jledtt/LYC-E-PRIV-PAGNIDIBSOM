// Constantes du gabarit de la carte scolaire — zone statique (identique
// pour toutes les cartes, indépendante de l'élève). Regroupées ici pour que
// le remplacement de la signature (actuellement un placeholder basse
// résolution, cf. README image) ou tout autre ajustement du gabarit ne
// touche jamais lib/pdf/carteScolaire/CarteScolairePDF.tsx.

import fs from "node:fs";
import path from "node:path";
import { siteConfig } from "@/config/site";

/** Format carte ID-1 (85,60 × 53,98 mm), converti en points (1 mm ≈ 2,83465 pt). */
const MM_TO_PT = 2.83464567;
export const CARD_WIDTH_PT = 85.6 * MM_TO_PT;
export const CARD_HEIGHT_PT = 53.98 * MM_TO_PT;

// Chemins fichier littéraux (pas de chemin dynamique) : Next.js les
// détecte au build (file tracing) et les inclut dans le bundle de la
// fonction serverless. Lues en Buffer au chargement du module — react-pdf
// résout toujours une `src` de type string comme une URL à fetcher (même
// un chemin local provoque un "fetch failed", ou pire, un auto-fetch du
// serveur sur lui-même qui bloque `next dev`) ; un objet { data, format }
// contourne totalement cette résolution réseau.
const LOGO_PATH = path.join(process.cwd(), "public", "images", "logo-lp.png");
const SIGNATURE_PATH = path.join(process.cwd(), "public", "images", "signature-proviseur.png");

export const LOGO_IMAGE = { data: fs.readFileSync(LOGO_PATH), format: "png" as const };
export const SIGNATURE_IMAGE = { data: fs.readFileSync(SIGNATURE_PATH), format: "png" as const };

export const CARTE_SCOLAIRE_STATIQUE = {
  nomEcole: "LYCEE PRIVE PAGNIDIBSOM",
  tagline: "Bâtir l'excellence",
  filiere: "ENSEIGNEMENT TECHNIQUE ET GENERAL",
  autorisation: "Autorisation: N2021-01552/MENAPLN/SG/DEP",
  adresse: "04 BP 8825 OUAGADOUGOU 04-BF",
  email: `Email: ${siteConfig.contact.email}`,
  // Combine les deux numéros du site sans répéter l'indicatif, format
  // attendu sur la carte : "TEL: +226 72 81 61 59/78 42 62 06".
  telephone: `TEL: ${siteConfig.contact.phone}/${siteConfig.contact.phoneAlt.replace(/^\+226\s?/, "")}`,
  orangeBar: "#E6A817", // --color-accent-500 (charte du site)
  bordeaux: "#8B1E2D", // --color-primary-800 (charte du site)
} as const;

export const WATERMARK_OPACITY = 0.06;
