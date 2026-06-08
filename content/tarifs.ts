export const tarifsContent = {
  meta: {
    title: "Tarifs — Lycée Privé Pagnidibsom",
    description:
      "Frais de scolarité 2024-2025 du Lycée Privé Pagnidibsom : scolarité en trois tranches, frais annexes et tenues scolaires.",
  },
  hero: {
    heading: "Tarifs",
    subheading: "Transparence et accessibilité — tous les montants en FCFA",
  },
  note: "Les frais de scolarité sont répartis en trois versements : inscription (à l'entrée), deuxième tranche (décembre) et troisième tranche (février).",
  scolarite: {
    heading: "Frais de scolarité",
    colonnes: ["Classe", "Inscription", "2e tranche (déc.)", "3e tranche (fév.)", "Total"],
    lignes: [
      { classe: "6e, 5e, 4e",              t1: "60 000",         t2: "20 000", t3: "20 000", total: "100 000" },
      { classe: "3e, 2nde A & C",          t1: "60 000",         t2: "30 000", t3: "20 000", total: "110 000" },
      { classe: "1re A & C",               t1: "À communiquer", t2: "À communiquer", t3: "À communiquer", total: "À communiquer" },
      { classe: "BEP1 Génie Civil",        t1: "120 000",        t2: "40 000", t3: "40 000", total: "200 000" },
      { classe: "BEP1 Électrotechnique",   t1: "120 000",        t2: "40 000", t3: "40 000", total: "200 000" },
    ],
  },
  fraisAnnexes: {
    heading: "Frais annexes (à l'inscription)",
    items: [
      { label: "APE (Association des Parents d'Élèves)", montant: "5 000" },
      { label: "Carte d'identité scolaire",              montant: "1 000" },
      { label: "Frais d'inscription",                    montant: "2 500" },
    ],
  },
  tenues: {
    heading: "Tenues scolaires (vendues au lycée)",
    items: [
      { label: "T-shirt",                 montant: "3 000" },
      { label: "Tissu chemise",           montant: "2 000" },
      { label: "Tissu pantalon / jupe",   montant: "2 500" },
      { label: "Tenue de sport",          montant: "8 000" },
      { label: "Macaron",                 montant: "1 000" },
      { label: "Blouse technique (BEP)",  montant: "8 000" },
    ],
  },
  disclaimer: "Les montants sont indiqués en FCFA. La direction se réserve le droit de mettre à jour ces tarifs pour la prochaine rentrée scolaire.",
};
